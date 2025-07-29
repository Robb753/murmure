// components/EnhancedSidebar.tsx - Version finale corrigée
import React, { useState, useMemo } from "react";
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
import { useSearch } from "@/hooks/useSearch";
import { SearchBar } from "@/components/SearchBar";
import { HighlightedText } from "@/components/HighlightedText";
import { formatEntryDate, getDateColorIntensity } from "@/utils/dateUtils";

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
  isSearchResult = false,
  highlightedPreview,
}: {
  item: MurmureEntry;
  currentTheme: any;
  currentEntry: MurmureEntry | null;
  onLoadEntry: (entry: MurmureEntry) => void;
  onOpenPreview: (entry: MurmureEntry) => void;
  onShareEntry: (entry: MurmureEntry) => void;
  onMoveToTrash: (entry: MurmureEntry) => void;
  isSearchResult?: boolean;
  highlightedPreview?: string;
}) => {
  const isActive = currentEntry?.id === item.id;
  const isEmpty = item.content.trim().length === 0;
  const [menuVisible, setMenuVisible] = useState(false);

  const formattedDate = formatEntryDate(item.createdAt, {
    relative: true,
    showTime: false,
    fullFormat: false,
  });

  const dateColorIntensity = getDateColorIntensity(item.createdAt);

  // ✅ Handlers corrigés avec gestion d'erreur et logs
  const handleLoadEntry = () => {
    try {
      console.log("📂 Chargement entrée:", item.id);
      onLoadEntry(item);
      setMenuVisible(false);
    } catch (error) {
      console.error("❌ Erreur chargement:", error);
    }
  };

  const handleShareEntry = async () => {
    try {
      console.log("📤 Partage entrée:", item.id);
      await onShareEntry(item);
      setMenuVisible(false);
    } catch (error) {
      console.error("❌ Erreur partage:", error);
    }
  };

  const handleMoveToTrash = async () => {
    try {
      console.log("🗑️ Handler suppression appelé pour:", item.id);
      console.log("Entrée complète:", {
        id: item.id,
        date: item.date,
        previewText: item.previewText,
        contentLength: item.content?.length || 0,
        isInTrash: item.isInTrash,
      });

      // ✅ Appel direct de la fonction
      await onMoveToTrash(item);
      setMenuVisible(false);

      console.log("✅ Handler suppression terminé");
    } catch (error) {
      console.error("❌ Erreur dans handler suppression:", error);
      setMenuVisible(false); // Fermer le menu même en cas d'erreur
    }
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
            borderLeftColor: isActive
              ? currentTheme.accent
              : `${currentTheme.accent}${Math.round(dateColorIntensity * 255)
                  .toString(16)
                  .padStart(2, "0")}`,
          },
        ]}
        onPress={() => onOpenPreview(item)}
        onLongPress={Platform.OS !== "web" ? handleLongPress : undefined}
      >
        <Text
          style={[
            sidebarStyles.sidebarEntryDate,
            {
              color: currentTheme.text,
              opacity: 0.7 + dateColorIntensity * 0.3,
            },
          ]}
        >
          {formattedDate}
        </Text>

        {isSearchResult && highlightedPreview ? (
          <HighlightedText
            text={highlightedPreview}
            style={{
              ...sidebarStyles.sidebarEntryPreview,
              color: currentTheme.textSecondary,
            }}
            highlightStyle={{
              backgroundColor: currentTheme.accent + "30",
              fontWeight: "600",
              color: currentTheme.accent,
            }}
            numberOfLines={2}
          />
        ) : (
          <Text
            style={[
              sidebarStyles.sidebarEntryPreview,
              { color: currentTheme.textSecondary },
            ]}
            numberOfLines={2}
          >
            {isEmpty ? "session vide" : item.previewText || "pas de preview"}
          </Text>
        )}

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
            title="👁️ prévisualiser"
            titleStyle={{ color: currentTheme.text, fontSize: 14 }}
          />
          <Menu.Item
            onPress={handleLoadEntry}
            title="📂 charger"
            titleStyle={{ color: currentTheme.text, fontSize: 14 }}
          />
          <Menu.Item
            onPress={handleShareEntry}
            title="📤 partager"
            titleStyle={{ color: currentTheme.text, fontSize: 14 }}
          />
          {/* ✅ Menu item corrigé avec logs */}
          <Menu.Item
            onPress={() => {
              console.log("🗑️ Menu Item suppression cliqué");
              handleMoveToTrash();
            }}
            title="🗑️ supprimer"
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
  isSearchResult = false,
  highlightedPreview,
}: {
  item: MurmureEntry;
  currentTheme: any;
  onOpenPreview: (entry: MurmureEntry) => void;
  onShareEntry: (entry: MurmureEntry) => void;
  onRestoreFromTrash: (entry: MurmureEntry) => void;
  onDeletePermanently: (entry: MurmureEntry) => void;
  getDaysUntilDeletion: (entry: MurmureEntry) => number | null;
  isSearchResult?: boolean;
  highlightedPreview?: string;
}) => {
  const isEmpty = item.content.trim().length === 0;
  const [menuVisible, setMenuVisible] = useState(false);
  const daysLeft = getDaysUntilDeletion(item);

  const formattedDate = formatEntryDate(item.createdAt, {
    relative: true,
    showTime: false,
    fullFormat: false,
  });

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
            {formattedDate}
          </Text>
          <Text style={{ color: "#ef4444", fontSize: 12, marginLeft: 8 }}>
            🗑️
          </Text>
        </View>

        {isSearchResult && highlightedPreview ? (
          <HighlightedText
            text={highlightedPreview}
            style={{
              ...sidebarStyles.sidebarEntryPreview,
              color: currentTheme.textSecondary,
            }}
            highlightStyle={{
              backgroundColor: currentTheme.accent + "30",
              fontWeight: "600",
              color: currentTheme.accent,
            }}
            numberOfLines={2}
          />
        ) : (
          <Text
            style={[
              sidebarStyles.sidebarEntryPreview,
              { color: currentTheme.textSecondary },
            ]}
            numberOfLines={2}
          >
            {isEmpty ? "session vide" : item.previewText || "pas de preview"}
          </Text>
        )}

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
                : "expire aujourd'hui"}
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
            title="👁️ prévisualiser"
            titleStyle={{ color: currentTheme.text, fontSize: 14 }}
          />
          <Menu.Item
            onPress={handleRestore}
            title="♻️ restaurer"
            titleStyle={{ color: "#10b981", fontSize: 14 }}
          />
          <Menu.Item
            onPress={handleShareEntry}
            title="📤 partager"
            titleStyle={{ color: currentTheme.text, fontSize: 14 }}
          />
          <Menu.Item
            onPress={handleDeletePermanently}
            title="💀 supprimer définitivement"
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

  // ✅ Options de recherche intelligentes stables
  const searchOptions = useMemo(
    () => ({
      searchInContent: true,
      searchInPreview: true,
      searchInDate: true,
      caseSensitive: false,
      minScore: 0.1,
      minQueryLength: 3, // ✅ Minimum 3 caractères
      searchWholeWordsOnly: true, // ✅ Recherche par mots complets
    }),
    []
  );

  const sessionsSearch = useSearch(entries, searchOptions);
  const trashSearch = useSearch(trashEntries, searchOptions);

  // ✅ Obtenir les données à afficher selon l'onglet actif
  const displayData = useMemo(() => {
    if (activeTab === "sessions") {
      const search = sessionsSearch;
      const hasSearchQuery = search.searchStats.isActive;

      return {
        data: hasSearchQuery
          ? search.searchResults.map((result) => ({
              ...result.entry,
              isSearchResult: true,
              highlightedPreview: result.highlightedPreview,
            }))
          : entries,
        search,
        hasSearchQuery,
      };
    } else {
      const search = trashSearch;
      const hasSearchQuery = search.searchStats.isActive;

      return {
        data: hasSearchQuery
          ? search.searchResults.map((result) => ({
              ...result.entry,
              isSearchResult: true,
              highlightedPreview: result.highlightedPreview,
            }))
          : trashEntries,
        search,
        hasSearchQuery,
      };
    }
  }, [activeTab, sessionsSearch, trashSearch, entries, trashEntries]);

  const handleEmptyTrash = () => {
    if (trashEntries.length === 0) return;

    if (Platform.OS === "web") {
      if (
        window.confirm(
          `vider la corbeille ?\n\n${trashEntries.length} session${
            trashEntries.length > 1 ? "s" : ""
          } sera${
            trashEntries.length > 1 ? "ont" : ""
          } définitivement supprimée${
            trashEntries.length > 1 ? "s" : ""
          }.\n\n⚠️ cette action est irréversible !`
        )
      ) {
        onEmptyTrash();
      }
    } else {
      Alert.alert(
        "vider la corbeille ?",
        `${trashEntries.length} session${
          trashEntries.length > 1 ? "s" : ""
        } sera${trashEntries.length > 1 ? "ont" : ""} définitivement supprimée${
          trashEntries.length > 1 ? "s" : ""
        }.\n\n⚠️ cette action est irréversible !`,
        [
          { text: "annuler", style: "cancel" },
          {
            text: "vider la corbeille",
            style: "destructive",
            onPress: onEmptyTrash,
          },
        ]
      );
    }
  };

  const renderActiveEntry = ({ item }: { item: any }) => (
    <ActiveEntry
      item={item}
      currentTheme={currentTheme}
      currentEntry={currentEntry}
      onLoadEntry={onLoadEntry}
      onOpenPreview={onOpenPreview}
      onShareEntry={onShareEntry}
      onMoveToTrash={onMoveToTrash}
      isSearchResult={item.isSearchResult}
      highlightedPreview={item.highlightedPreview}
    />
  );

  const renderTrashEntry = ({ item }: { item: any }) => (
    <TrashEntry
      item={item}
      currentTheme={currentTheme}
      onOpenPreview={onOpenPreview}
      onShareEntry={onShareEntry}
      onRestoreFromTrash={onRestoreFromTrash}
      onDeletePermanently={onDeletePermanently}
      getDaysUntilDeletion={getDaysUntilDeletion}
      isSearchResult={item.isSearchResult}
      highlightedPreview={item.highlightedPreview}
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
              sessions ({entries.length})
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
              🗑️ corbeille ({trashEntries.length})
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

      {/* ✅ Barre de recherche avec statistiques intelligentes */}
      <SearchBar
        currentTheme={currentTheme}
        searchQuery={displayData.search.searchQuery}
        onSearchChange={displayData.search.updateSearchQuery}
        onSearchClear={displayData.search.clearSearch}
        totalResults={displayData.search.searchStats.totalResults}
        isSearching={displayData.search.isSearching}
        searchStats={displayData.search.searchStats}
        placeholder={
          activeTab === "sessions"
            ? "rechercher dans les sessions..."
            : "rechercher dans la corbeille..."
        }
      />

      {activeTab === "sessions" ? (
        <FlatList
          data={displayData.data}
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
                {displayData.hasSearchQuery
                  ? "aucun résultat trouvé"
                  : "aucune session"}
              </Text>
            </View>
          }
        />
      ) : (
        <View style={{ flex: 1 }}>
          {trashEntries.length > 0 && !displayData.hasSearchQuery && (
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
                  vider la corbeille
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={displayData.data}
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
                  {displayData.hasSearchQuery
                    ? "aucun résultat trouvé"
                    : "corbeille vide"}
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
