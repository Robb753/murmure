// components/NewSessionModal.tsx - Modal pour créer une nouvelle session
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";

interface NewSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateNew: () => void;
  currentTheme: any;
  hasUnsavedText: boolean;
  wordCount: number;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  visible,
  onClose,
  onCreateNew,
  currentTheme,
  hasUnsavedText,
  wordCount,
}) => {
  const handleCreateNew = () => {
    onClose();
    setTimeout(() => {
      onCreateNew();
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
        {/* ✅ Container principal */}
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
          {/* ✅ Header avec icône */}
          <View style={styles.header}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: currentTheme.accent + "20" },
              ]}
            >
              <Text style={styles.headerIcon}>✨</Text>
            </View>

            <View style={styles.headerText}>
              <Text style={[styles.title, { color: currentTheme.text }]}>
                Nouvelle session d&apos;écriture
              </Text>
              <Text
                style={[styles.subtitle, { color: currentTheme.textSecondary }]}
              >
                {hasUnsavedText
                  ? `Votre session actuelle (${wordCount} mot${
                      wordCount > 1 ? "s" : ""
                    }) sera sauvegardée automatiquement`
                  : "Commencer une nouvelle session d'écriture libre"}
              </Text>
            </View>

            {/* ✅ Bouton fermeture */}
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

          {/* ✅ Contenu avec conseils */}
          <View style={styles.content}>
            {hasUnsavedText && (
              <View
                style={[
                  styles.infoBox,
                  {
                    backgroundColor: currentTheme.accent + "10",
                    borderColor: currentTheme.accent + "30",
                  },
                ]}
              >
                <Text style={styles.infoIcon}>💾</Text>
                <Text
                  style={[
                    styles.infoText,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  Ne vous inquiétez pas, votre travail actuel sera
                  automatiquement sauvegardé avant de créer la nouvelle session.
                </Text>
              </View>
            )}

            <View
              style={[
                styles.tipsBox,
                {
                  backgroundColor: currentTheme.background,
                  borderColor: currentTheme.border,
                },
              ]}
            >
              <Text style={[styles.tipsTitle, { color: currentTheme.text }]}>
                💡 Conseils pour votre session
              </Text>
              <View style={styles.tipsList}>
                <Text
                  style={[
                    styles.tipItem,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  • Utilisez le timer pour rester concentré(e)
                </Text>
                <Text
                  style={[
                    styles.tipItem,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  • Écrivez sans vous corriger
                </Text>
                <Text
                  style={[
                    styles.tipItem,
                    { color: currentTheme.textSecondary },
                  ]}
                >
                  • Laissez vos pensées couler librement
                </Text>
              </View>
            </View>
          </View>

          {/* ✅ Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleCreateNew}
              style={[
                styles.createButton,
                { backgroundColor: currentTheme.accent },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Créer une nouvelle session"
            >
              <Text style={styles.createButtonText}>
                ✨ Créer une nouvelle session
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.cancelButton,
                {
                  backgroundColor: currentTheme.background,
                  borderColor: currentTheme.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Annuler"
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  { color: currentTheme.textSecondary },
                ]}
              >
                Continuer la session actuelle
              </Text>
            </TouchableOpacity>
          </View>

          {/* ✅ Footer */}
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
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
    padding: 24,
    paddingBottom: 16,
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
  subtitle: {
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
  content: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  tipsBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  tipsList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    padding: 24,
    paddingTop: 8,
    gap: 12,
  },
  createButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    fontStyle: "italic",
  },
});

// ✅ Hook pour utiliser la modal de nouvelle session
export const useNewSessionModal = (
  currentTheme: any,
  onCreateNewSession: () => void
) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [sessionData, setSessionData] = React.useState({
    hasUnsavedText: false,
    wordCount: 0,
  });

  const showNewSessionModal = React.useCallback(
    (hasUnsavedText: boolean, wordCount: number) => {
      setSessionData({ hasUnsavedText, wordCount });
      setIsVisible(true);
    },
    []
  );

  const hideModal = React.useCallback(() => {
    setIsVisible(false);
  }, []);

  const handleCreateNew = React.useCallback(() => {
    onCreateNewSession();
  }, [onCreateNewSession]);

  const NewSessionModalComponent = React.useCallback(
    () => (
      <NewSessionModal
        visible={isVisible}
        onClose={hideModal}
        onCreateNew={handleCreateNew}
        currentTheme={currentTheme}
        hasUnsavedText={sessionData.hasUnsavedText}
        wordCount={sessionData.wordCount}
      />
    ),
    [isVisible, hideModal, handleCreateNew, currentTheme, sessionData]
  );

  return {
    showNewSessionModal,
    NewSessionModalComponent,
  };
};
