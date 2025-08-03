import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MurmureEntry } from "@/app/lib/storage";

interface SimpleSidebarProps {
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

// ✅ NOUVEAU: Modal de confirmation intégré dans la sidebar
const InlineConfirmationModal = ({
  visible,
  title,
  message,
  confirmText,
  confirmColor,
  currentTheme,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmColor?: string;
  currentTheme: any;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!visible) return null;

  const buttonColor = confirmColor || "#ef4444";

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        paddingHorizontal: 30,
        paddingVertical: 20,
      }}
    >
      {/* Zone cliquable pour fermer */}
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        onPress={onCancel}
        activeOpacity={1}
      />

      {/* Modal */}
      <View
        style={{
          backgroundColor: currentTheme.surface,
          borderRadius: 20,
          padding: 24,
          maxWidth: 280,
          width: "85%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 15,
          borderWidth: 1,
          borderColor: currentTheme.border,
          zIndex: 1001,
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
            onPress={onCancel}
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
            onPress={onConfirm}
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
  );
};

// ✅ ULTRA SIMPLE: Une seule entrée pour tout
const SimpleEntry = ({
  item,
  currentTheme,
  currentEntry,
  onLoadEntry,
  onExportEntry,
  onMoveToTrash,
  onRestoreFromTrash,
  onDeletePermanently,
  isTrash = false,
  showMenu,
  setShowMenu,
  onMenuOpen,
  onShowConfirmation,
}: {
  item: MurmureEntry;
  currentTheme: any;
  currentEntry: MurmureEntry | null;
  onLoadEntry: (entry: MurmureEntry) => void;
  onExportEntry: (entry: MurmureEntry) => void;
  onMoveToTrash: (entry: MurmureEntry) => void;
  onRestoreFromTrash: (entry: MurmureEntry) => void;
  onDeletePermanently: (entry: MurmureEntry) => void;
  isTrash?: boolean;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  onMenuOpen: () => void;
  onShowConfirmation: (config: {
    title: string;
    message: string;
    confirmText: string;
    confirmColor?: string;
    onConfirm: () => void;
  }) => void;
}) => {
  const isActive = currentEntry?.id === item.id;
  const isEmpty = item.content.trim().length === 0;

  // ✅ SIMPLE: Clic principal = charger l'entrée
  const handlePress = () => {
    console.log("📱 Clic sur entrée:", item.id);
    onLoadEntry(item);
  };

  // ✅ Clic sur les trois points = menu
  const handleMenuPress = () => {
    onMenuOpen();
    setShowMenu(true);
  };

  // ✅ AMÉLIORATION: Long press = menu contextuel
  const handleLongPress = () => {
    onMenuOpen();
    setShowMenu(true);
  };

  // ✅ Fermer le menu
  const closeMenu = () => {
    setShowMenu(false);
  };

  // ✅ Actions du menu
  const handleExport = () => {
    closeMenu();
    console.log("📤 Export demandé pour:", item.id);
    onExportEntry(item);
  };

  const handleDelete = () => {
    closeMenu();
    const itemName =
      item.previewText || item.content.substring(0, 30) || "Session vide";

    console.log("🗑️ Suppression demandée pour:", item.id, "isTrash:", isTrash);

    if (isTrash) {
      // Suppression définitive avec confirmation
      onShowConfirmation({
        title: "Suppression définitive ?",
        message: `Supprimer définitivement "${itemName}" ?\n\n⚠️ Cette action est irréversible !`,
        confirmText: "Supprimer définitivement",
        confirmColor: "#ef4444",
        onConfirm: () => {
          console.log("💀 Suppression définitive confirmée pour:", item.id);
          onDeletePermanently(item);
        },
      });
    } else {
      // Déplacer vers corbeille avec confirmation
      onShowConfirmation({
        title: "Déplacer vers la corbeille ?",
        message: `Déplacer "${itemName}" vers la corbeille ?\n\nSuppression définitive dans 30 jours.`,
        confirmText: "Déplacer",
        confirmColor: "#ef4444",
        onConfirm: () => {
          console.log("🗑️ Déplacement vers corbeille confirmé pour:", item.id);
          onMoveToTrash(item);
        },
      });
    }
  };

  const handleRestore = () => {
    closeMenu();
    const itemName =
      item.previewText || item.content.substring(0, 30) || "Session vide";

    console.log("♻️ Restauration demandée pour:", item.id);

    onShowConfirmation({
      title: "Restaurer depuis la corbeille ?",
      message: `Restaurer "${itemName}" depuis la corbeille ?`,
      confirmText: "Restaurer",
      confirmColor: "#10b981",
      onConfirm: () => {
        console.log("♻️ Restauration confirmée pour:", item.id);
        onRestoreFromTrash(item);
      },
    });
  };

  const itemName =
    item.previewText || item.content.substring(0, 30) || "Session vide";

  return (
    <>
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
        }}
      >
        {/* ✅ Zone principale cliquable */}
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          style={{ flex: 1 }}
          activeOpacity={0.7}
        >
          {/* Date */}
          <Text
            style={{
              color: currentTheme.text,
              fontSize: 14,
              fontWeight: "600",
              marginBottom: 4,
            }}
          >
            {new Date(item.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {isTrash && " 🗑️"}
          </Text>

          {/* Preview */}
          <Text
            style={{
              color: currentTheme.textSecondary,
              fontSize: 13,
              marginBottom: 6,
            }}
            numberOfLines={2}
          >
            {isEmpty ? "Session vide" : item.previewText || "Pas de preview"}
          </Text>

          {/* Métadonnées */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: currentTheme.muted,
                fontSize: 11,
              }}
            >
              {item.wordCount} mot{item.wordCount > 1 ? "s" : ""}
            </Text>

            <Text
              style={{
                color: currentTheme.muted,
                fontSize: 10,
                fontStyle: "italic",
              }}
            >
              maintenir pour options
            </Text>
          </View>
        </TouchableOpacity>

        {/* ✅ BOUTON: Trois points */}
        <TouchableOpacity
          onPress={handleMenuPress}
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

      {/* ✅ MODAL MENU */}
      {showMenu && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 500,
          }}
        >
          {/* Zone cliquable pour fermer */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onPress={closeMenu}
            activeOpacity={1}
          />

          {/* Menu modal */}
          <View
            style={{
              backgroundColor: currentTheme.surface,
              borderRadius: 16,
              padding: 20,
              minWidth: 200,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 15,
              borderWidth: 1,
              borderColor: currentTheme.border,
            }}
          >
            <Text
              style={{
                color: currentTheme.text,
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {itemName}
            </Text>

            {/* Boutons du menu */}
            {isTrash ? (
              <>
                <TouchableOpacity
                  onPress={handleRestore}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: "#10b98120",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#10b981",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    ♻️ Restaurer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: "#ef444420",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#ef4444",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    💀 Supprimer définitivement
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={handleExport}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: currentTheme.accent + "20",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: currentTheme.accent,
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    📤 Exporter
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    backgroundColor: "#ef444420",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#ef4444",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    🗑️ Supprimer
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Bouton Annuler */}
            <TouchableOpacity
              onPress={closeMenu}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: currentTheme.muted + "20",
              }}
            >
              <Text
                style={{
                  color: currentTheme.muted,
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

// ✅ COMPOSANT PRINCIPAL
const SimpleSidebar = ({
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
}: SimpleSidebarProps) => {
  const [activeTab, setActiveTab] = useState<"sessions" | "trash">("sessions");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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

  // ✅ Fonction pour afficher une confirmation
  const showConfirmation = (config: {
    title: string;
    message: string;
    confirmText: string;
    confirmColor?: string;
    onConfirm: () => void;
  }) => {
    setOpenMenuId(null); // Fermer tous les menus
    setConfirmationState({
      visible: true,
      ...config,
    });
  };

  // ✅ Fonction pour fermer la confirmation
  const hideConfirmation = () => {
    setConfirmationState((prev) => ({ ...prev, visible: false }));
  };

  // ✅ Fonction pour confirmer et fermer
  const handleConfirm = () => {
    confirmationState.onConfirm();
    hideConfirmation();
  };

  // ✅ Fonction pour gérer l'ouverture d'un menu
  const handleMenuOpen = (itemId: string) => {
    setOpenMenuId(itemId);
  };

  // ✅ Fonction pour vider la corbeille
  const handleEmptyTrash = () => {
    const count = trashEntries.length;
    showConfirmation({
      title: "Vider la corbeille ?",
      message: `${count} session${count > 1 ? "s" : ""} sera${
        count > 1 ? "ont" : ""
      } définitivement supprimée${
        count > 1 ? "s" : ""
      }.\n\n⚠️ Cette action est irréversible !`,
      confirmText: "Vider la corbeille",
      confirmColor: "#ef4444",
      onConfirm: () => {
        console.log("🧹 Vidage corbeille confirmé");
        onEmptyTrash();
      },
    });
  };

  // ✅ Gérer les clics dans la sidebar
  const handleSidebarPress = () => {
    if (confirmationState.visible) {
      hideConfirmation();
    }
    setOpenMenuId(null);
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
      {/* Zone cliquable pour fermer les modals */}
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={handleSidebarPress}
      >
        {/* HEADER */}
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
          {/* Tabs */}
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

          {/* Bouton fermer */}
          <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
            <Text style={{ color: currentTheme.muted, fontSize: 20 }}>×</Text>
          </TouchableOpacity>
        </View>

        {/* BOUTON VIDER CORBEILLE */}
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
              <Text style={{ color: "white", fontWeight: "600" }}>
                🗑️ Vider la corbeille
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LISTE */}
        <FlatList
          data={currentData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SimpleEntry
              item={item}
              currentTheme={currentTheme}
              currentEntry={currentEntry}
              onLoadEntry={onLoadEntry}
              onExportEntry={onExportEntry}
              onMoveToTrash={onMoveToTrash}
              onRestoreFromTrash={onRestoreFromTrash}
              onDeletePermanently={onDeletePermanently}
              isTrash={activeTab === "trash"}
              showMenu={openMenuId === item.id}
              setShowMenu={(show) => setOpenMenuId(show ? item.id : null)}
              onMenuOpen={() => handleMenuOpen(item.id)}
              onShowConfirmation={showConfirmation}
            />
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListEmptyComponent={
            <View style={{ padding: 32, alignItems: "center" }}>
              <Text style={{ color: currentTheme.muted, textAlign: "center" }}>
                {activeTab === "sessions" ? "Aucune session" : "Corbeille vide"}
              </Text>
            </View>
          }
        />
      </TouchableOpacity>

      {/* ✅ MODAL DE CONFIRMATION INTÉGRÉ */}
      <InlineConfirmationModal
        visible={confirmationState.visible}
        title={confirmationState.title}
        message={confirmationState.message}
        confirmText={confirmationState.confirmText}
        confirmColor={confirmationState.confirmColor}
        currentTheme={currentTheme}
        onConfirm={handleConfirm}
        onCancel={hideConfirmation}
      />
    </View>
  );
};

export { SimpleSidebar as EnhancedSidebar };
