// components/ExportModal.tsx - Version améliorée avec thème unifié
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  currentTheme: any;
  title: string;
  message: string;
  options: {
    text: string;
    onPress: () => void;
    style?: "default" | "cancel" | "destructive";
    icon?: string;
    description?: string;
  }[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  currentTheme,
  title,
  message,
  options,
}) => {
  const handleOptionPress = (option: any) => {
    // Fermer d'abord la modal
    onClose();
    // Puis exécuter l'action avec un léger délai pour éviter les conflits
    setTimeout(() => {
      option.onPress();
    }, 100);
  };

  const handleOverlayPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      {/* ✅ Overlay avec fermeture au clic */}
      <Pressable
        style={styles.overlay}
        onPress={handleOverlayPress}
        accessible={false}
      >
        {/* ✅ Container principal - empêcher la propagation du clic */}
        <Pressable
          style={[
            styles.modalContainer,
            {
              backgroundColor: currentTheme.surface,
              borderColor: currentTheme.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* ✅ Header avec icône et titre */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: currentTheme.accent + "20" },
                ]}
              >
                <Text style={styles.headerIcon}>📤</Text>
              </View>

              <View style={styles.headerText}>
                <Text style={[styles.title, { color: currentTheme.text }]}>
                  {title}
                </Text>
                <Text
                  style={[
                    styles.message,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  {message}
                </Text>
              </View>
            </View>

            {/* ✅ Bouton fermeture discret */}
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                { backgroundColor: currentTheme.border + "40" },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Fermer"
            >
              <Text
                style={[styles.closeButtonText, { color: currentTheme.muted }]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          {/* ✅ Liste des options avec scroll */}
          <ScrollView
            style={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {options.map((option, index) => {
              const isCancel = option.style === "cancel";
              const isDestructive = option.style === "destructive";

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: isCancel
                        ? currentTheme.background
                        : isDestructive
                        ? "#ef444415"
                        : currentTheme.accent + "15",
                      borderColor: isCancel
                        ? currentTheme.border
                        : isDestructive
                        ? "#ef444440"
                        : currentTheme.accent + "40",
                      marginBottom: index === options.length - 1 ? 0 : 12,
                    },
                  ]}
                  onPress={() => handleOptionPress(option)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={option.text}
                >
                  <View style={styles.optionContent}>
                    {/* ✅ Icône de l'option */}
                    {option.icon && (
                      <View style={styles.optionIconContainer}>
                        <Text style={styles.optionIcon}>{option.icon}</Text>
                      </View>
                    )}

                    {/* ✅ Texte principal et description */}
                    <View style={styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color: isCancel
                              ? currentTheme.muted
                              : isDestructive
                              ? "#ef4444"
                              : currentTheme.accent,
                            fontWeight: isCancel ? "500" : "600",
                          },
                        ]}
                      >
                        {option.text}
                      </Text>

                      {/* ✅ Description optionnelle */}
                      {option.description && (
                        <Text
                          style={[
                            styles.optionDescription,
                            { color: currentTheme.textSecondary },
                          ]}
                        >
                          {option.description}
                        </Text>
                      )}
                    </View>

                    {/* ✅ Flèche indicatrice pour les actions */}
                    {!isCancel && (
                      <View style={styles.arrowContainer}>
                        <Text
                          style={[
                            styles.arrow,
                            {
                              color: isDestructive
                                ? "#ef4444"
                                : currentTheme.accent,
                            },
                          ]}
                        >
                          →
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ✅ Footer informatif avec thème */}
          <View
            style={[styles.footer, { borderTopColor: currentTheme.border }]}
          >
            <Text style={[styles.footerText, { color: currentTheme.muted }]}>
              {Platform.OS === "web"
                ? "Cliquez en dehors pour fermer"
                : "Touchez en dehors pour fermer"}
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // ✅ Overlay plus sombre pour meilleur contraste
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  modalContainer: {
    borderRadius: 20,
    padding: 0,
    minWidth: 320,
    maxWidth: 420,
    width: "95%",
    maxHeight: "80%",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 25,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 24,
    paddingBottom: 16,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  optionsContainer: {
    paddingHorizontal: 24,
    maxHeight: 300,
  },
  optionButton: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  optionIconContainer: {
    marginRight: 12,
  },
  optionIcon: {
    fontSize: 20,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    lineHeight: 20,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
    opacity: 0.8,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  arrow: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    paddingTop: 16,
    alignItems: "center",
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    fontStyle: "italic",
  },
});

// ✅ Hook amélioré avec gestion du thème
export const useWebAlert = (currentTheme: any) => {
  const [modalState, setModalState] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
    options: {
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
      icon?: string;
      description?: string;
    }[];
  }>({
    visible: false,
    title: "",
    message: "",
    options: [],
  });

  const showAlert = React.useCallback(
    (
      title: string,
      message: string,
      options: {
        text: string;
        onPress: () => void;
        style?: "default" | "cancel" | "destructive";
        icon?: string;
        description?: string;
      }[]
    ) => {
      if (Platform.OS === "web") {
        setModalState({
          visible: true,
          title,
          message,
          options,
        });
      } else {
        // ✅ Sur mobile, utiliser Alert.alert natif (simplifié)
        const simpleOptions = options.map((opt) => ({
          text: opt.text,
          onPress: opt.onPress,
          style: opt.style,
        }));
        Alert.alert(title, message, simpleOptions);
      }
    },
    []
  );

  const hideAlert = React.useCallback(() => {
    setModalState((prev) => ({ ...prev, visible: false }));
  }, []);

  const AlertModal = React.useCallback(
    () => (
      <ExportModal
        visible={modalState.visible}
        onClose={hideAlert}
        currentTheme={currentTheme}
        title={modalState.title}
        message={modalState.message}
        options={modalState.options}
      />
    ),
    [modalState, hideAlert, currentTheme]
  );

  return {
    showAlert,
    AlertModal,
  };
};

// ✅ Fonction helper pour créer des options d'export avec thème
export const createExportOptions = (
  wordCount: number,
  dateText: string,
  actions: {
    copyToClipboard: () => void;
    downloadFile?: () => void;
    shareContent?: () => void;
    saveFile?: () => void;
  }
): {
  text: string;
  icon: string;
  description: string;
  onPress: () => void;
  style: "default" | "cancel" | "destructive";
}[] => {
  const { copyToClipboard, downloadFile, shareContent, saveFile } = actions;

  const options: {
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

  // ✅ Options spécifiques à la plateforme
  if (Platform.OS === "web" && downloadFile) {
    options.push({
      text: "Télécharger (.txt)",
      icon: "💾",
      description: "Sauvegarder sur votre ordinateur",
      onPress: downloadFile,
      style: "default",
    });
  }

  if (Platform.OS !== "web") {
    if (shareContent) {
      options.push({
        text: "Partager",
        icon: "📱",
        description: "Partager via vos applications",
        onPress: shareContent,
        style: "default",
      });
    }

    if (saveFile) {
      options.push({
        text: "Sauvegarder un fichier",
        icon: "📁",
        description: "Créer un fichier dans Documents",
        onPress: saveFile,
        style: "default",
      });
    }
  }

  // ✅ Option d'annulation
  options.push({
    text: "Annuler",
    icon: "",
    description: "",
    onPress: () => {},
    style: "cancel",
  });

  return options;
};
