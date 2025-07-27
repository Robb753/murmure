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
  SafeAreaView,
  Modal,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { Provider } from "react-native-paper";

// Imports des hooks personnalisés
import { useTimer } from "@/hooks/useTimer";
import { useStorage } from "@/hooks/useStorage";
import { useAudio } from "@/hooks/useAudio";
import { useTheme } from "@/hooks/useTheme";

// Import de la nouvelle sidebar
import { EnhancedSidebar } from "@/components/EnhancedSidebar";

import {
  commonStyles,
  mainPageStyles,
  timerStyles,
  modalStyles,
} from "@/styles";
import { PreviewModal } from "@/components/PreviewModal";

// Tailles de police disponibles
const fontSizes = [16, 20, 24, 28, 32, 36, 40];

// Polices disponibles (optimisées pour compatibilité)
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
  { name: "Verdana", value: "Verdana" },
  {
    name: "System",
    value: Platform.OS === "ios" ? "San Francisco" : "system-ui",
  },
  { name: "Serif", value: "serif" },
  { name: "Sans-serif", value: "sans-serif" },
  { name: "Monospace", value: "monospace" },
];

export default function MainPage() {
  // États pour l'interface utilisateur
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fontSize, setFontSize] = useState(28);
  const [selectedFont, setSelectedFont] = useState("Georgia");
  const [selectedFontName, setSelectedFontName] = useState("Georgia");
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);

  // États pour le mode focus
  const [focusMode, setFocusMode] = useState(false);
  const [showFocusControls, setShowFocusControls] = useState(false);
  const [showFocusHint, setShowFocusHint] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const focusControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Références
  const textInputRef = useRef<TextInput>(null);

  // Hooks personnalisés
  const { currentTheme, isDarkMode, toggleDarkMode } = useTheme();
  const { loadSounds, playSound, cleanupSounds } = useAudio();

  // ✅ Hook storage mis à jour avec les nouvelles fonctionnalités
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
    shareEntry,
    // Actions corbeille
    moveEntryToTrash,
    restoreFromTrash,
    deleteEntryPermanently,
    emptyTrash,
    getDaysUntilDeletion,
    // Action preview
    previewEntry,
    isPreviewModalVisible,
    openPreview,
    closePreview,
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

  // Gestion personnalisée de la fin du timer
  useEffect(() => {
    if (timeRemaining === 0 && isTimerRunning) {
      // Sortir du mode focus avant l'alerte
      setFocusMode(false);
      focusModeRef.current = false;

      // Timer terminé, afficher l'alerte personnalisée
      Alert.alert(
        "Session terminée ✨",
        `${wordCount} mots écrits en ${selectedDuration} minutes !`,
        [
          {
            text: "Continuer",
            onPress: () => resetTimer(),
          },
          { text: "Nouvelle session", onPress: createNewSession },
        ]
      );
    }
  }, [
    timeRemaining,
    isTimerRunning,
    wordCount,
    selectedDuration,
    resetTimer,
    createNewSession,
  ]);

  // Placeholders épurés
  const placeholders = useMemo(
    () => [
      "Écris tes pensées...",
      "Que ressens-tu ?",
      "Laisse couler tes idées...",
      "Commence par n'importe quoi...",
      "Tes murmures du moment...",
    ],
    []
  );
  const [placeholder, setPlaceholder] = useState("");

  // Charger les données au démarrage
  useFocusEffect(
    useCallback(() => {
      loadData();
      loadSounds();
      setPlaceholder(
        placeholders[Math.floor(Math.random() * placeholders.length)]
      );
      return () => {
        if (currentEntry && text.trim()) {
          saveCurrentEntry();
        }
        cleanupSounds();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [placeholders])
  );

  // Références pour éviter les problèmes de dépendances
  const focusModeRef = useRef(false);
  const handleStopTimerRef = useRef<(() => Promise<void>) | null>(null);
  const showFocusControlsTemporarilyRef = useRef<(() => void) | null>(null);

  // Gestion du mode focus - Fonctions simples sans useCallback
  const handleStopTimer = async () => {
    await toggleTimer();
    setFocusMode(false);
    focusModeRef.current = false;
    setShowFocusControls(false);
    setShowFocusHint(false);

    // Clear timeouts
    if (focusControlsTimeoutRef.current) {
      clearTimeout(focusControlsTimeoutRef.current);
    }
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }

    // Animation de sortie
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const showFocusControlsTemporarily = () => {
    setShowFocusControls(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Clear existing timeout
    if (focusControlsTimeoutRef.current) {
      clearTimeout(focusControlsTimeoutRef.current);
    }

    // Auto-hide après 4 secondes
    focusControlsTimeoutRef.current = setTimeout(() => {
      setShowFocusControls(false);
    }, 4000);
  };

  // Mettre à jour les refs quand les fonctions changent
  useEffect(() => {
    handleStopTimerRef.current = handleStopTimer;
    showFocusControlsTemporarilyRef.current = showFocusControlsTemporarily;
  });

  useEffect(() => {
    focusModeRef.current = focusMode;
  }, [focusMode]);

  // Gestion des raccourcis clavier pour le mode focus
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Seulement si on est en mode focus
      if (!focusModeRef.current) {
        return;
      }

      // Ctrl/Cmd + Espace pour arrêter
      if ((e.ctrlKey || e.metaKey) && e.code === "Space") {
        e.preventDefault();
        e.stopPropagation();
        if (handleStopTimerRef.current) {
          handleStopTimerRef.current();
        }
      }
      // Échap pour révéler les contrôles
      else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (showFocusControlsTemporarilyRef.current) {
          showFocusControlsTemporarilyRef.current();
        }
      }
    };

    // Écouter sur window avec capture
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  // Gestion des préférences
  const toggleFontSizeMenu = () => {
    setShowFontSizeMenu(!showFontSizeMenu);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Fonction ultra minimaliste pour changer de police aléatoirement
  const changeRandomFont = () => {
    const randomIndex = Math.floor(Math.random() * availableFonts.length);
    const randomFont = availableFonts[randomIndex];

    setSelectedFont(randomFont.value);
    setSelectedFontName(randomFont.name);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const selectFontSize = (size: number) => {
    setFontSize(size);
    setShowFontSizeMenu(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Gestion du mode focus
  const handleToggleTimer = async () => {
    await toggleTimer();

    if (!isTimerRunning) {
      // Démarrer le timer = entrer en mode focus
      setFocusMode(true);
      focusModeRef.current = true;
      setSidebarOpen(false); // Fermer la sidebar
      setShowFocusHint(true);

      // Animation d'entrée
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Masquer le hint après 3 secondes
      hintTimeoutRef.current = setTimeout(() => {
        setShowFocusHint(false);
      }, 3000);

      setTimeout(() => textInputRef.current?.focus(), 100);
    } else {
      // Arrêter le timer = sortir du mode focus
      handleStopTimer();
    }
  };

  // Gestion du double-tap pour révéler les contrôles
  const handleFocusDoubleTap = () => {
    if (!focusMode) return;

    const now = Date.now();
    if (now - lastTap < 300) {
      showFocusControlsTemporarily();
    }
    setLastTap(now);
  };

  const continueFocusSession = () => {
    setShowFocusControls(false);
    if (focusControlsTimeoutRef.current) {
      clearTimeout(focusControlsTimeoutRef.current);
    }
  };

  // Mode Focus - Interface complètement différente
  if (focusMode) {
    return (
      <Provider>
        <SafeAreaView
          style={[
            commonStyles.container,
            { backgroundColor: currentTheme.background },
          ]}
        >
          <StatusBar style="dark" />

          <Animated.View style={[{ flex: 1, opacity: fadeAnim }]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={handleFocusDoubleTap}
              activeOpacity={1}
            >
              {/* Hint d'aide (disparait après 3s) */}
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
                        ? "Double-clic ou Échap pour les contrôles • Ctrl+Espace pour arrêter"
                        : "Double-tap pour les contrôles"}
                    </Text>
                  </View>
                </Animated.View>
              )}

              {/* Timer discret en haut à droite */}
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

              {/* Zone d'écriture plein écran */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 40,
                  paddingVertical: 60,
                }}
                onPress={handleFocusDoubleTap}
                activeOpacity={1}
              >
                <TextInput
                  ref={textInputRef}
                  key={`focus-${fontSize}-${selectedFont}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    color: currentTheme.text,
                    fontSize: fontSize + 4,
                    lineHeight: (fontSize + 4) * 1.6,
                    fontFamily: selectedFont,
                    textAlign: "center",
                    textAlignVertical: "center",
                    borderWidth: 0,
                    borderColor: "transparent",
                    ...(Platform.OS === "web" && {
                      outline: "none",
                      border: "none",
                      boxShadow: "none",
                    }),
                  }}
                  value={text}
                  onChangeText={setText}
                  placeholder={placeholder}
                  placeholderTextColor={currentTheme.muted}
                  multiline
                  autoCorrect={false}
                  spellCheck={false}
                  autoCapitalize="none"
                  scrollEnabled={true}
                  selectionColor={currentTheme.accent + "40"}
                  underlineColorAndroid="transparent"
                />
              </TouchableOpacity>

              {/* Indicateur de session en bas */}
              <View
                style={{
                  position: "absolute",
                  bottom: 40,
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
                  ● Session en cours • {wordCount} mot{wordCount > 1 ? "s" : ""}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Contrôles révélés */}
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

  // Mode Normal - Interface existante avec nouvelle sidebar
  return (
    <Provider>
      <SafeAreaView
        style={[
          commonStyles.container,
          { backgroundColor: currentTheme.background },
        ]}
      >
        <StatusBar style="dark" />

        <View style={commonStyles.layout}>
          {/* Zone principale d'écriture */}
          <View style={mainPageStyles.mainArea}>
            {/* Header épuré */}
            <View
              style={[
                mainPageStyles.header,
                { borderBottomColor: currentTheme.border },
              ]}
            >
              <TouchableOpacity
                onPress={createNewSession}
                style={[
                  mainPageStyles.headerButton,
                  { backgroundColor: currentTheme.surface },
                ]}
              >
                <Text
                  style={[
                    mainPageStyles.headerButtonText,
                    { color: currentTheme.text },
                  ]}
                >
                  + Nouveau
                </Text>
              </TouchableOpacity>

              {/* Section Timer avec durées */}
              <View style={timerStyles.timerSection}>
                {/* Boutons de durée */}
                <View style={timerStyles.durationButtons}>
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
                          },
                        ]}
                      >
                        {duration}min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Timer principal */}
                <TouchableOpacity
                  onPress={handleToggleTimer}
                  style={[
                    timerStyles.timerButton,
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
                        },
                      ]}
                    >
                      {formatTime(timeRemaining)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => setSidebarOpen(!sidebarOpen)}
                style={[
                  mainPageStyles.headerButton,
                  {
                    backgroundColor: sidebarOpen
                      ? currentTheme.accent + "20"
                      : currentTheme.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    mainPageStyles.headerButtonText,
                    { color: currentTheme.text },
                  ]}
                >
                  Historique
                </Text>
              </TouchableOpacity>
            </View>

            {/* Zone d'écriture */}
            <View style={mainPageStyles.writingContainer}>
              <View style={mainPageStyles.paperSheet}>
                <TextInput
                  ref={textInputRef}
                  key={`${fontSize}-${selectedFont}`}
                  style={[
                    mainPageStyles.textInput,
                    {
                      color: currentTheme.text,
                      fontSize: fontSize,
                      lineHeight: fontSize * 1.6,
                      fontFamily: selectedFont,
                      borderWidth: 0,
                      borderColor: "transparent",
                      // Styles spécifiques pour supprimer bordure web
                      ...(Platform.OS === "web" && {
                        outline: "none",
                        border: "none",
                        boxShadow: "none",
                      }),
                    },
                  ]}
                  value={text}
                  onChangeText={setText}
                  placeholder={placeholder}
                  placeholderTextColor={currentTheme.muted}
                  multiline
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

            {/* Footer épuré */}
            <View
              style={[
                mainPageStyles.footer,
                { borderTopColor: currentTheme.border },
              ]}
            >
              <View style={mainPageStyles.footerLeft}>
                <Text
                  style={[
                    mainPageStyles.wordCount,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  {wordCount} mot{wordCount > 1 ? "s" : ""}
                </Text>
              </View>

              <View style={mainPageStyles.footerCenter}>
                {isTimerRunning && (
                  <Text
                    style={[
                      mainPageStyles.runningIndicator,
                      { color: currentTheme.accent },
                    ]}
                  >
                    ● Session en cours • {formatTime(timeRemaining)}
                  </Text>
                )}
              </View>

              <View style={mainPageStyles.footerRight}>
                {/* Sélecteur taille de texte */}
                <TouchableOpacity
                  onPress={toggleFontSizeMenu}
                  style={mainPageStyles.footerButton}
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

                {/* Bouton sélection police ultra minimaliste */}
                <TouchableOpacity
                  onPress={changeRandomFont}
                  style={mainPageStyles.footerButton}
                >
                  <Text
                    style={[
                      mainPageStyles.footerButtonText,
                      { color: currentTheme.textSecondary },
                    ]}
                  >
                    Aa (random)
                  </Text>
                </TouchableOpacity>

                {/* Affichage du nom de la police */}
                <Text
                  style={[
                    mainPageStyles.fontNameDisplay,
                    { color: currentTheme.muted },
                  ]}
                >
                  {selectedFontName}
                </Text>

                {/* Bouton dark mode */}
                <TouchableOpacity
                  onPress={toggleDarkMode}
                  style={mainPageStyles.footerButton}
                >
                  <Text
                    style={[
                      mainPageStyles.footerButtonText,
                      { color: currentTheme.textSecondary },
                    ]}
                  >
                    {isDarkMode ? "☀️" : "🌙"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Modal pour sélection de taille */}
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
                  },
                ]}
              >
                <Text
                  style={[modalStyles.modalTitle, { color: currentTheme.text }]}
                >
                  Taille du texte
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

          {/* ✅ Nouvelle sidebar avec corbeille */}
          {sidebarOpen && (
            <EnhancedSidebar
              currentTheme={currentTheme}
              currentEntry={currentEntry}
              entries={entries}
              trashEntries={trashEntries}
              onClose={() => setSidebarOpen(false)}
              onLoadEntry={loadEntry}
              onShareEntry={shareEntry}
              onMoveToTrash={moveEntryToTrash}
              onRestoreFromTrash={restoreFromTrash}
              onDeletePermanently={deleteEntryPermanently}
              onEmptyTrash={emptyTrash}
              getDaysUntilDeletion={getDaysUntilDeletion}
              onOpenPreview={openPreview}
            />
          )}
        </View>
        <PreviewModal
          visible={isPreviewModalVisible}
          entry={previewEntry}
          currentTheme={currentTheme}
          onClose={closePreview}
          onLoadEntry={loadEntry}
          onShare={shareEntry}
          isFromTrash={previewEntry?.isInTrash || false}
        />
      </SafeAreaView>
    </Provider>
  );
}
