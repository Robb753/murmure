// components/ExportModal.tsx - Nouveau composant modal pour remplacer Alert.alert sur web
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
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
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: currentTheme.surface,
              borderColor: currentTheme.border,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: currentTheme.text }]}>
              {title}
            </Text>
            <Text
              style={[styles.message, { color: currentTheme.textSecondary }]}
            >
              {message}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      option.style === "cancel"
                        ? currentTheme.muted + "20"
                        : option.style === "destructive"
                        ? "#ef444420"
                        : currentTheme.accent + "20",
                    borderColor:
                      option.style === "cancel"
                        ? currentTheme.muted
                        : option.style === "destructive"
                        ? "#ef4444"
                        : currentTheme.accent,
                  },
                ]}
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color:
                        option.style === "cancel"
                          ? currentTheme.muted
                          : option.style === "destructive"
                          ? "#ef4444"
                          : currentTheme.accent,
                    },
                  ]}
                >
                  {option.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    borderRadius: 16,
    padding: 24,
    minWidth: 300,
    maxWidth: 400,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

// Hook personnalisé pour remplacer Alert.alert sur web
export const useWebAlert = (currentTheme: any) => {
  const [modalState, setModalState] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
    options: {
      text: string;
      onPress: () => void;
      style?: "default" | "cancel" | "destructive";
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
        // Sur mobile, utiliser Alert.alert natif
        Alert.alert(title, message, options);
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
