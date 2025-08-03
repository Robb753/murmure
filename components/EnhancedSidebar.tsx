import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
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

// ✅ Composant SimpleEntry avec gestion d'erreurs corrigée
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
  const isEmpty = !item.content || item.content.trim().length === 0;

  // ✅ Format de date simplifié et sécurisé
  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return "Date invalide";
      }

      return dateObj.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.warn("Erreur formatage date:", error);
      return "Date invalide";
    }
  };

  // ✅ Gestion sécurisée du nom d'affichage
  const getDisplayName = () => {
    if (isEmpty) {
      return "Session vide";
    }

    const preview = item.previewText || item.content?.substring(0, 50) || "";
    return preview.length > 50 ? preview.substring(0, 50) + "..." : preview;
  };

  const handlePress = () => {
    if (!isTrash) {
      console.log("📱 Chargement de l'entrée:", item.id);
      onLoadEntry(item);
    }
  };

  const handleMenuPress = () => {
    onMenuOpen();
    setShowMenu(true);
  };

  const handleLongPress = () => {
    onMenuOpen();
    setShowMenu(true);
  };

  const closeMenu = () => {
    setShowMenu(false);
  };

  // ✅ Actions avec gestion d'erreurs robuste
  const handleExport = async () => {
    closeMenu();
    console.log("📤 Export demandé pour:", item.id);

    try {
      await onExportEntry(item);
    } catch (error) {
      console.error("Erreur export:", error);
      if (Platform.OS === "web") {
        window.alert("Erreur lors de l'export");
      } else {
        Alert.alert("Erreur", "Impossible d'exporter cette entrée");
      }
    }
  };

  const handleDelete = () => {
    closeMenu();
    const itemName = getDisplayName();

    console.log("🗑️ Suppression demandée pour:", item.id, "isTrash:", isTrash);

    if (isTrash) {
      onShowConfirmation({
        title: "Suppression définitive ?",
        message: `Supprimer définitivement "${itemName}" ?\n\n⚠️ Cette action est irréversible !`,
        confirmText: "Supprimer définitivement",
        confirmColor: "#ef4444",
        onConfirm: async () => {
          console.log("💀 Suppression définitive confirmée pour:", item.id);
          try {
            await onDeletePermanently(item);
          } catch (error) {
            console.error("Erreur suppression définitive:", error);
            if (Platform.OS === "web") {
              window.alert("Erreur lors de la suppression");
            } else {
              Alert.alert("Erreur", "Impossible de supprimer cette entrée");
            }
          }
        },
      });
    } else {
      onShowConfirmation({
        title: "Déplacer vers la corbeille ?",
        message: `Déplacer "${itemName}" vers la corbeille ?\n\nSuppression définitive dans 30 jours.`,
        confirmText: "Déplacer",
        confirmColor: "#ef4444",
        onConfirm: async () => {
          console.log("🗑️ Déplacement vers corbeille confirmé pour:", item.id);
          try {
            await onMoveToTrash(item);
          } catch (error) {
            console.error("Erreur déplacement corbeille:", error);
            if (Platform.OS === "web") {
              window.alert("Erreur lors du déplacement vers la corbeille");
            } else {
              Alert.alert("Erreur", "Impossible de déplacer vers la corbeille");
            }
          }
        },
      });
    }
  };

  const handleRestore = () => {
    closeMenu();
    const itemName = getDisplayName();

    console.log("♻️ Restauration demandée pour:", item.id);

    onShowConfirmation({
      title: "Restaurer depuis la corbeille ?",
      message: `Restaurer "${itemName}" depuis la corbeille ?`,
      confirmText: "Restaurer",
      confirmColor: "#10b981",
      onConfirm: async () => {
        console.log("♻️ Restauration confirmée pour:", item.id);
        try {
          await onRestoreFromTrash(item);
        } catch (error) {
          console.error("Erreur restauration:", error);
          if (Platform.OS === "web") {
            window.alert("Erreur lors de la restauration");
          } else {
            Alert.alert("Erreur", "Impossible de restaurer cette entrée");
          }
        }
      },
    });
  };

  return (
    <View style={{ position: "relative" }}>
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
          // ✅ Opacité réduite pour les entrées dans la corbeille
          opacity: isTrash ? 0.8 : 1,
        }}
      >
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          style={{ flex: 1 }}
          activeOpacity={0.7}
          disabled={isTrash} // ✅ Désactiver le clic pour les entrées dans la corbeille
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
            <Text
              style={{
                color: currentTheme.muted,
                fontSize: 11,
              }}
            >
              {item.wordCount || 0} mot{(item.wordCount || 0) > 1 ? "s" : ""}
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

      {/* ✅ Menu contextuel amélioré */}
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
            zIndex: 50,
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
            onPress={closeMenu}
            activeOpacity={1}
          />

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
              numberOfLines={2}
            >
              {getDisplayName()}
            </Text>

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
                      fontWeight: "500",
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
                      fontWeight: "500",
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
                      fontWeight: "500",
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
                      fontWeight: "500",
                    }}
                  >
                    🗑️ Supprimer
                  </Text>
                </TouchableOpacity>
              </>
            )}

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
                  fontWeight: "500",
                }}
              >
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// ✅ Composant principal EnhancedSidebar entièrement corrigé
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

  // ✅ Fonction de confirmation améliorée
  const showConfirmation = (config: {
    title: string;
    message: string;
    confirmText: string;
    confirmColor?: string;
    onConfirm: () => void;
  }) => {
    setOpenMenuId(null);
    setConfirmationState({
      visible: true,
      ...config,
    });
  };

  const hideConfirmation = () => {
    setConfirmationState((prev) => ({ ...prev, visible: false }));
  };

  // ✅ CORRECTION: Fonction handleConfirm améliorée
  const handleConfirm = async () => {
    try {
      await confirmationState.onConfirm();
    } catch (error) {
      console.error("Erreur lors de l'action:", error);
      if (Platform.OS === "web") {
        window.alert("Une erreur s'est produite");
      } else {
        Alert.alert("Erreur", "Une erreur s'est produite lors de l'opération");
      }
    } finally {
      hideConfirmation();
    }
  };

  const handleMenuOpen = (itemId: string) => {
    setOpenMenuId(itemId);
  };

  // ✅ Fonction de vidage de corbeille avec gestion d'erreurs
  const handleEmptyTrash = () => {
    const count = trashEntries.length;

    if (count === 0) {
      if (Platform.OS === "web") {
        window.alert("La corbeille est déjà vide");
      } else {
        Alert.alert("Information", "La corbeille est déjà vide");
      }
      return;
    }

    showConfirmation({
      title: "Vider la corbeille ?",
      message: `${count} session${count > 1 ? "s" : ""} sera${
        count > 1 ? "ont" : ""
      } définitivement supprimée${
        count > 1 ? "s" : ""
      }.\n\n⚠️ Cette action est irréversible !`,
      confirmText: "Vider la corbeille",
      confirmColor: "#ef4444",
      onConfirm: async () => {
        console.log("🧹 Vidage corbeille confirmé");
        try {
          await onEmptyTrash();
        } catch (error) {
          console.error("Erreur vidage corbeille:", error);
          if (Platform.OS === "web") {
            window.alert("Erreur lors du vidage de la corbeille");
          } else {
            Alert.alert("Erreur", "Impossible de vider la corbeille");
          }
        }
      },
    });
  };

  const handleSidebarPress = () => {
    if (confirmationState.visible) {
      hideConfirmation();
    }
    setOpenMenuId(null);
  };

  // ✅ Fonction de rendu d'entrée avec gestion d'erreurs
  const renderEntry = ({ item }: { item: MurmureEntry }) => {
    if (!item || !item.id) {
      console.warn("Entrée invalide détectée:", item);
      return null;
    }

    return (
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
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={handleSidebarPress}
      >
        {/* ✅ Header avec compteurs améliorés */}
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

        {/* ✅ Bouton de vidage de corbeille amélioré */}
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
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                🗑️ Vider la corbeille ({trashEntries.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ✅ Liste des entrées avec gestion d'erreurs */}
        <FlatList
          data={currentData}
          keyExtractor={(item) => item?.id || Math.random().toString()}
          renderItem={renderEntry}
          contentContainerStyle={{ paddingVertical: 8 }}
          showsVerticalScrollIndicator={false}
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
          ListFooterComponent={
            currentData.length > 0 ? (
              <View style={{ padding: 16, alignItems: "center" }}>
                <Text
                  style={{
                    color: currentTheme.muted,
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {activeTab === "sessions"
                    ? `${currentData.length} session${
                        currentData.length > 1 ? "s" : ""
                      } • Glissez pour plus d'options`
                    : `${currentData.length} entrée${
                        currentData.length > 1 ? "s" : ""
                      } dans la corbeille`}
                </Text>
              </View>
            ) : null
          }
        />
      </TouchableOpacity>

      {/* ✅ NOUVELLE MODAL DE CONFIRMATION CORRIGÉE */}
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
            {/* Zone pour fermer en touchant à côté */}
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

            {/* Contenu de la modal */}
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
              {/* Icône au centre */}
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

              {/* Titre */}
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

              {/* Message */}
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

              {/* Boutons */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                {/* Bouton Annuler */}
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

                {/* Bouton Confirmer */}
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

              {/* ✅ Indicateur de fermeture pour mobile */}
              {Platform.OS !== "web" && (
                <View
                  style={{
                    marginTop: 16,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: currentTheme.muted,
                      fontSize: 12,
                      fontStyle: "italic",
                    }}
                  >
                    Touchez en dehors pour annuler
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export { EnhancedSidebar };
