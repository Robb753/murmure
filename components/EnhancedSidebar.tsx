import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
} from "react-native";
import { Menu, Divider } from "react-native-paper";
import * as Haptics from "expo-haptics";
import { MurmureEntry } from "@/app/lib/storage";
import { sidebarStyles } from "@/styles";

interface EnhancedSidebarProps {
  currentTheme: any;
  currentEntry: MurmureEntry | null;
  entries: MurmureEntry[];
  trashEntries: MurmureEntry[];
  onClose: () => void;
  onLoadEntry: (entry: MurmureEntry) => void;
  onShareEntry: (entry: MurmureEntry) => void;
  onMoveToTrash: (entry: MurmureEntry) => void;
  onRestoreFromTrash: (entry: MurmureEntry) => void;
  onDeletePermanently: (entry: MurmureEntry) => void;
  onEmptyTrash: () => void;
  getDaysUntilDeletion: (entry: MurmureEntry) => number | null;
  onOpenPreview: (entry: MurmureEntry) => void;
}

type SidebarTab = "sessions" | "trash";

// Composant pour une entrée active
const ActiveEntry = ({
  item,
  currentTheme,
  currentEntry,
  onLoadEntry,
  onShareEntry,
  onMoveToTrash,
  onOpenPreview,
}: {
  item: MurmureEntry;
  currentTheme: any;
  currentEntry: MurmureEntry | null;
  onLoadEntry: (entry: MurmureEntry) => void;
  onShareEntry: (entry: MurmureEntry) => void;
  onMoveToTrash: (entry: MurmureEntry) => void;
  onOpenPreview: (entry: MurmureEntry) => void;
}) => {
  const isActive = currentEntry?.id === item.id;
  const isEmpty = item.content.trim().length === 0;
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLoadEntry = () => {
    onLoadEntry(item);
    setMenuVisible(false);
  };

  const handleShareEntry = () => {
    onShareEntry(item);
    setMenuVisible(false);
  };

  const handleMoveToTrash = async () => {
    console.log("🗑️ handleMoveToTrash appelé pour:", item.id);

    try {
      onMoveToTrash(item);
      console.log("✅ Suppression terminée");
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
    }

    setMenuVisible(false);
  };

  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert("Actions", `Session du ${item.date}`, [
      { text: "Annuler", style: "cancel" },
      { text: "Charger", onPress: () => onLoadEntry(item) },
      { text: "Partager", onPress: () => onShareEntry(item) },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => onMoveToTrash(item),
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
        onPress={() => onOpenPreview(item)}
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
            onPress={() => {
              onOpenPreview(item);
              setMenuVisible(false);
            }}
            title="👁️ Prévisualiser"
            titleStyle={{ color: currentTheme.text, fontSize: 14 }}
            style={{ paddingVertical: 8 }}
          />
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
            onPress={handleMoveToTrash}
            title="🗑️ Supprimer"
            titleStyle={{ color: "#ef4444", fontSize: 14, fontWeight: "500" }}
            style={{ paddingVertical: 8 }}
          />
        </Menu>
      )}
    </View>
  );
};

// Composant pour une entrée dans la corbeille
const TrashEntry = ({
  item,
  currentTheme,
  onRestoreFromTrash,
  onDeletePermanently,
  getDaysUntilDeletion,
  onOpenPreview,
}: {
  item: MurmureEntry;
  currentTheme: any;
  onRestoreFromTrash: (entry: MurmureEntry) => void;
  onDeletePermanently: (entry: MurmureEntry) => void;
  getDaysUntilDeletion: (entry: MurmureEntry) => number | null;
  onOpenPreview: (entry: MurmureEntry) => void;
}) => {
  const isEmpty = item.content.trim().length === 0;
  const [menuVisible, setMenuVisible] = useState(false);
  const daysLeft = getDaysUntilDeletion(item);

  const handleRestore = () => {
    onRestoreFromTrash(item);
    setMenuVisible(false);
  };

  const handleDeletePermanently = () => {
    onDeletePermanently(item);
    setMenuVisible(false);
  };

  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert("Actions", `Session du ${item.date}`, [
      { text: "Annuler", style: "cancel" },
      { text: "Restaurer", onPress: () => onRestoreFromTrash(item) },
      {
        text: "Supprimer définitivement",
        style: "destructive",
        onPress: () => onDeletePermanently(item),
      },
    ]);
  };

  return (
    <View style={sidebarStyles.sidebarEntryContainer}>
      <TouchableOpacity
        style={[
          sidebarStyles.sidebarEntry,
          {
            backgroundColor: currentTheme.surface + "80",
            borderLeftColor: "#ef4444",
            opacity: 0.7,
          },
        ]}
        onPress={() => onOpenPreview(item)}
        onLongPress={Platform.OS !== "web" ? handleLongPress : undefined}
      >
        <Text
          style={[sidebarStyles.sidebarEntryDate, { color: currentTheme.text }]}
        >
          {item.date} 🗑️
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
          {daysLeft !== null && (
            <Text style={{ color: "#ef4444", fontSize: 11 }}>
              {" • "}
              {daysLeft > 0
                ? `${daysLeft}j restant${daysLeft > 1 ? "s" : ""}`
                : "Expire aujourd'hui"}
            </Text>
          )}
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
            onPress={() => {
              onOpenPreview(item);
              setMenuVisible(false);
            }}
            title="👁️ Prévisualiser"
            titleStyle={{ color: currentTheme.text, fontSize: 14 }}
            style={{ paddingVertical: 8 }}
          />
          <Menu.Item
            onPress={handleRestore}
            title="♻️ Restaurer"
            titleStyle={{ color: currentTheme.text, fontSize: 14 }}
            style={{ paddingVertical: 8 }}
          />
          <Divider
            style={{ backgroundColor: currentTheme.border, height: 1 }}
          />
          <Menu.Item
            onPress={handleDeletePermanently}
            title="💀 Supprimer définitivement"
            titleStyle={{ color: "#ef4444", fontSize: 14, fontWeight: "500" }}
            style={{ paddingVertical: 8 }}
          />
        </Menu>
      )}
    </View>
  );
};

// Composant principal de la sidebar
export const EnhancedSidebar = ({
  currentTheme,
  currentEntry,
  entries,
  trashEntries,
  onClose,
  onLoadEntry,
  onShareEntry,
  onMoveToTrash,
  onRestoreFromTrash,
  onDeletePermanently,
  onEmptyTrash,
  getDaysUntilDeletion,
  onOpenPreview,
}: EnhancedSidebarProps) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("sessions");

  const renderActiveEntry = ({ item }: { item: MurmureEntry }) => (
    <ActiveEntry
      item={item}
      currentTheme={currentTheme}
      currentEntry={currentEntry}
      onLoadEntry={onLoadEntry}
      onShareEntry={onShareEntry}
      onMoveToTrash={onMoveToTrash}
      onOpenPreview={onOpenPreview}
    />
  );

  const renderTrashEntry = ({ item }: { item: MurmureEntry }) => (
    <TrashEntry
      item={item}
      currentTheme={currentTheme}
      onRestoreFromTrash={onRestoreFromTrash}
      onDeletePermanently={onDeletePermanently}
      getDaysUntilDeletion={getDaysUntilDeletion}
      onOpenPreview={onOpenPreview}
    />
  );

  return (
    <View
      style={[
        sidebarStyles.sidebar,
        {
          backgroundColor: currentTheme.surface,
          borderLeftColor: currentTheme.border,
        },
      ]}
    >
      {/* Header avec onglets */}
      <View
        style={[
          sidebarStyles.sidebarHeader,
          { borderBottomColor: currentTheme.border },
        ]}
      >
        <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
          {/* Onglet Sessions */}
          <TouchableOpacity
            onPress={() => setActiveTab("sessions")}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor:
                activeTab === "sessions"
                  ? currentTheme.accent + "20"
                  : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: activeTab === "sessions" ? "600" : "400",
                color:
                  activeTab === "sessions"
                    ? currentTheme.accent
                    : currentTheme.textSecondary,
              }}
            >
              Sessions ({entries.length})
            </Text>
          </TouchableOpacity>

          {/* Onglet Corbeille */}
          <TouchableOpacity
            onPress={() => setActiveTab("trash")}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor:
                activeTab === "trash"
                  ? currentTheme.accent + "20"
                  : "transparent",
              marginLeft: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: activeTab === "trash" ? "600" : "400",
                color:
                  activeTab === "trash"
                    ? currentTheme.accent
                    : currentTheme.textSecondary,
              }}
            >
              🗑️ ({trashEntries.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bouton fermer */}
        <TouchableOpacity onPress={onClose}>
          <Text
            style={[sidebarStyles.sidebarClose, { color: currentTheme.muted }]}
          >
            ×
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bouton vider la corbeille (si onglet corbeille actif) */}
      {activeTab === "trash" && trashEntries.length > 0 && (
        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <TouchableOpacity
            onPress={onEmptyTrash}
            style={{
              backgroundColor: "#ef4444",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>
              🧹 Vider la corbeille
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des entrées avec scroll */}
      <FlatList
        data={activeTab === "sessions" ? entries : trashEntries}
        renderItem={
          activeTab === "sessions" ? renderActiveEntry : renderTrashEntry
        }
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={[sidebarStyles.sidebarContent, { flexGrow: 1 }]}
        style={{ flex: 1 }}
        ListEmptyComponent={
          <View
            style={{
              padding: 20,
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Text
              style={{
                color: currentTheme.muted,
                fontSize: 14,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              {activeTab === "sessions"
                ? "Aucune session pour le moment.\nCommencez à écrire !"
                : "La corbeille est vide.\nLes sessions supprimées\napparaîtront ici."}
            </Text>
          </View>
        }
      />

      {/* Info corbeille en bas */}
      {activeTab === "trash" && trashEntries.length > 0 && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: currentTheme.border,
          }}
        >
          <Text
            style={{
              color: currentTheme.muted,
              fontSize: 12,
              textAlign: "center",
            }}
          >
            Suppression automatique après 30 jours
          </Text>
        </View>
      )}
    </View>
  );
};
