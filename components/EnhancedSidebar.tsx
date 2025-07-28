import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
} from "react-native";
import { Menu } from "react-native-paper";
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
  onDataChanged: () => void;
  onOpenPreview: (entry: MurmureEntry) => void;
  onShareEntry: (entry: MurmureEntry) => void;
  onMoveToTrash: (entry: MurmureEntry) => void;
  onRestoreFromTrash: (entry: MurmureEntry) => void;
  onDeletePermanently: (entry: MurmureEntry) => void;
  onEmptyTrash: () => void;
  getDaysUntilDeletion: (entry: MurmureEntry) => number | null;
}

type SidebarTab = "sessions" | "trash";

const ActiveEntry = ({
  item,
  currentTheme,
  currentEntry,
  onLoadEntry,
  onOpenPreview,
  onShareEntry,
  onMoveToTrash,
}: {
  item: MurmureEntry;
  currentTheme: any;
  currentEntry: MurmureEntry | null;
  onLoadEntry: (entry: MurmureEntry) => void;
  onOpenPreview: (entry: MurmureEntry) => void;
  onShareEntry: (entry: MurmureEntry) => void;
  onMoveToTrash: (entry: MurmureEntry) => void;
}) => {
  const isActive = currentEntry?.id === item.id;
  const isEmpty = item.content.trim().length === 0;
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLoadEntry = () => {
    onLoadEntry(item);
    setMenuVisible(false);
  };

  const handleShareEntry = async () => {
    await onShareEntry(item);
    setMenuVisible(false);
  };

  const handleMoveToTrash = async () => {
    await onMoveToTrash(item);
    setMenuVisible(false);
  };

  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setMenuVisible(true);
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
            shadowOffset: { width: 0, height: 4 },
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
          />
          <Menu.Item
            onPress={handleLoadEntry}
            title="📂 Charger"
            titleStyle={{ color: currentTheme.text, fontSize: 14 }}
          />
          <Menu.Item
            onPress={handleShareEntry}
            title="📤 Partager"
            titleStyle={{ color: currentTheme.text, fontSize: 14 }}
          />
          <Menu.Item
            onPress={handleMoveToTrash}
            title="🗑️ Supprimer"
            titleStyle={{ color: "#ef4444", fontSize: 14 }}
          />
        </Menu>
      )}
    </View>
  );
};

const TrashEntry = ({
  item,
  currentTheme,
  onOpenPreview,
  onShareEntry,
  onRestoreFromTrash,
  onDeletePermanently,
  getDaysUntilDeletion,
}: {
  item: MurmureEntry;
  currentTheme: any;
  onOpenPreview: (entry: MurmureEntry) => void;
  onShareEntry: (entry: MurmureEntry) => void;
  onRestoreFromTrash: (entry: MurmureEntry) => void;
  onDeletePermanently: (entry: MurmureEntry) => void;
  getDaysUntilDeletion: (entry: MurmureEntry) => number | null;
}) => {
  const isEmpty = item.content.trim().length === 0;
  const [menuVisible, setMenuVisible] = useState(false);
  const daysLeft = getDaysUntilDeletion(item);

  const handleRestore = async () => {
    await onRestoreFromTrash(item);
    setMenuVisible(false);
  };

  const handleDeletePermanently = async () => {
    await onDeletePermanently(item);
    setMenuVisible(false);
  };

  const handleShareEntry = async () => {
    await onShareEntry(item);
    setMenuVisible(false);
  };

  return (
    <View style={sidebarStyles.sidebarEntryContainer}>
      <TouchableOpacity
        style={[
          sidebarStyles.sidebarEntry,
          {
            backgroundColor: "transparent",
            borderLeftColor: "#ef4444",
            opacity: 0.7,
          },
        ]}
        onPress={() => onOpenPreview(item)}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Text
            style={[
              sidebarStyles.sidebarEntryDate,
              { color: currentTheme.text },
            ]}
          >
            {item.date}
          </Text>
          <Text style={{ color: "#ef4444", fontSize: 12, marginLeft: 8 }}>
            🗑️
          </Text>
        </View>
        <Text
          style={[
            sidebarStyles.sidebarEntryPreview,
            { color: currentTheme.textSecondary },
          ]}
          numberOfLines={2}
        >
          {isEmpty ? "Session vide" : item.previewText || "Pas de preview"}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
          {daysLeft !== null && (
            <Text
              style={[
                sidebarStyles.sidebarEntryMeta,
                { color: "#ef4444", fontSize: 10 },
              ]}
            >
              {daysLeft > 0
                ? `${daysLeft}j restant${daysLeft > 1 ? "s" : ""}`
                : "Expire aujourd'hui"}
            </Text>
          )}
        </View>
      </TouchableOpacity>

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
            shadowOffset: { width: 0, height: 4 },
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
          />
          <Menu.Item
            onPress={handleRestore}
            title="♻️ Restaurer"
            titleStyle={{ color: "#10b981", fontSize: 14 }}
          />
          <Menu.Item
            onPress={handleShareEntry}
            title="📤 Partager"
            titleStyle={{ color: currentTheme.text, fontSize: 14 }}
          />
          <Menu.Item
            onPress={handleDeletePermanently}
            title="💀 Supprimer définitivement"
            titleStyle={{ color: "#ef4444", fontSize: 14 }}
          />
        </Menu>
      )}
    </View>
  );
};

const EnhancedSidebar = ({
  currentTheme,
  currentEntry,
  entries,
  trashEntries,
  onClose,
  onLoadEntry,
  onOpenPreview,
  onShareEntry,
  onMoveToTrash,
  onRestoreFromTrash,
  onDeletePermanently,
  onEmptyTrash,
  getDaysUntilDeletion,
}: EnhancedSidebarProps) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("sessions");

  const handleEmptyTrash = () => {
    if (trashEntries.length === 0) return;

    if (Platform.OS === "web") {
      if (
        window.confirm(
          `Vider la corbeille ?\n\n${trashEntries.length} session${
            trashEntries.length > 1 ? "s" : ""
          } sera${
            trashEntries.length > 1 ? "ont" : ""
          } définitivement supprimée${
            trashEntries.length > 1 ? "s" : ""
          }.\n\n⚠️ Cette action est irréversible !`
        )
      ) {
        onEmptyTrash();
      }
    } else {
      Alert.alert(
        "Vider la corbeille ?",
        `${trashEntries.length} session${
          trashEntries.length > 1 ? "s" : ""
        } sera${trashEntries.length > 1 ? "ont" : ""} définitivement supprimée${
          trashEntries.length > 1 ? "s" : ""
        }.\n\n⚠️ Cette action est irréversible !`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Vider la corbeille",
            style: "destructive",
            onPress: onEmptyTrash,
          },
        ]
      );
    }
  };

  const renderActiveEntry = ({ item }: { item: MurmureEntry }) => (
    <ActiveEntry
      item={item}
      currentTheme={currentTheme}
      currentEntry={currentEntry}
      onLoadEntry={onLoadEntry}
      onOpenPreview={onOpenPreview}
      onShareEntry={onShareEntry}
      onMoveToTrash={onMoveToTrash}
    />
  );

  const renderTrashEntry = ({ item }: { item: MurmureEntry }) => (
    <TrashEntry
      item={item}
      currentTheme={currentTheme}
      onOpenPreview={onOpenPreview}
      onShareEntry={onShareEntry}
      onRestoreFromTrash={onRestoreFromTrash}
      onDeletePermanently={onDeletePermanently}
      getDaysUntilDeletion={getDaysUntilDeletion}
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
      <View
        style={[
          sidebarStyles.sidebarHeader,
          { borderBottomColor: currentTheme.border },
        ]}
      >
        <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
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
              🗑️ Corbeille ({trashEntries.length})
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onClose}>
          <Text
            style={[sidebarStyles.sidebarClose, { color: currentTheme.muted }]}
          >
            ×
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "sessions" ? (
        <FlatList
          data={entries}
          renderItem={renderActiveEntry}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={[
            sidebarStyles.sidebarContent,
            { flexGrow: 1 },
          ]}
          style={{ flex: 1 }}
          ListEmptyComponent={
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: currentTheme.muted, textAlign: "center" }}>
                Aucune session
              </Text>
            </View>
          }
        />
      ) : (
        <View style={{ flex: 1 }}>
          {trashEntries.length > 0 && (
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
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 14, fontWeight: "500" }}
                >
                  Vider la corbeille
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={trashEntries}
            renderItem={renderTrashEntry}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={[
              sidebarStyles.sidebarContent,
              { flexGrow: 1 },
            ]}
            style={{ flex: 1 }}
            ListEmptyComponent={
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text
                  style={{ color: currentTheme.muted, textAlign: "center" }}
                >
                  Corbeille vide
                </Text>
              </View>
            }
          />
        </View>
      )}
    </View>
  );
};

export { EnhancedSidebar };
