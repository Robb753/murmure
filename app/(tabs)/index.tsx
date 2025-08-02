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
import { EnhancedSidebar } from "@/components/EnhancedSidebar";

// Types
import { MurmureEntry } from "@/app/lib/storage";
import { createResponsiveMainStyles } from "@/styles/mainPage.styles";

// Constantes
const fontSizes = [16, 20, 24, 28, 32, 36, 40];
const availableFonts = [
  { name: "Georgia", value: "Georgia" },
  {
    name: "Times",
    value: Platform.OS === "ios" ? "Times New Roman" : "Times, serif",
  },
  {
    name: "Helvetica",
    value: Platform.OS === "ios" ? "Helvetica" : "Helvetica, Arial, sans-serif",
  },
  { name: "Arial", value: "Arial" },
  {
    name: "Courier",
    value: Platform.OS === "ios" ? "Courier" : "Courier, monospace",
  },
  {
    name: "System",
    value: Platform.OS === "ios" ? "San Francisco" : "system-ui",
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
    getDaysUntilDeletion,
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

  // Mode focus
  const [focusMode, setFocusMode] = useState(false);
  const [showFocusControls, setShowFocusControls] = useState(false);
  const [showFocusHint, setShowFocusHint] = useState(false);
  const [lastTap, setLastTap] = useState(0);

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
  const exportEntry = useCallback(async (entry: MurmureEntry) => {
    try {
      const content = entry.content;
      const wordCount = content
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      // ✅ Créer un nom de fichier plus lisible
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
        if (Platform.OS !== "web") return;

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${filename}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      // ✅ Fonction pour copier
      const copyToClipboard = async () => {
        try {
          if (Platform.OS === "web") {
            await navigator.clipboard.writeText(content);
          } else {
            await Clipboard.setStringAsync(content);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          Alert.alert(
            "Copié ✨",
            `${wordCount} mots copiés dans le presse-papier`
          );
        } catch (error) {
          console.error("Erreur copie:", error);
          Alert.alert("Erreur", "Impossible de copier le texte");
        }
      };

      // ✅ Fonction pour partager (mobile uniquement)
      const shareContent = async () => {
        if (Platform.OS === "web") {
          // Sur web, fallback vers copie
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
          Alert.alert("Erreur", "Impossible de partager le texte");
        }
      };

      // ✅ Fonction pour sauvegarder un fichier (mobile uniquement)
      const saveFile = async () => {
        if (Platform.OS === "web") {
          Alert.alert(
            "Non disponible",
            "Sur web, utilisez 'Télécharger' pour sauvegarder un fichier."
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
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

          Alert.alert(
            "Fichier créé ✨",
            `Sauvegardé dans Documents/Murmure/\n${filename}.txt`
          );
        } catch (error) {
          console.error("Erreur création fichier:", error);
          Alert.alert("Erreur", "Impossible de créer le fichier");
        }
      };

      // ✅ Menu unifié avec options adaptées à la plateforme
      const menuOptions = [
        {
          text: "📋 Copier le texte",
          onPress: copyToClipboard,
          style: "default" as const,
        },
        ...(Platform.OS === "web"
          ? [
              {
                text: "💾 Télécharger (.txt)",
                onPress: downloadFile,
                style: "default" as const,
              },
            ]
          : [
              {
                text: "📱 Partager",
                onPress: shareContent,
                style: "default" as const,
              },
              {
                text: "📁 Sauvegarder un fichier",
                onPress: saveFile,
                style: "default" as const,
              },
            ]),
        {
          text: "Annuler",
          style: "cancel" as const,
        },
      ];

      Alert.alert(
        "Exporter votre texte",
        `${wordCount} mots • ${dateText}`,
        menuOptions,
        { cancelable: true }
      );
    } catch (error) {
      console.error("Erreur export:", error);
      Alert.alert("Erreur", "Impossible d'exporter le contenu");
    }
  }, []);

  const shareEntry = useCallback(
    async (entry: MurmureEntry): Promise<boolean> => {
      try {
        const content = entry.content;
        const wordCount = content
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length;

        if (Platform.OS === "web") {
          // Web : copie dans le presse-papier
          await navigator.clipboard.writeText(
            `${content}\n\n— Écrit avec Murmure 🌙`
          );
          Alert.alert(
            "Copié ✨",
            `${wordCount} mots copiés dans le presse-papier`
          );
          return true;
        } else {
          // Mobile : partage intelligent
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(`${content}\n\n— Écrit avec Murmure 🌙`);
            return true;
          } else {
            // Fallback : copie dans le presse-papier
            await Clipboard.setStringAsync(content);
            Alert.alert(
              "Texte copié",
              `${wordCount} mots copiés dans le presse-papier`
            );
            return true;
          }
        }
      } catch (error) {
        console.error("Erreur partage:", error);
        Alert.alert("Erreur", "Impossible de partager le contenu");
        return false;
      }
    },
    []
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

  const handleFocusDoubleTap = useCallback(() => {
    if (!focusMode) return;

    const now = Date.now();
    if (now - lastTap < 300) {
      showFocusControlsTemporarily();
    }
    setLastTap(now);
  }, [focusMode, lastTap, showFocusControlsTemporarily]);

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
                    ? "double-clic ou échap pour les contrôles • ctrl+espace pour arrêter"
                    : "double-tap pour les contrôles"}
                </Text>
              </View>
            </Animated.View>
          )}

          <View
            style={{
              position: "absolute",
              top: 40,
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

          <TouchableOpacity
            style={{
              flex: 1,
              paddingHorizontal: design.containerPadding + 20,
              paddingVertical: 60,
              alignItems: "center",
            }}
            onPress={handleFocusDoubleTap}
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

          <View
            style={{
              position: "absolute",
              bottom: design.insets.bottom + 40,
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
                  session en cours
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
                      arrêter
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
                      continuer
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
                  se cache automatiquement dans 4 secondes
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

            {/* Section centre - Timer */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <View
                style={[
                  timerStyles.timerSection,
                  responsiveStyles.responsiveTimerSection,
                ]}
              >
                <View
                  style={[
                    timerStyles.durationButtons,
                    { gap: Platform.OS === "web" ? 3 : 4 },
                  ]}
                >
                  {[5, 10, 15].map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      onPress={() => selectDuration(duration)}
                      style={[
                        timerStyles.durationButton,
                        responsiveStyles.responsiveDurationButton,
                        {
                          backgroundColor:
                            selectedDuration === duration
                              ? currentTheme.accent + "30"
                              : "transparent",
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
                          },
                        ]}
                      >
                        {duration}min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={handleToggleTimer}
                  style={[
                    timerStyles.timerButton,
                    responsiveStyles.responsiveTimerButton,
                    {
                      backgroundColor: isTimerRunning
                        ? currentTheme.accent + "20"
                        : currentTheme.surface,
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
                        },
                      ]}
                    >
                      {formatTime(timeRemaining)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
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

          {/* Zone d'écriture */}
          <View
            style={[
              mainPageStyles.writingContainer,
              responsiveStyles.responsiveWritingContainer,
            ]}
          >
            <View
              style={[
                mainPageStyles.paperSheet,
                responsiveStyles.responsivePaperSheet,
              ]}
            >
              {text.trim() === "" && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    pointerEvents: "none",
                    zIndex: 1,
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
                textAlign="center"
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

      {/* Modales et sidebars inchangées... */}
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
            onShareEntry={shareEntry}
            onMoveToTrash={moveEntryToTrash}
            onRestoreFromTrash={restoreFromTrash}
            onDeletePermanently={deleteEntryPermanently}
            onEmptyTrash={emptyTrash}
            getDaysUntilDeletion={getDaysUntilDeletion}
            onDataChanged={loadData}
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
    </SafeAreaView>
  </Provider>
);
}