import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentTheme: any;
  title: string;
  message: string;
  confirmText: string;
  confirmColor?: string;
  isDestructive?: boolean;
}

// ✅ COMPOSANT: Modal de confirmation avec thème
export const ThemedConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  currentTheme,
  title,
  message,
  confirmText,
  confirmColor,
  isDestructive = false,
}: ConfirmationModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const buttonColor =
    confirmColor || (isDestructive ? "#ef4444" : currentTheme.accent);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        {/* ✅ Zone cliquable pour fermer */}
        <TouchableOpacity
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
          activeOpacity={1}
        />

        {/* ✅ Modal avec thème */}
        <View
          style={{
            backgroundColor: currentTheme.surface,
            borderRadius: 20,
            padding: 24,
            minWidth: 280,
            maxWidth: 400,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 15,
            borderWidth: 1,
            borderColor: currentTheme.border,
          }}
        >
          {/* Titre */}
          <Text
            style={{
              color: currentTheme.text,
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            style={{
              color: currentTheme.textSecondary,
              fontSize: 14,
              lineHeight: 20,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            {message}
          </Text>

          {/* Boutons */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            {/* Bouton Annuler */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: currentTheme.muted + "20",
                borderWidth: 1,
                borderColor: currentTheme.muted + "40",
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: currentTheme.muted,
                  fontSize: 14,
                  fontWeight: "500",
                  textAlign: "center",
                }}
              >
                Annuler
              </Text>
            </TouchableOpacity>

            {/* Bouton Confirmer */}
            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: buttonColor,
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 14,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ✅ HOOK: Pour gérer facilement les confirmations
export const useThemedConfirmations = (currentTheme: any) => {
  const [modalState, setModalState] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmColor?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
  });

  const showConfirmation = React.useCallback(
    (config: {
      title: string;
      message: string;
      confirmText: string;
      confirmColor?: string;
      isDestructive?: boolean;
      onConfirm: () => void;
    }) => {
      setModalState({
        visible: true,
        ...config,
      });
    },
    []
  );

  const hideConfirmation = React.useCallback(() => {
    setModalState((prev) => ({ ...prev, visible: false }));
  }, []);

  // ✅ Confirmations préfabriquées
  const confirmDelete = React.useCallback(
    (itemName: string, onConfirm: () => void) => {
      showConfirmation({
        title: "Déplacer vers la corbeille ?",
        message: `Déplacer "${itemName}" vers la corbeille ?\n\nSuppression définitive dans 30 jours.`,
        confirmText: "Déplacer",
        isDestructive: true,
        onConfirm,
      });
    },
    [showConfirmation]
  );

  const confirmDeletePermanently = React.useCallback(
    (itemName: string, onConfirm: () => void) => {
      showConfirmation({
        title: "Suppression définitive ?",
        message: `Supprimer définitivement "${itemName}" ?\n\n⚠️ Cette action est irréversible !`,
        confirmText: "Supprimer définitivement",
        isDestructive: true,
        onConfirm,
      });
    },
    [showConfirmation]
  );

  const confirmRestore = React.useCallback(
    (itemName: string, onConfirm: () => void) => {
      showConfirmation({
        title: "Restaurer depuis la corbeille ?",
        message: `Restaurer "${itemName}" depuis la corbeille ?`,
        confirmText: "Restaurer",
        confirmColor: "#10b981",
        onConfirm,
      });
    },
    [showConfirmation]
  );

  const confirmEmptyTrash = React.useCallback(
    (count: number, onConfirm: () => void) => {
      showConfirmation({
        title: "Vider la corbeille ?",
        message: `${count} session${count > 1 ? "s" : ""} sera${
          count > 1 ? "ont" : ""
        } définitivement supprimée${
          count > 1 ? "s" : ""
        }.\n\n⚠️ Cette action est irréversible !`,
        confirmText: "Vider la corbeille",
        isDestructive: true,
        onConfirm,
      });
    },
    [showConfirmation]
  );

  const confirmNewSession = React.useCallback(
    (onConfirm: () => void) => {
      showConfirmation({
        title: "Créer une nouvelle session ?",
        message: "Votre travail actuel sera sauvegardé automatiquement.",
        confirmText: "Nouvelle session",
        onConfirm,
      });
    },
    [showConfirmation]
  );

  const ConfirmationModal = React.useCallback(
    () => (
      <ThemedConfirmationModal
        visible={modalState.visible}
        onClose={hideConfirmation}
        onConfirm={modalState.onConfirm}
        currentTheme={currentTheme}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        confirmColor={modalState.confirmColor}
        isDestructive={modalState.isDestructive}
      />
    ),
    [modalState, hideConfirmation, currentTheme]
  );

  return {
    // Fonctions de confirmation
    confirmDelete,
    confirmDeletePermanently,
    confirmRestore,
    confirmEmptyTrash,
    confirmNewSession,
    showConfirmation,
    hideConfirmation,
    // Composant modal
    ConfirmationModal,
  };
};
