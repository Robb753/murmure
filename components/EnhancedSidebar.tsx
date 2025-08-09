// components/EnhancedSidebar.tsx - CORRECTION COMPLÈTE

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MurmureEntry } from "@/app/lib/storage";

interface EnhancedSidebarProps {
  currentTheme: any;
  currentEntry: MurmureEntry | null;
  entries: MurmureEntry[];
  trashEntries: MurmureEntry[];
  onClose: () => void;
  onLoadEntry: (entry: MurmureEntry) => void;
  onMoveToTrash: (entry: MurmureEntry) => void;
  onRestoreFromTrash: (entry: MurmureEntry) => void;
  onDeletePermanently: (entry: MurmureEntry) => void;
  onEmptyTrash: () => void;
  onExportEntry: (entry: MurmureEntry) => void;
}

// ✅ NOUVEAU: Modal centrée séparée pour les actions
const CenteredActionModal = ({
  visible,
  entry,
  currentTheme,
  isTrash,
  onClose,
  onExport,
  onMoveToTrash,
  onRestore,
  onDelete,
  onShowConfirmation,
}: {
  visible: boolean;
  entry: MurmureEntry | null;
  currentTheme: any;
  isTrash: boolean;
  onClose: () => void;
  onExport: (entry: MurmureEntry) => void;
  onMoveToTrash: (entry: MurmureEntry) => void;
  onRestore: (entry: MurmureEntry) => void;
  onDelete: (entry: MurmureEntry) => void;
  onShowConfirmation: (config: any) => void;
}) => {
  if (!entry) return null;

  const getDisplayName = () => {
    if (!entry.content || entry.content.trim().length === 0) {
      return "Session vide";
    }
    const preview = entry.previewText || entry.content?.substring(0, 50) || "";
    return preview.length > 50 ? preview.substring(0, 50) + "..." : preview;
  };

  const handleExport = () => {
    onClose();
    onExport(entry);
  };

  const handleDelete = () => {
    onClose();
    const itemName = getDisplayName();

    if (isTrash) {
      onShowConfirmation({
        title: "Suppression définitive ?",
        message: `Supprimer définitivement "${itemName}" ?\n\n⚠️ Cette action est irréversible !`,
        confirmText: "Supprimer définitivement",
        confirmColor: "#ef4444",
        onConfirm: () => onDelete(entry),
      });
    } else {
      onShowConfirmation({
        title: "Déplacer vers la corbeille ?",
        message: `Déplacer "${itemName}" vers la corbeille ?\n\nSuppression définitive dans 30 jours.`,
        confirmText: "Déplacer",
        confirmColor: "#ef4444",
        onConfirm: () => onMoveToTrash(entry),
      });
    }
  };

  const handleRestore = () => {
    onClose();
    const itemName = getDisplayName();

    onShowConfirmation({
      title: "Restaurer depuis la corbeille ?",
      message: `Restaurer "${itemName}" depuis la corbeille ?`,
      confirmText: "Restaurer",
      confirmColor: "#10b981",
      onConfirm: () => onRestore(entry),
    });
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
      {/* ✅ Overlay avec fermeture en touchant à côté */}
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onPress={onClose}
          activeOpacity={1}
        />

        {/* ✅ Contenu de la modal - Centré et moderne */}
        <View
          style={{
            backgroundColor: currentTheme.surface,
            borderRadius: 20,
            padding: 24,
            minWidth: 280,
            maxWidth: 350,
            width: "90%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.4,
            shadowRadius: 24,
            elevation: 25,
            borderWidth: 1,
            borderColor: currentTheme.border,
          }}
        >
          {/* Header avec titre */}
          <View style={{ marginBottom: 20, alignItems: "center" }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: currentTheme.accent + "20",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 24 }}>{isTrash ? "🗑️" : "📝"}</Text>
            </View>

            <Text
              style={{
                color: currentTheme.text,
                fontSize: 16,
                fontWeight: "600",
                textAlign: "center",
                lineHeight: 22,
              }}
              numberOfLines={2}
            >
              {getDisplayName()}
            </Text>
          </View>

          {/* Actions */}
          <View style={{ gap: 12 }}>
            {isTrash ? (
              <>
                {/* Restaurer */}
                <TouchableOpacity
                  onPress={handleRestore}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    backgroundColor: "#10b98115",
                    borderWidth: 1,
                    borderColor: "#10b98130",
                  }}
                >
                  <Text style={{ fontSize: 20, marginRight: 12 }}>♻️</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "#10b981",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      Restaurer
                    </Text>
                    <Text
                      style={{
                        color: currentTheme.textSecondary,
                        fontSize: 13,
                        opacity: 0.8,
                      }}
                    >
                      Remettre dans les sessions actives
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Supprimer définitivement */}
                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    backgroundColor: "#ef444415",
                    borderWidth: 1,
                    borderColor: "#ef444430",
                  }}
                >
                  <Text style={{ fontSize: 20, marginRight: 12 }}>💀</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "#ef4444",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      Supprimer définitivement
                    </Text>
                    <Text
                      style={{
                        color: currentTheme.textSecondary,
                        fontSize: 13,
                        opacity: 0.8,
                      }}
                    >
                      Action irréversible
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Exporter */}
                <TouchableOpacity
                  onPress={handleExport}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    backgroundColor: currentTheme.accent + "15",
                    borderWidth: 1,
                    borderColor: currentTheme.accent + "30",
                  }}
                >
                  <Text style={{ fontSize: 20, marginRight: 12 }}>📤</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: currentTheme.accent,
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      Exporter
                    </Text>
                    <Text
                      style={{
                        color: currentTheme.textSecondary,
                        fontSize: 13,
                        opacity: 0.8,
                      }}
                    >
                      Sauvegarder ou partager
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Supprimer */}
                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    backgroundColor: "#ef444415",
                    borderWidth: 1,
                    borderColor: "#ef444430",
                  }}
                >
                  <Text style={{ fontSize: 20, marginRight: 12 }}>🗑️</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "#ef4444",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      Supprimer
                    </Text>
                    <Text
                      style={{
                        color: currentTheme.textSecondary,
                        fontSize: 13,
                        opacity: 0.8,
                      }}
                    >
                      Déplacer vers la corbeille
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            {/* Annuler */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: currentTheme.background,
                borderWidth: 1,
                borderColor: currentTheme.border,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  color: currentTheme.textSecondary,
                  fontSize: 16,
                  fontWeight: "500",
                }}
              >
                Annuler
              </Text>
            </TouchableOpacity>
          </View>

          {/* Indicateur de fermeture */}
          <View style={{ marginTop: 16, alignItems: "center" }}>
            <Text
              style={{
                color: currentTheme.muted,
                fontSize: 12,
                fontStyle: "italic",
              }}
            >
              Touchez en dehors pour fermer
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ✅ Composant SimpleEntry SIMPLIFIÉ - Sans modal interne
const SimpleEntry = ({
  item,
  currentTheme,
  currentEntry,
  onLoadEntry,
  isTrash = false,
  onMenuPress,
}: {
  item: MurmureEntry;
  currentTheme: any;
  currentEntry: MurmureEntry | null;
  onLoadEntry: (entry: MurmureEntry) => void;
  isTrash?: boolean;
  onMenuPress: (entry: MurmureEntry) => void;
}) => {
  const isActive = currentEntry?.id === item.id;
  const isEmpty = !item.content || item.content.trim().length === 0;

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "Date invalide";
      return dateObj.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date invalide";
    }
  };

  const getDisplayName = () => {
    if (isEmpty) return "Session vide";
    const preview = item.previewText || item.content?.substring(0, 50) || "";
    return preview.length > 50 ? preview.substring(0, 50) + "..." : preview;
  };

  const handlePress = () => {
    if (!isTrash) {
      onLoadEntry(item);
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        marginVertical: 4,
        marginHorizontal: 8,
        borderRadius: 12,
        backgroundColor: isActive
          ? currentTheme.accent + "20"
          : currentTheme.surface,
        borderLeftWidth: 3,
        borderLeftColor: isActive ? currentTheme.accent : currentTheme.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        opacity: isTrash ? 0.8 : 1,
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={{ flex: 1 }}
        activeOpacity={0.7}
        disabled={isTrash}
      >
        <Text
          style={{
            color: isActive ? currentTheme.accent : currentTheme.text,
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 4,
          }}
        >
          {formatDate(item.createdAt)}
          {isTrash && " 🗑️"}
        </Text>

        <Text
          style={{
            color: currentTheme.textSecondary,
            fontSize: 13,
            marginBottom: 6,
          }}
          numberOfLines={2}
        >
          {getDisplayName()}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: currentTheme.muted, fontSize: 11 }}>
            {item.wordCount || 0} mot{(item.wordCount || 0) > 1 ? "s" : ""}
          </Text>
        </View>
      </TouchableOpacity>

      {/* ✅ Bouton menu simplifié */}
      <TouchableOpacity
        onPress={() => onMenuPress(item)}
        style={{
          padding: 8,
          marginLeft: 8,
          borderRadius: 8,
          backgroundColor: currentTheme.surface,
          borderWidth: 1,
          borderColor: currentTheme.border,
        }}
        activeOpacity={0.7}
      >
        <Text
          style={{
            color: currentTheme.textSecondary,
            fontSize: 12,
            lineHeight: 12,
          }}
        >
          ⋯
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ✅ Composant principal EnhancedSidebar SIMPLIFIÉ
const EnhancedSidebar = ({
  currentTheme,
  currentEntry,
  entries,
  trashEntries,
  onClose,
  onLoadEntry,
  onMoveToTrash,
  onRestoreFromTrash,
  onDeletePermanently,
  onEmptyTrash,
  onExportEntry,
}: EnhancedSidebarProps) => {
  const [activeTab, setActiveTab] = useState<"sessions" | "trash">("sessions");

  // ✅ États pour la modal centrée
  const [selectedEntry, setSelectedEntry] = useState<MurmureEntry | null>(null);
  const [showCenteredModal, setShowCenteredModal] = useState(false);

  // État pour la confirmation (inchangé)
  const [confirmationState, setConfirmationState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmColor?: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: () => {},
  });

  const insets = useSafeAreaInsets();
  const currentData = activeTab === "sessions" ? entries : trashEntries;

  // ✅ Nouvelle fonction pour ouvrir la modal centrée
  const handleMenuPress = (entry: MurmureEntry) => {
    setSelectedEntry(entry);
    setShowCenteredModal(true);
  };

  // ✅ Fonction pour fermer la modal centrée
  const closeCenteredModal = () => {
    setShowCenteredModal(false);
    setSelectedEntry(null);
  };

  // Fonction de confirmation (inchangé)
  const showConfirmation = (config: any) => {
    setConfirmationState({ visible: true, ...config });
  };

  const hideConfirmation = () => {
    setConfirmationState((prev) => ({ ...prev, visible: false }));
  };

  const handleConfirm = async () => {
    try {
      await confirmationState.onConfirm();
    } catch (error) {
      console.error("Erreur lors de l'action:", error);
    } finally {
      hideConfirmation();
    }
  };

  // Reste du code inchangé...
  const handleEmptyTrash = () => {
    const count = trashEntries.length;
    if (count === 0) return;

    showConfirmation({
      title: "Vider la corbeille ?",
      message: `${count} session${count > 1 ? "s" : ""} sera${
        count > 1 ? "ont" : ""
      } définitivement supprimée${
        count > 1 ? "s" : ""
      }.\n\n⚠️ Cette action est irréversible !`,
      confirmText: "Vider la corbeille",
      confirmColor: "#ef4444",
      onConfirm: onEmptyTrash,
    });
  };

  const renderEntry = ({ item }: { item: MurmureEntry }) => {
    if (!item || !item.id) return null;

    return (
      <SimpleEntry
        item={item}
        currentTheme={currentTheme}
        currentEntry={currentEntry}
        onLoadEntry={onLoadEntry}
        isTrash={activeTab === "trash"}
        onMenuPress={handleMenuPress}
      />
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: currentTheme.surface,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
        borderLeftWidth: 1,
        borderLeftColor: currentTheme.border,
        shadowColor: "#000",
        shadowOffset: { width: -4, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 16,
      }}
    >
      {/* Header et contenu inchangés... */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: currentTheme.border,
        }}
      >
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => setActiveTab("sessions")}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor:
                activeTab === "sessions"
                  ? currentTheme.accent + "20"
                  : "transparent",
            }}
          >
            <Text
              style={{
                color:
                  activeTab === "sessions"
                    ? currentTheme.accent
                    : currentTheme.textSecondary,
                fontSize: 14,
                fontWeight: activeTab === "sessions" ? "600" : "400",
              }}
            >
              Sessions ({entries.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("trash")}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor:
                activeTab === "trash"
                  ? currentTheme.accent + "20"
                  : "transparent",
            }}
          >
            <Text
              style={{
                color:
                  activeTab === "trash"
                    ? currentTheme.accent
                    : currentTheme.textSecondary,
                fontSize: 14,
                fontWeight: activeTab === "trash" ? "600" : "400",
              }}
            >
              🗑️ ({trashEntries.length})
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
          <Text style={{ color: currentTheme.muted, fontSize: 20 }}>×</Text>
        </TouchableOpacity>
      </View>

      {/* Bouton vider corbeille */}
      {activeTab === "trash" && trashEntries.length > 0 && (
        <View
          style={{
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.border,
          }}
        >
          <TouchableOpacity
            onPress={handleEmptyTrash}
            style={{
              backgroundColor: "#ef4444",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
              🗑️ Vider la corbeille ({trashEntries.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des entrées */}
      <FlatList
        data={currentData}
        keyExtractor={(item) => item?.id || Math.random().toString()}
        renderItem={renderEntry}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={true}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: "center" }}>
            <Text
              style={{
                color: currentTheme.muted,
                textAlign: "center",
                fontSize: 16,
                fontStyle: "italic",
              }}
            >
              {activeTab === "sessions"
                ? "Aucune session d'écriture.\nCommencez par créer votre première session !"
                : "Corbeille vide.\nLes sessions supprimées apparaîtront ici."}
            </Text>
          </View>
        }
      />

      {/* ✅ Modal centrée pour les actions */}
      <CenteredActionModal
        visible={showCenteredModal}
        entry={selectedEntry}
        currentTheme={currentTheme}
        isTrash={activeTab === "trash"}
        onClose={closeCenteredModal}
        onExport={onExportEntry}
        onMoveToTrash={onMoveToTrash}
        onRestore={onRestoreFromTrash}
        onDelete={onDeletePermanently}
        onShowConfirmation={showConfirmation}
      />

      {/* Modal de confirmation (inchangée) */}
      {confirmationState.visible && (
        <Modal
          visible={confirmationState.visible}
          transparent={true}
          animationType="fade"
          onRequestClose={hideConfirmation}
          statusBarTranslucent={true}
          presentationStyle="overFullScreen"
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.8)",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 40,
            }}
          >
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              onPress={hideConfirmation}
              activeOpacity={1}
            />

            <View
              style={{
                backgroundColor: currentTheme.surface,
                borderRadius: 20,
                padding: 28,
                minWidth: 320,
                maxWidth: 400,
                width: "90%",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 25,
                borderWidth: 1,
                borderColor: currentTheme.border,
              }}
            >
              <View style={{ alignItems: "center", marginBottom: 16 }}>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: "#ef444420",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>⚠️</Text>
                </View>
              </View>

              <Text
                style={{
                  color: currentTheme.text,
                  fontSize: 20,
                  fontWeight: "700",
                  marginBottom: 12,
                  textAlign: "center",
                  lineHeight: 26,
                }}
              >
                {confirmationState.title}
              </Text>

              <Text
                style={{
                  color: currentTheme.textSecondary,
                  fontSize: 15,
                  lineHeight: 22,
                  marginBottom: 28,
                  textAlign: "center",
                }}
              >
                {confirmationState.message}
              </Text>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={hideConfirmation}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderRadius: 14,
                    backgroundColor: currentTheme.background,
                    borderWidth: 2,
                    borderColor: currentTheme.border,
                    alignItems: "center",
                    minHeight: 48,
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: currentTheme.text,
                      fontSize: 16,
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    Annuler
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirm}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderRadius: 14,
                    backgroundColor:
                      confirmationState.confirmColor || "#ef4444",
                    alignItems: "center",
                    minHeight: 48,
                    shadowColor: confirmationState.confirmColor || "#ef4444",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                  activeOpacity={0.9}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    {confirmationState.confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export { EnhancedSidebar };
