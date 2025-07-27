import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { MurmureEntry } from "../app/lib/storage";

interface PreviewModalProps {
  visible: boolean;
  entry: MurmureEntry | null;
  currentTheme: any;
  onClose: () => void;
  onLoadEntry?: (entry: MurmureEntry) => void;
  onShare?: (entry: MurmureEntry) => void;
  isFromTrash?: boolean;
}

export const PreviewModal = ({
  visible,
  entry,
  currentTheme,
  onClose,
  onLoadEntry,
  onShare,
  isFromTrash = false,
}: PreviewModalProps) => {
  if (!entry) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalContainer,
          { backgroundColor: currentTheme.background },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.modalHeader,
            { borderBottomColor: currentTheme.border },
          ]}
        >
          <View>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
              {entry.date} {isFromTrash && "🗑️"}
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                { color: currentTheme.textSecondary },
              ]}
            >
              {entry.wordCount} mot{entry.wordCount > 1 ? "s" : ""}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text
              style={[styles.closeButtonText, { color: currentTheme.text }]}
            >
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenu */}
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={styles.contentPadding}
        >
          <Text
            style={[
              styles.contentText,
              {
                color: currentTheme.text,
                fontFamily: "Georgia",
                fontSize: 18,
                lineHeight: 28,
              },
            ]}
          >
            {entry.content || "Session vide"}
          </Text>
        </ScrollView>

        {/* Actions */}
        <View
          style={[
            styles.actionsContainer,
            { borderTopColor: currentTheme.border },
          ]}
        >
          {!isFromTrash && (
            <TouchableOpacity
              onPress={() => {
                onLoadEntry?.(entry);
                onClose();
              }}
              style={[
                styles.actionButton,
                { backgroundColor: currentTheme.accent },
              ]}
            >
              <Text style={styles.actionButtonText}>📝 Charger</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              onShare?.(entry);
              onClose();
            }}
            style={[
              styles.actionButton,
              {
                backgroundColor: currentTheme.surface,
                borderWidth: 1,
                borderColor: currentTheme.border,
              },
            ]}
          >
            <Text
              style={[styles.actionButtonText, { color: currentTheme.text }]}
            >
              📤 Partager
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "300",
  },
  contentContainer: {
    flex: 1,
  },
  contentPadding: {
    padding: 20,
  },
  contentText: {
    textAlign: "left",
  },
  actionsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
