import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Platform } from "react-native";
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
}: {
  item: MurmureEntry;
  currentTheme: any;
  currentEntry: MurmureEntry | null;
  onLoadEntry: (entry: MurmureEntry) => void;
  onOpenPreview: (entry: MurmureEntry) => void;
  onShareEntry: (entry: MurmureEntry) => void;
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
  onDataChanged,
  onOpenPreview,
  onShareEntry,
}: EnhancedSidebarProps) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("sessions");

  const renderActiveEntry = ({ item }: { item: MurmureEntry }) => (
    <ActiveEntry
      item={item}
      currentTheme={currentTheme}
      currentEntry={currentEntry}
      onLoadEntry={onLoadEntry}
      onOpenPreview={onOpenPreview}
      onShareEntry={onShareEntry}
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
        </View>

        <TouchableOpacity onPress={onClose}>
          <Text
            style={[sidebarStyles.sidebarClose, { color: currentTheme.muted }]}
          >
            ×
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={entries}
        renderItem={renderActiveEntry}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={[sidebarStyles.sidebarContent, { flexGrow: 1 }]}
        style={{ flex: 1 }}
      />
    </View>
  );
};

export { EnhancedSidebar };
