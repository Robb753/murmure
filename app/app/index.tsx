import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  Animated,
  Easing,
  BackHandler,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { Provider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// Hooks personnalisés
import { useTimer } from "@/hooks/useTimer";
import { useStorage } from "@/hooks/useStorage";
import { useAudio } from "@/hooks/useAudio";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";
import { useResponsiveDesign } from "@/hooks/useResponsiveDesign";

// Composants et styles
import {
  commonStyles,
  mainPageStyles,
  timerStyles,
  modalStyles,
} from "@/styles";
import ThemeSelector from "@/components/ThemeSelector";
import { useWebAlert } from "@/components/ExportModal";

// Types
import { MurmureEntry } from "@/app/lib/storage";
import { createResponsiveMainStyles } from "@/styles/mainPage.styles";
import { isMobile, isWeb } from "@/utils/platform";
import { EnhancedSidebar } from "@/components/EnhancedSidebar";

// Constantes
const fontSizes = [16, 20, 24, 28, 32, 36, 40];
const availableFonts = [
  {
    name: "Système",
    value: Platform.select({
      ios: "System",
      android: "sans-serif", // Police système Android (Roboto)
      default: "system-ui",
    }),
  },
  {
    name: "Sans-serif",
    value: Platform.select({
      ios: "Helvetica",
      android: "sans-serif", // Roboto normal
      default: "sans-serif",
    }),
  },
  {
    name: "Serif",
    value: Platform.select({
      ios: "Times New Roman",
      android: "serif", // Police serif Android (Noto Serif)
      default: "serif",
    }),
  },
  {
    name: "Monospace",
    value: Platform.select({
      ios: "Courier",
      android: "monospace", // Police monospace Android (Droid Sans Mono)
      default: "monospace",
    }),
  },
  {
    name: "Condensé",
    value: Platform.select({
      ios: "Helvetica Neue",
      android: "sans-serif-condensed", // Police condensée Android
      default: "sans-serif",
    }),
  },
  {
    name: "Léger",
    value: Platform.select({
      ios: "Helvetica-Light",
      android: "sans-serif-light", // Police légère Android
      default: "sans-serif",
    }),
  },
  {
    name: "Fin",
    value: Platform.select({
      ios: "Helvetica-Thin",
      android: "sans-serif-thin", // Police fine Android
      default: "sans-serif",
    }),
  },
  {
    name: "Medium",
    value: Platform.select({
      ios: "Helvetica-Medium",
      android: "sans-serif-medium", // Police medium Android
      default: "sans-serif",
    }),
  },
];

// ✅ Phrases d'inspiration douces
const inspirationPhrases = [
  "Laisse tes pensées couler comme de l'eau...",
  "Qu'est-ce qui murmure en toi aujourd'hui ?",
  "Écris sans destination, juste pour le voyage...",
  "Tes mots n'ont pas besoin d'être parfaits...",
  "Que dirais-tu à ton moi d'hier ?",
  "Respire et laisse venir ce qui vient...",
  "Tes émotions ont leur propre sagesse...",
  "Écris comme si personne ne lisait...",
  "Qu'est-ce qui demande à être dit ?",
  "Ton cœur a des mots que ton esprit ignore...",
  "Quel secret portes-tu depuis longtemps ?",
  "Laisse tes doutes s'exprimer librement...",
  "Si tu pouvais écrire une lettre au temps...",
  "Qu'est-ce qui te rend vivant en ce moment ?",
  "Écris ce que tu n'oses dire à voix haute...",
  "Dans le silence, que murmure ton âme ?",
  "Tes rêves les plus fous méritent des mots...",
  "Qu'est-ce qui te manque aujourd'hui ?",
  "Écris pour celui que tu étais avant...",
  "Laisse tes contradictions danser ensemble...",
];

export default function TabOneScreen() {
  // ===============================
  // HOOKS PERSONNALISÉS (au début)
  // ===============================

  const design = useResponsiveDesign();

  const {
    currentTheme,
    isDarkMode,
    toggleDarkMode,
    currentThemeName,
    changeTheme,
    getThemesList,
  } = useAdvancedTheme();

  const { loadSounds, playSound, cleanupSounds } = useAudio();

  const {
    currentEntry,
    entries,
    trashEntries,
    text,
    wordCount,
    setText,
    loadData,
    saveCurrentEntry,
    createNewSession,
    loadEntry,
    moveEntryToTrash,
    restoreFromTrash,
    deleteEntryPermanently,
    emptyTrash,
  } = useStorage();

  const {
    timeRemaining,
    selectedDuration,
    isTimerRunning,
    selectDuration,
    toggleTimer,
    resetTimer,
    formatTime,
  } = useTimer({ playSound });

  // ===============================
  // ÉTATS SIMPLIFIÉS
  // ===============================

  // Interface utilisateur
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fontSize, setFontSize] = useState(28);
  const [selectedFont, setSelectedFont] = useState("Georgia");
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // ✅ Nouveaux états pour les fonctionnalités
  const [currentInspiration, setCurrentInspiration] = useState("");
  const { showAlert, AlertModal } = useWebAlert(currentTheme);

  // Mode focus
  const [focusMode, setFocusMode] = useState(false);
  const [showFocusControls, setShowFocusControls] = useState(false);
  const [showFocusHint, setShowFocusHint] = useState(false);

  // Placeholders
  const placeholders = useMemo(
    () => [
      "écris tes pensées...",
      "que ressens-tu ?",
      "laisse couler tes idées...",
      "commence par n'importe quoi...",
      "tes murmures du moment...",
    ],
    []
  );
  const [placeholder, setPlaceholder] = useState("");

  // ===============================
  // RÉFÉRENCES ET ANIMATIONS
  // ===============================

  const textInputRef = useRef<TextInput>(null);
  const focusModeRef = useRef(false);
  const focusControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleStopTimerRef = useRef<(() => Promise<void>) | null>(null);
  const showFocusControlsTemporarilyRef = useRef<(() => void) | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [sidebarAnimation] = useState(new Animated.Value(350));
  const [overlayAnimation] = useState(new Animated.Value(0));

  const responsiveStyles = createResponsiveMainStyles(design);

  // ===============================
  // NOUVELLES FONCTIONS SIMPLIFIÉES
  // ===============================
const createWebHoverHandlers = (
  currentTheme: any,
  isActive: boolean = false
) => {
  if (Platform.OS !== "web") {
    return { onMouseEnter: undefined, onMouseLeave: undefined };
  }

  return {
    onMouseEnter: (e: any) => {
      const target = e.currentTarget;
      target.style.cursor = isActive ? "pointer" : "not-allowed";
      if (isActive) {
        target.style.backgroundColor = currentTheme.surface;
        target.style.transform = "translateY(-1px)";
        target.style.boxShadow = `0 2px 8px ${currentTheme.accent}20`;
        target.style.transition = "all 0.2s ease";
      }
    },
    onMouseLeave: (e: any) => {
      const target = e.currentTarget;
      if (isActive) {
        target.style.backgroundColor = "transparent";
        target.style.transform = "translateY(0px)";
        target.style.boxShadow = "none";
      }
    },
  };
};

  // ✅ Export d'une entrée (txt ou md + presse-papier)
  const exportEntry = useCallback(
    async (entry: MurmureEntry) => {
      try {
        const content = entry.content;
        const wordCount = content
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length;

        const date = new Date(entry.createdAt);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        const filename = `murmure-${year}-${month}-${day}-${hours}h${minutes}`;
        const dateText = `${day}/${month}/${year} à ${hours}:${minutes}`;

        // ✅ Fonction pour télécharger (web uniquement)
        const downloadFile = async () => {
          if (!isWeb()) return;

          try {
            console.log("🌐 [Export Web] Début du téléchargement...");

            const blob = new Blob([content], {
              type: "text/plain;charset=utf-8",
            });

            // API File System Access moderne
            if ("showSaveFilePicker" in window) {
              try {
                const fileHandle = await (window as any).showSaveFilePicker({
                  suggestedName: `${filename}.txt`,
                  types: [
                    {
                      description: "Fichiers texte",
                      accept: {
                        "text/plain": [".txt"],
                      },
                    },
                  ],
                });

                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();

                console.log(
                  "✅ [Export Web] Téléchargement réussi avec File System Access API"
                );

                showAlert("Export réussi ✨", `${wordCount} mots exportés`, [
                  { text: "OK", onPress: () => {} },
                ]);
                return;
              } catch (error) {
                if (error instanceof Error && error.name === "AbortError") {
                  console.log(
                    "👤 [Export Web] Téléchargement annulé par l'utilisateur"
                  );
                  return;
                }

                console.log(
                  "📁 [Export Web] File System Access échoué, fallback vers méthode classique...",
                  error
                );
              }
            }

            // Méthode classique
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = `${filename}.txt`;
            a.style.display = "none";

            document.body.appendChild(a);
            void a.offsetHeight;
            a.click();

            console.log(
              "✅ [Export Web] Clic déclenché sur l'élément de téléchargement"
            );

            setTimeout(() => {
              try {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log("🧹 [Export Web] Nettoyage terminé");
              } catch (cleanupError) {
                console.warn(
                  "⚠️ [Export Web] Erreur lors du nettoyage:",
                  cleanupError
                );
              }
            }, 100);

            showAlert(
              "Export réussi ✨",
              `${wordCount} mots exportés en .txt`,
              [{ text: "OK", onPress: () => {} }]
            );
          } catch (error) {
            console.error(
              "❌ [Export Web] Erreur lors du téléchargement:",
              error
            );
            showAlert("Erreur", "Impossible de télécharger le fichier", [
              { text: "OK", onPress: () => {} },
            ]);
          }
        };

        // ✅ Fonction pour copier
        const copyToClipboard = async () => {
          try {
            if (isWeb()) {
              await navigator.clipboard.writeText(content);
            } else {
              await Clipboard.setStringAsync(content);
              if (isMobile()) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }

            showAlert(
              "Copié ✨",
              `${wordCount} mots copiés dans le presse-papier`,
              [{ text: "OK", onPress: () => {} }]
            );
          } catch (error) {
            console.error("Erreur copie:", error);
            showAlert("Erreur", "Impossible de copier le texte", [
              { text: "OK", onPress: () => {} },
            ]);
          }
        };

        // ✅ Fonction pour partager (mobile uniquement)
        const shareContent = async () => {
          if (isWeb()) {
            await copyToClipboard();
            return;
          }

          try {
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(`${content}\n\n— Écrit avec Murmure 🌙`);
            } else {
              await copyToClipboard();
            }
          } catch (error) {
            console.error("Erreur partage:", error);
            showAlert("Erreur", "Impossible de partager le texte", [
              { text: "OK", onPress: () => {} },
            ]);
          }
        };

        // ✅ Fonction pour sauvegarder un fichier (mobile uniquement)
        const saveFile = async () => {
          if (isWeb()) {
            showAlert(
              "Non disponible",
              "Sur web, utilisez 'Télécharger' pour sauvegarder un fichier.",
              [{ text: "OK", onPress: () => {} }]
            );
            return;
          }

          try {
            const documentsDir = FileSystem.documentDirectory + "Murmure/";
            const dirInfo = await FileSystem.getInfoAsync(documentsDir);

            if (!dirInfo.exists) {
              await FileSystem.makeDirectoryAsync(documentsDir, {
                intermediates: true,
              });
            }

            const fileUri = `${documentsDir}${filename}.txt`;
            await FileSystem.writeAsStringAsync(fileUri, content);

            if (isMobile()) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }

            showAlert(
              "Fichier créé ✨",
              `Sauvegardé dans Documents/Murmure/\n${filename}.txt`,
              [{ text: "OK", onPress: () => {} }]
            );
          } catch (error) {
            console.error("Erreur création fichier:", error);
            showAlert("Erreur", "Impossible de créer le fichier", [
              { text: "OK", onPress: () => {} },
            ]);
          }
        };

        // ✅ Créer les options avec typage correct
        const menuOptions: {
          text: string;
          icon: string;
          description: string;
          onPress: () => void;
          style: "default" | "cancel" | "destructive";
        }[] = [
          {
            text: "Copier le texte",
            icon: "📋",
            description: "Copier dans le presse-papier",
            onPress: copyToClipboard,
            style: "default",
          },
        ];

        // Ajouter options spécifiques à la plateforme
        if (isWeb()) {
          menuOptions.push({
            text: "Télécharger (.txt)",
            icon: "💾",
            description: "Sauvegarder sur votre ordinateur",
            onPress: downloadFile,
            style: "default",
          });
        } else {
          menuOptions.push({
            text: "Partager",
            icon: "📱",
            description: "Partager via vos applications",
            onPress: shareContent,
            style: "default",
          });

          menuOptions.push({
            text: "Sauvegarder un fichier",
            icon: "📁",
            description: "Créer un fichier dans Documents",
            onPress: saveFile,
            style: "default",
          });
        }

        menuOptions.push({
          text: "Annuler",
          icon: "",
          description: "",
          onPress: () => {},
          style: "cancel",
        });

        // ✅ Afficher la modal améliorée
        showAlert(
          "Exporter votre texte",
          `${wordCount} mots • ${dateText}`,
          menuOptions
        );
      } catch (error) {
        console.error("Erreur export:", error);
        showAlert("Erreur", "Impossible d'exporter le contenu", [
          { text: "OK", onPress: () => {} },
        ]);
      }
    },
    [showAlert]
  ); 

  const cleanupOldFiles = useCallback(async () => {
    // Ne faire le nettoyage que sur mobile
    if (Platform.OS !== "web") {
      try {
        const murmureDir = FileSystem.documentDirectory + "Murmure/";
        const dirInfo = await FileSystem.getInfoAsync(murmureDir);

        if (dirInfo.exists) {
          const files = await FileSystem.readDirectoryAsync(murmureDir);
          console.log(`📁 ${files.length} fichiers trouvés dans Murmure/`);

          // Pour l'instant, juste logger. Tu peux implémenter le nettoyage plus tard
          // si vraiment nécessaire
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erreur inconnue";
        console.warn("Nettoyage ignoré:", errorMessage);
      }
    }
  }, []);

  // 6. Appeler le nettoyage au démarrage (dans un useEffect)
  useEffect(() => {
    // Nettoyage des anciens fichiers au démarrage
    cleanupOldFiles();
  }, [cleanupOldFiles]);

  

  // ✅ Générateur d'inspiration
  const getInspiration = useCallback(() => {
    const randomPhrase =
      inspirationPhrases[Math.floor(Math.random() * inspirationPhrases.length)];
    setCurrentInspiration(randomPhrase);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Afficher l'inspiration pendant 4 secondes
    setTimeout(() => {
      setCurrentInspiration("");
    }, 6000);
  }, []);

  // ===============================
  // GESTION SIDEBAR ANIMÉE
  // ===============================

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
    Animated.parallel([
      Animated.timing(sidebarAnimation, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnimation, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [sidebarAnimation, overlayAnimation]);

  const closeSidebar = useCallback(() => {
    Animated.parallel([
      Animated.timing(sidebarAnimation, {
        toValue: 350,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnimation, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSidebarOpen(false);
    });
  }, [sidebarAnimation, overlayAnimation]);

  // ===============================
  // GESTION SESSIONS SIMPLIFIÉE
  // ===============================

  const handleCreateNewSession = useCallback(async () => {
    const performCreation = async () => {
      const result = await createNewSession();
      if (result.success) {
        setTimeout(() => textInputRef.current?.focus(), 100);
      }
    };

    if (text.trim()) {
      if (Platform.OS === "web") {
        const confirmed = window.confirm(
          "Créer une nouvelle session ?\n\nVotre travail actuel sera sauvegardé automatiquement."
        );
        if (!confirmed) return;
      } else {
        Alert.alert(
          "Créer une nouvelle session ?",
          "Votre travail actuel sera sauvegardé automatiquement.",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Nouvelle session", onPress: performCreation },
          ]
        );
        return;
      }
    }
    await performCreation();
  }, [text, createNewSession]);

  // ===============================
  // GESTION MODE FOCUS SIMPLIFIÉE
  // ===============================

  const handleStopTimer = useCallback(async () => {
    await toggleTimer();
    setFocusMode(false);
    focusModeRef.current = false;
    setShowFocusControls(false);
    setShowFocusHint(false);

    if (focusControlsTimeoutRef.current) {
      clearTimeout(focusControlsTimeoutRef.current);
    }
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [toggleTimer, fadeAnim]);

  const showFocusControlsTemporarily = useCallback(() => {
    setShowFocusControls(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (focusControlsTimeoutRef.current) {
      clearTimeout(focusControlsTimeoutRef.current);
    }

    focusControlsTimeoutRef.current = setTimeout(() => {
      setShowFocusControls(false);
    }, 4000);
  }, []);

  const handleToggleTimer = useCallback(async () => {
    await toggleTimer();

    if (!isTimerRunning) {
      setFocusMode(true);
      focusModeRef.current = true;
      closeSidebar();
      setShowFocusHint(true);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      hintTimeoutRef.current = setTimeout(() => {
        setShowFocusHint(false);
      }, 3000);

      setTimeout(() => textInputRef.current?.focus(), 100);
    } else {
      handleStopTimer();
    }
  }, [toggleTimer, isTimerRunning, closeSidebar, fadeAnim, handleStopTimer]);



  const continueFocusSession = useCallback(() => {
    setShowFocusControls(false);
    if (focusControlsTimeoutRef.current) {
      clearTimeout(focusControlsTimeoutRef.current);
    }
  }, []);

  // ===============================
  // GESTION TIMER ET FIN DE SESSION
  // ===============================

  const handleTimerEnd = useCallback(async () => {
    setFocusMode(false);
    focusModeRef.current = false;

    const createNewSessionFromTimer = async () => {
      resetTimer();
      const result = await createNewSession();
      if (result.success) {
        setTimeout(() => textInputRef.current?.focus(), 100);
      }
    };

    Alert.alert(
      "Session terminée ✨",
      `${wordCount} mots écrits en ${selectedDuration} minutes !`,
      [
        {
          text: "Continuer",
          onPress: () => resetTimer(),
        },
        {
          text: "Nouvelle session",
          onPress: createNewSessionFromTimer,
        },
      ]
    );
  }, [wordCount, selectedDuration, resetTimer, createNewSession]);

  // ===============================
  // GESTION PRÉFÉRENCES SIMPLIFIÉE
  // ===============================

  const toggleFontSizeMenu = useCallback(() => {
    setShowFontSizeMenu(!showFontSizeMenu);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [showFontSizeMenu]);

  const changeRandomFont = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * availableFonts.length);
    const randomFont = availableFonts[randomIndex];
    setSelectedFont(randomFont.value);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const selectFontSize = useCallback((size: number) => {
    setFontSize(size);
    setShowFontSizeMenu(false);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  // ===============================
  // EFFETS ET CHARGEMENT
  // ===============================

  useEffect(() => {
    handleStopTimerRef.current = handleStopTimer;
    showFocusControlsTemporarilyRef.current = showFocusControlsTemporarily;
    focusModeRef.current = focusMode;
  }, [handleStopTimer, showFocusControlsTemporarily, focusMode]);

  useEffect(() => {
    if (timeRemaining === 0 && isTimerRunning) {
      handleTimerEnd();
    }
  }, [timeRemaining, isTimerRunning, handleTimerEnd]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadSounds();
      setPlaceholder(
        placeholders[Math.floor(Math.random() * placeholders.length)]
      );
      return () => {
        cleanupSounds();
      };
    }, [placeholders, loadData, loadSounds, cleanupSounds])
  );

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const backAction = () => {
      if (focusModeRef.current) {
        showFocusControlsTemporarilyRef.current?.();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  // Sauvegarde avant fermeture
  useEffect(() => {
    if (Platform.OS === "web") {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (currentEntry && text.trim()) {
          saveCurrentEntry();
          e.preventDefault();
          e.returnValue = "";
        }
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [currentEntry, text, saveCurrentEntry]);

  // Sauvegarde périodique
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentEntry && text.trim() && text !== currentEntry.content) {
        saveCurrentEntry().catch(console.warn);
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [currentEntry, text, saveCurrentEntry]);

  // Raccourcis clavier
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!focusModeRef.current) return;

      if ((e.ctrlKey || e.metaKey) && e.code === "Space") {
        e.preventDefault();
        e.stopPropagation();
        handleStopTimerRef.current?.();
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        showFocusControlsTemporarilyRef.current?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  // ===============================
  // RENDU MODE FOCUS
  // ===============================

  if (focusMode) {
    return (
      <Provider>
        <SafeAreaView
          style={[
            commonStyles.container,
            { backgroundColor: currentTheme.background },
          ]}
          edges={["top", "bottom"]}
        >
          <StatusBar style="dark" />

          <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
            {showFocusHint && (
              <Animated.View
                style={{
                  position: "absolute",
                  top: 60,
                  left: 0,
                  right: 0,
                  zIndex: 50,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: currentTheme.text + "90",
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 25,
                  }}
                >
                  <Text
                    style={{
                      color: currentTheme.background,
                      fontSize: 14,
                      fontWeight: "500",
                      textAlign: "center",
                    }}
                  >
                    {Platform.OS === "web"
                      ? ".. ou Echap pour sortir"
                      : Platform.OS === "android"
                      ? "... ou Retour pour sortir"
                      : "bouton ... ou appui long pour les contrôles"}
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* ✅ NOUVEAU: Bouton ✕ flottant en haut à gauche */}
            <TouchableOpacity
              style={{
                position: "absolute",
                top: design.insets.top + 20,
                left: 30,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: currentTheme.text + "15",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 60,
                // Ombre subtile pour le faire ressortir
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 1,
              }}
              onPress={showFocusControlsTemporarily} // ✅ CHANGEMENT: showFocusControlsTemporarily au lieu de handleStopTimer
              accessibilityLabel="Afficher les contrôles du mode focus"
              accessibilityRole="button"
            >
              <Text
                style={{
                  color: currentTheme.text,
                  fontSize: 18,
                  fontWeight: "300",
                  lineHeight: 18,
                }}
              >
                ⋯
              </Text>
            </TouchableOpacity>

            {/* Timer en haut à droite (inchangé) */}
            <View
              style={{
                position: "absolute",
                top: design.insets.top + 20,
                right: 30,
                zIndex: 40,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                  color: currentTheme.muted,
                }}
              >
                {formatTime(timeRemaining)}
              </Text>
            </View>

            {/* Zone d'écriture avec support long press amélioré */}
            <TouchableOpacity
              style={{
                flex: 1,
                paddingTop: design.insets.top + 55,
                paddingBottom: design.insets.bottom + 55,
                paddingHorizontal: design.containerPadding + 10,
                paddingVertical: 60,
                alignItems: "center",
              }}
              delayLongPress={800}
              activeOpacity={1}
            >
              <View
                style={{
                  width: "100%",
                  maxWidth: 1150,
                  height: "100%",
                  position: "relative",
                }}
              >
                {text.trim() === "" && (
                  <View
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: 40,
                      right: 40,
                      transform: [{ translateY: -20 }],
                      alignItems: "center",
                      pointerEvents: "none",
                      zIndex: 1,
                    }}
                  >
                    <Text
                      style={{
                        color: currentTheme.muted,
                        fontSize: design.isSmallScreen
                          ? fontSize
                          : fontSize + 4,
                        fontFamily: selectedFont,
                        textAlign: "center",
                        opacity: 0.7,
                      }}
                    >
                      {currentInspiration || placeholder}
                    </Text>
                  </View>
                )}

                <TextInput
                  ref={textInputRef}
                  key={`focus-${fontSize}-${selectedFont}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    color: currentTheme.text,
                    fontSize: design.isSmallScreen ? fontSize : fontSize + 4,
                    lineHeight:
                      (design.isSmallScreen ? fontSize : fontSize + 4) * 1.6,
                    fontFamily: selectedFont,
                    textAlign: "left",
                    textAlignVertical: "top",
                    borderWidth: 0,
                    borderColor: "transparent",
                    backgroundColor: "transparent",
                    paddingTop: 20,
                    paddingBottom: 20,
                    paddingHorizontal: 10,
                    ...(Platform.OS === "web" && {
                      outline: "none",
                      border: "none",
                      boxShadow: "none",
                      resize: "none",
                    }),
                  }}
                  value={text}
                  onChangeText={setText}
                  placeholder=""
                  multiline
                  autoCorrect={false}
                  spellCheck={false}
                  autoCapitalize="none"
                  scrollEnabled={true}
                  selectionColor={currentTheme.accent + "40"}
                  underlineColorAndroid="transparent"
                />
              </View>
            </TouchableOpacity>

            {/* Indicateur session en cours en bas (inchangé) */}
            <View
              style={{
                position: "absolute",
                bottom: design.insets.bottom + 1,
                left: 0,
                right: 0,
                alignItems: "center",
                zIndex: 40,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: currentTheme.muted,
                }}
              >
                ● session en cours • {wordCount} mot{wordCount > 1 ? "s" : ""}
              </Text>
            </View>

            {/* Modal des contrôles (inchangé) */}
            {showFocusControls && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 100,
                }}
              >
                <View
                  style={{
                    backgroundColor: currentTheme.surface,
                    borderRadius: 20,
                    padding: 32,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.25,
                    shadowRadius: 20,
                    elevation: 15,
                    minWidth: 300,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: currentTheme.textSecondary,
                      marginBottom: 16,
                    }}
                  >
                    Session en cours
                  </Text>

                  <Text
                    style={{
                      fontSize: 32,
                      fontFamily:
                        Platform.OS === "ios" ? "Courier" : "monospace",
                      color: currentTheme.text,
                      marginBottom: 24,
                      fontWeight: "600",
                    }}
                  >
                    {formatTime(timeRemaining)}
                  </Text>

                  <View style={{ flexDirection: "row", gap: 16 }}>
                    <TouchableOpacity
                      onPress={handleStopTimer}
                      style={{
                        backgroundColor: "#ef4444",
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 16 }}>⏹</Text>
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "500",
                        }}
                      >
                        Arrêter
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={continueFocusSession}
                      style={{
                        backgroundColor: currentTheme.accent,
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 16 }}>↩</Text>
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "500",
                        }}
                      >
                        Continuer
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text
                    style={{
                      fontSize: 12,
                      color: currentTheme.muted,
                      marginTop: 16,
                      textAlign: "center",
                    }}
                  >
                    Se cache automatiquement dans 4 secondes
                  </Text>
                </View>
              </View>
            )}
          </Animated.View>
        </SafeAreaView>
      </Provider>
    );
  }

// ✅ MODE NORMAL CORRIGÉ
return (
  <Provider>
    <SafeAreaView
      style={[
        commonStyles.container,
        {
          backgroundColor: currentTheme.background,
          paddingHorizontal: design.containerPadding,
        },
      ]}
      edges={["top", "bottom"]}
    >
      <StatusBar style="dark" />

      <View style={commonStyles.layout}>
        <View style={mainPageStyles.mainArea}>
          {/* ✅ Header corrigé avec structure en 3 colonnes */}
          <View>
            {/* Premier header avec les boutons principaux */}
            <View
              style={[
                mainPageStyles.header,
                responsiveStyles.responsiveHeader,
                { borderBottomColor: currentTheme.border },
              ]}
            >
              {/* Section gauche */}
              <View style={{ flex: 1, alignItems: "flex-start" }}>
                <TouchableOpacity
                  onPress={handleCreateNewSession}
                  style={[
                    mainPageStyles.headerButton,
                    responsiveStyles.responsiveHeaderButton,
                    { backgroundColor: currentTheme.surface },
                  ]}
                  {...createWebHoverHandlers(currentTheme, true)}
                >
                  <Text
                    style={[
                      mainPageStyles.headerButtonText,
                      {
                        color: currentTheme.text,
                        fontSize: Platform.OS === "web" ? 14 : 16,
                      },
                    ]}
                  >
                    + nouveau
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Section droite */}
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <TouchableOpacity
                  onPress={openSidebar}
                  style={[
                    mainPageStyles.headerButton,
                    responsiveStyles.responsiveHeaderButton,
                    {
                      backgroundColor: sidebarOpen
                        ? currentTheme.accent + "20"
                        : currentTheme.surface,
                    },
                  ]}
                  {...createWebHoverHandlers(currentTheme, !sidebarOpen)}
                >
                  <Text
                    style={[
                      mainPageStyles.headerButtonText,
                      {
                        color: currentTheme.text,
                        fontSize: Platform.OS === "web" ? 14 : 16,
                      },
                    ]}
                  >
                    historique
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section timer séparée */}
            <View
              style={{
                paddingHorizontal: design.containerPadding,
                paddingVertical: Platform.OS === "web" ? 8 : 12,
                borderBottomWidth: 1,
                borderBottomColor: currentTheme.border,
                backgroundColor: currentTheme.background,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={[
                  timerStyles.timerSection,
                  {
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  },
                ]}
              >
                {/* Durées sur une ligne */}
                <View
                  style={[
                    timerStyles.durationButtons,
                    {
                      gap: Platform.OS === "web" ? 8 : 12,
                      justifyContent: "center",
                    },
                  ]}
                >
                  {[5, 10, 15].map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      onPress={() => selectDuration(duration)}
                      style={[
                        timerStyles.durationButton,
                        {
                          backgroundColor:
                            selectedDuration === duration
                              ? currentTheme.accent + "30"
                              : currentTheme.surface,
                          borderWidth: 1,
                          borderColor:
                            selectedDuration === duration
                              ? currentTheme.accent
                              : currentTheme.border,
                          paddingHorizontal: Platform.OS === "web" ? 12 : 16,
                          paddingVertical: Platform.OS === "web" ? 6 : 8,
                          borderRadius: 12,
                          minWidth: Platform.OS === "web" ? 50 : 60,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          timerStyles.durationButtonText,
                          {
                            color:
                              selectedDuration === duration
                                ? currentTheme.accent
                                : currentTheme.textSecondary,
                            fontSize: Platform.OS === "web" ? 12 : 14,
                            fontWeight:
                              selectedDuration === duration ? "600" : "400",
                          },
                        ]}
                      >
                        {duration}min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Bouton timer sur la ligne suivante */}
                <TouchableOpacity
                  onPress={handleToggleTimer}
                  style={[
                    timerStyles.timerButton,
                    {
                      backgroundColor: isTimerRunning
                        ? currentTheme.accent + "20"
                        : currentTheme.surface,
                      borderWidth: 1,
                      borderColor: isTimerRunning
                        ? currentTheme.accent
                        : currentTheme.border,
                      paddingHorizontal: Platform.OS === "web" ? 16 : 20,
                      paddingVertical: Platform.OS === "web" ? 8 : 10,
                      borderRadius: 12,
                      minWidth: Platform.OS === "web" ? 140 : 160,
                    },
                  ]}
                >
                  <View style={timerStyles.timerContent}>
                    <Text
                      style={[
                        timerStyles.timerIcon,
                        {
                          color: isTimerRunning
                            ? currentTheme.accent
                            : currentTheme.textSecondary,
                          fontSize: Platform.OS === "web" ? 14 : 16,
                        },
                      ]}
                    >
                      {isTimerRunning ? "⏸" : "▶"}
                    </Text>
                    <Text
                      style={[
                        timerStyles.timerText,
                        {
                          color: isTimerRunning
                            ? currentTheme.accent
                            : currentTheme.text,
                          fontSize: Platform.OS === "web" ? 14 : 16,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {formatTime(timeRemaining)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Zone d'écriture */}
          <View
            style={[
              mainPageStyles.writingContainer,
              responsiveStyles.responsiveWritingContainer,
              {
                // ✅ NOUVEAU: Augmenter la zone de texte en mode normal
                paddingVertical: 5, // ✅ RÉDUIT: pour plus d'espace au texte
                paddingHorizontal: 10, // ✅ RÉDUIT: pour plus de largeur
              },
            ]}
          >
            <View
              style={[
                mainPageStyles.paperSheet,
                responsiveStyles.responsivePaperSheet,
                {
                  // ✅ NOUVEAU: Optimiser l'espace du paperSheet
                  marginBottom: 1, // ✅ RÉDUIT: était 20
                  padding: 15, // ✅ RÉDUIT: pour maximiser l'espace de texte
                },
              ]}
            >
              {text.trim() === "" && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 5,
                    justifyContent: "center",
                    alignItems: "center",
                    pointerEvents: "none",
                    zIndex: 1,
                    paddingHorizontal: 30,
                    paddingVertical: 30,
                  }}
                >
                  <Text
                    style={{
                      color: currentTheme.muted,
                      fontSize: fontSize,
                      fontFamily: selectedFont,
                      textAlign: "center",
                      opacity: 0.7,
                    }}
                  >
                    {currentInspiration || placeholder}
                  </Text>
                </View>
              )}

              <TextInput
                ref={textInputRef}
                key={`${fontSize}-${selectedFont}`}
                style={[
                  mainPageStyles.textInput,
                  {
                    color: currentTheme.text,
                    fontSize: design.isSmallScreen
                      ? Math.max(fontSize - 2, 16)
                      : fontSize,
                    lineHeight:
                      (design.isSmallScreen
                        ? Math.max(fontSize - 2, 16)
                        : fontSize) * 1.6,
                    fontFamily: selectedFont,
                    textAlign: "left",
                    textAlignVertical: "top",
                    borderWidth: 0,
                    borderColor: "transparent",
                    paddingHorizontal: 15,
                    paddingVertical: 15,
                    ...(Platform.OS === "web" && {
                      outline: "none",
                      border: "none",
                      boxShadow: "none",
                    }),
                  },
                ]}
                value={text}
                onChangeText={setText}
                placeholder=""
                placeholderTextColor={currentTheme.muted}
                multiline
                textAlign="left"
                textAlignVertical="center"
                autoCorrect={false}
                spellCheck={false}
                autoCapitalize="none"
                scrollEnabled={true}
                selectionColor={currentTheme.accent + "40"}
                underlineColorAndroid="transparent"
              />
            </View>
          </View>

          {/* Footer */}
          <View
            style={[
              mainPageStyles.footer,
              responsiveStyles.responsiveFooter,
              { borderTopColor: currentTheme.border },
            ]}
          >
            <View
              style={[
                mainPageStyles.footerLeft,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  flex: 0,
                  minWidth: 80,
                },
              ]}
            >
              <Text
                style={[
                  mainPageStyles.wordCount,
                  { color: currentTheme.textSecondary, flexShrink: 0 },
                ]}
                numberOfLines={1}
              >
                {wordCount} mot{wordCount > 1 ? "s" : ""}
              </Text>
            </View>

            <View style={[mainPageStyles.footerCenter, { flex: 1 }]}>
              {isTimerRunning && (
                <Text
                  style={[
                    mainPageStyles.runningIndicator,
                    { color: currentTheme.accent },
                  ]}
                  numberOfLines={1}
                >
                  ● session en cours • {formatTime(timeRemaining)}
                </Text>
              )}
            </View>

            {/* Footer droit */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: design.isSmallScreen ? 8 : 12,
                minWidth: 200,
                flex: 0,
              }}
            >
              {/* Taille de police */}
              <TouchableOpacity
                onPress={toggleFontSizeMenu}
                style={[
                  mainPageStyles.footerButton,
                  responsiveStyles.responsiveFooterButton,
                ]}
                {...createWebHoverHandlers(currentTheme, true)}
              >
                <Text
                  style={[
                    mainPageStyles.footerButtonText,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  {fontSize}px
                </Text>
              </TouchableOpacity>

              {/* Police aléatoire */}
              <TouchableOpacity
                onPress={changeRandomFont}
                style={[
                  mainPageStyles.footerButton,
                  responsiveStyles.responsiveFooterButton,
                ]}
                {...createWebHoverHandlers(currentTheme, true)}
              >
                <Text
                  style={[
                    mainPageStyles.footerButtonText,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  Aa
                </Text>
              </TouchableOpacity>

              {/* Thème */}
              <TouchableOpacity
                onPress={() => setShowThemeSelector(true)}
                style={[
                  mainPageStyles.footerButton,
                  responsiveStyles.responsiveFooterButton,
                ]}
                {...createWebHoverHandlers(currentTheme, true)}
              >
                <Text
                  style={[
                    mainPageStyles.footerButtonText,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  🎨
                </Text>
              </TouchableOpacity>

              {/* Inspiration */}
              <TouchableOpacity
                onPress={getInspiration}
                style={[
                  mainPageStyles.footerButton,
                  responsiveStyles.responsiveFooterButton,
                ]}
                {...createWebHoverHandlers(currentTheme, true)}
              >
                <Text
                  style={[
                    mainPageStyles.footerButtonText,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  💫
                </Text>
              </TouchableOpacity>

              {/* Export */}
              <TouchableOpacity
                onPress={() => {
                  if (currentEntry && text.trim()) {
                    exportEntry(currentEntry);
                  } else {
                    Alert.alert(
                      "Rien à exporter",
                      "Écrivez quelque chose d'abord"
                    );
                  }
                }}
                style={[
                  mainPageStyles.footerButton,
                  responsiveStyles.responsiveFooterButton,
                  {
                    opacity: currentEntry && text.trim() ? 1 : 0.5,
                  },
                ]}
                {...createWebHoverHandlers(
                  currentTheme,
                  !!(currentEntry && text.trim())
                )}
              >
                <Text
                  style={[
                    mainPageStyles.footerButtonText,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  📤
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Modal sélection taille */}
      <Modal
        visible={showFontSizeMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFontSizeMenu(false)}
      >
        <TouchableOpacity
          style={modalStyles.modalOverlay}
          onPress={() => setShowFontSizeMenu(false)}
          activeOpacity={1}
        >
          <View
            style={[
              modalStyles.modalContent,
              {
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border,
                marginHorizontal: design.containerPadding,
              },
            ]}
          >
            <Text
              style={[modalStyles.modalTitle, { color: currentTheme.text }]}
            >
              taille du texte
            </Text>
            {fontSizes.map((size) => (
              <TouchableOpacity
                key={size}
                onPress={() => selectFontSize(size)}
                style={[
                  modalStyles.modalItem,
                  {
                    backgroundColor:
                      size === fontSize
                        ? currentTheme.accent + "20"
                        : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    modalStyles.modalItemText,
                    {
                      color:
                        size === fontSize
                          ? currentTheme.accent
                          : currentTheme.text,
                      fontWeight: size === fontSize ? "600" : "400",
                    },
                  ]}
                >
                  {size}px
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Overlay sidebar */}
      {sidebarOpen && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 999,
            opacity: overlayAnimation,
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={closeSidebar}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: design.isSmallScreen ? 320 : 350,
            zIndex: 1000,
            transform: [{ translateX: sidebarAnimation }],
          }}
        >
          <EnhancedSidebar
          currentTheme={currentTheme}
          currentEntry={currentEntry}
          entries={entries}
          trashEntries={trashEntries}
          onClose={closeSidebar}
          onLoadEntry={loadEntry}
          onMoveToTrash={moveEntryToTrash}
          onRestoreFromTrash={restoreFromTrash}
          onDeletePermanently={deleteEntryPermanently}
          onEmptyTrash={emptyTrash}
          onExportEntry={exportEntry}
          />
        </Animated.View>
      )}

      {/* Sélecteur de thème */}
      <ThemeSelector
        visible={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
        currentTheme={currentTheme}
        currentThemeName={currentThemeName}
        isDarkMode={isDarkMode}
        onThemeChange={changeTheme}
        onToggleDarkMode={toggleDarkMode}
        getThemesList={getThemesList}
      />
      <AlertModal />
    </SafeAreaView>
  </Provider>
);
}