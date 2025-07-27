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
  FlatList,
  Platform,
  SafeAreaView,
  Modal,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { Menu, Divider, Provider } from "react-native-paper";

// Imports des hooks personnalisés
import { useTimer } from "@/hooks/useTimer";
import { useStorage } from "@/hooks/useStorage";
import { useAudio } from "@/hooks/useAudio";
import { useTheme } from "@/hooks/useTheme";
import { MurmureEntry } from "../lib/storage";

import {
  sidebarStyles,
  commonStyles,
  mainPageStyles,
  timerStyles,
  modalStyles,
} from "@/styles";

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

// Composant séparé pour une entrée de sidebar
const SidebarEntry = ({
  item,
  currentTheme,
  currentEntry,
  loadEntry,
  shareEntry,
  deleteEntry,
}: {
  item: MurmureEntry;
  currentTheme: any;
  currentEntry: MurmureEntry | null;
  loadEntry: (entry: MurmureEntry) => void;
  shareEntry: (entry: MurmureEntry) => void;
  deleteEntry: (entry: MurmureEntry) => void;
}) => {
  const isActive = currentEntry?.id === item.id;
  const isEmpty = item.content.trim().length === 0;
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLoadEntry = () => {
    loadEntry(item);
    setMenuVisible(false);
  };

  const handleShareEntry = () => {
    shareEntry(item);
    setMenuVisible(false);
  };

  const handleDeleteEntry = () => {
    deleteEntry(item);
    setMenuVisible(false);
  };

  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert("Actions", `Session du ${item.date}`, [
      { text: "Annuler", style: "cancel" },
      { text: "Charger", onPress: () => loadEntry(item) },
      { text: "Partager", onPress: () => shareEntry(item) },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => deleteEntry(item),
      },
    ]);
  };

  return (
    <View style={sidebarStyles.sidebarEntryContainer}>
      <TouchableOpacity
        style={[
          sidebarStyles.sidebarEntry,
          {
            backgroundColor: isActive
              ? currentTheme.accent + "20"
              : "transparent",
            borderLeftColor: isActive ? currentTheme.accent : "transparent",
          },
        ]}
        onPress={() => loadEntry(item)}
        onLongPress={Platform.OS !== "web" ? handleLongPress : undefined}
      >
        <Text
          style={[sidebarStyles.sidebarEntryDate, { color: currentTheme.text }]}
        >
          {item.date}
        </Text>
        <Text
          style={[
            sidebarStyles.sidebarEntryPreview,
            { color: currentTheme.textSecondary },
          ]}
          numberOfLines={2}
        >
          {isEmpty ? "Session vide" : item.previewText || "Pas de preview"}
        </Text>
        <Text
          style={[
            sidebarStyles.sidebarEntryMeta,
            { color: currentTheme.muted },
          ]}
        >
          {isEmpty
            ? "0 mot"
            : `${item.wordCount} mot${item.wordCount > 1 ? "s" : ""}`}
        </Text>
      </TouchableOpacity>

      {/* Menu contextuel pour le web */}
      {Platform.OS === "web" && (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          contentStyle={{
            backgroundColor: currentTheme.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: currentTheme.border,
            minWidth: 160,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
          anchor={
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={[
                sidebarStyles.webActionsButtonExternal,
                {
                  backgroundColor: currentTheme.surface,
                  borderColor: currentTheme.border,
                },
              ]}
              activeOpacity={0.6}
            >
              <Text
                style={[
                  sidebarStyles.webActionsIcon,
                  { color: currentTheme.textSecondary },
                ]}
              >
                ⋯
              </Text>
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={handleLoadEntry}
            title="📂 Charger"
            titleStyle={{ color: currentTheme.text, fontSize: 14 }}
            style={{ paddingVertical: 8 }}
          />
          <Menu.Item
            onPress={handleShareEntry}
            title="📤 Partager"
            titleStyle={{ color: currentTheme.text, fontSize: 14 }}
            style={{ paddingVertical: 8 }}
          />
          <Divider
            style={{ backgroundColor: currentTheme.border, height: 1 }}
          />
          <Menu.Item
            onPress={handleDeleteEntry}
            title="🗑️ Supprimer"
            titleStyle={{ color: "#ef4444", fontSize: 14, fontWeight: "500" }}
            style={{ paddingVertical: 8 }}
          />
        </Menu>
      )}
    </View>
  );
};

export default function MainPage() {
  // États pour l'interface utilisateur
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fontSize, setFontSize] = useState(28);
  const [selectedFont, setSelectedFont] = useState("Georgia");
  const [selectedFontName, setSelectedFontName] = useState("Georgia");
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);

  // Références
  const textInputRef = useRef<TextInput>(null);

  // Hooks personnalisés
  const { currentTheme, isDarkMode, toggleDarkMode } = useTheme();
  const { loadSounds, playSound, cleanupSounds } = useAudio();
  const {
    currentEntry,
    entries,
    text,
    wordCount,
    setText,
    loadData,
    saveCurrentEntry,
    createNewSession,
    loadEntry,
    deleteEntry,
    shareEntry,
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

  // Gestion personnalisée de la fin du timer (appelée manuellement)
  useEffect(() => {
    if (timeRemaining === 0 && isTimerRunning) {
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

  const handleToggleTimer = async () => {
    await toggleTimer();
    if (!isTimerRunning) {
      setTimeout(() => textInputRef.current?.focus(), 100);
    }
  };

  // Rendu d'une entrée dans la sidebar
  const renderSidebarEntry = ({ item }: { item: MurmureEntry }) => {
    return (
      <SidebarEntry
        item={item}
        currentTheme={currentTheme}
        currentEntry={currentEntry}
        loadEntry={loadEntry}
        shareEntry={shareEntry}
        deleteEntry={deleteEntry}
      />
    );
  };

  return (
    <Provider>
      <SafeAreaView
        style={[commonStyles.container, { backgroundColor: currentTheme.background }]}
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
              style={[mainPageStyles.footer, { borderTopColor: currentTheme.border }]}
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

          {sidebarOpen && (
            <View
              style={[
                sidebarStyles.sidebar,
                {
                  backgroundColor: currentTheme.surface,
                  borderLeftColor: currentTheme.border,
                },
              ]}
            >
              <View
                style={[
                  sidebarStyles.sidebarHeader,
                  { borderBottomColor: currentTheme.border },
                ]}
              >
                <Text
                  style={[
                    sidebarStyles.sidebarTitle,
                    { color: currentTheme.text },
                  ]}
                >
                  Sessions
                </Text>
                <TouchableOpacity onPress={() => setSidebarOpen(false)}>
                  <Text
                    style={[
                      sidebarStyles.sidebarClose,
                      { color: currentTheme.muted },
                    ]}
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={entries}
                renderItem={renderSidebarEntry}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={sidebarStyles.sidebarContent}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Provider>
  );
}
