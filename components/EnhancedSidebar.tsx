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

interface SimplifiedSidebarProps {
  currentTheme: any;
  currentEntry: MurmureEntry | null;
  entries: MurmureEntry[];
  trashEntries: MurmureEntry[];
  onClose: () => void;
  onLoadEntry: (entry: MurmureEntry) => void;
  onDataChanged: () => void;
  onShareEntry: (entry: MurmureEntry) => void;
  onMoveToTrash: (entry: MurmureEntry) => void;
  onRestoreFromTrash: (entry: MurmureEntry) => void;
  onDeletePermanently: (entry: MurmureEntry) => void;
  onEmptyTrash: () => void;
  getDaysUntilDeletion: (entry: MurmureEntry) => number | null;
  onExportEntry: (entry: MurmureEntry) => void;
}

type SidebarTab = "sessions" | "trash";

// ✅ Composant Session unifié pour tous les plateformes
const SessionEntry = ({
  item,
  currentTheme,
  currentEntry,
  onLoadEntry,
  onMoveToTrash,
  onExportEntry,
  isSearchResult = false,
  highlightedPreview,
}: {
  item: MurmureEntry;
  currentTheme: any;
  currentEntry: MurmureEntry | null;
  onLoadEntry: (entry: MurmureEntry) => void;
  onMoveToTrash: (entry: MurmureEntry) => void;
  onExportEntry: (entry: MurmureEntry) => void;
  isSearchResult?: boolean;
  highlightedPreview?: string;
}) => {
  const isActive = currentEntry?.id === item.id;
  const isEmpty = item.content.trim().length === 0;
  const [menuVisible, setMenuVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formattedDate = formatEntryDate(item.createdAt, {
    relative: true,
    showTime: false,
    fullFormat: false,
  });

  const dateColorIntensity = getDateColorIntensity(item.createdAt);

  // ✅ Export unifié
  const handleExport = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      onExportEntry(item);
      setMenuVisible(false);
    } catch (error) {
      console.error("❌ [SessionEntry] Erreur export:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Suppression avec confirmation unifiée
  const handleDelete = async () => {
    if (isProcessing) return;
    setMenuVisible(false);
    setIsProcessing(true);

    try {
      const itemName =
        item.previewText || item.content.substring(0, 50) || "Session vide";

      if (Platform.OS === "web") {
        const confirmed = window.confirm(
          `Déplacer vers la corbeille ?\n\n"${itemName}"\n\nSuppression définitive dans 30 jours.`
        );
        if (!confirmed) {
          setIsProcessing(false);
          return;
        }
        await onMoveToTrash(item);
      } else {
        // ✅ Android/iOS - Menu natif unifié
        Alert.alert(
          "Déplacer vers la corbeille ?",
          `Déplacer "${itemName}" vers la corbeille ?\n\nSuppression définitive dans 30 jours.`,
          [
            {
              text: "Annuler",
              style: "cancel",
              onPress: () => setIsProcessing(false),
            },
            {
              text: "Déplacer",
              style: "destructive",
              onPress: async () => {
                try {
                  await onMoveToTrash(item);
                } catch (error) {
                  console.error("❌ [SessionEntry] Erreur suppression:", error);
                } finally {
                  setIsProcessing(false);
                }
              },
            },
          ]
        );
        return;
      }
    } catch (error) {
      console.error("❌ [SessionEntry] Erreur dans handleDelete:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Menu contextuel Android unifié
  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // ✅ Menu Android natif identique au design
      Alert.alert("Actions", `Session du ${formattedDate}`, [
        {
          text: "📤 Exporter",
          onPress: handleExport,
        },
        {
          text: "🗑️ Supprimer",
          style: "destructive",
          onPress: handleDelete,
        },
        {
          text: "Annuler",
          style: "cancel",
        },
      ]);
    }
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
            opacity: isProcessing ? 0.6 : 1,
            // ✅ Design unifié Android
            ...(Platform.OS === "android" && {
              elevation: isActive ? 2 : 0,
              borderRadius: 8,
              marginHorizontal: 4,
              marginVertical: 2,
            }),
          },
        ]}
        onPress={() => !isProcessing && onLoadEntry(item)}
        onLongPress={handleLongPress}
        disabled={isProcessing}
        // ✅ Feedback Android unifié
        {...(Platform.OS === "android" && {
          android_ripple: {
            color: currentTheme.accent + "30",
            borderless: false,
          },
        })}
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

      {/* ✅ Menu Web uniquement */}
      {Platform.OS === "web" && (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          contentStyle={{
            backgroundColor: currentTheme.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: currentTheme.border,
            minWidth: 140,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
          anchor={
            <TouchableOpacity
              onPress={() => !isProcessing && setMenuVisible(true)}
              style={[
                sidebarStyles.webActionsButtonExternal,
                {
                  backgroundColor: currentTheme.surface,
                  borderColor: currentTheme.border,
                },
              ]}
              disabled={isProcessing}
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
            onPress={handleExport}
            title="📤 Export"
            disabled={isProcessing}
            titleStyle={{ color: currentTheme.text, fontSize: 14 }}
          />
          <Menu.Item
            onPress={handleDelete}
            title="🗑️ Supprimer"
            disabled={isProcessing}
            titleStyle={{ color: "#ef4444", fontSize: 14 }}
          />
        </Menu>
      )}
    </View>
  );
};

// ✅ Composant Corbeille unifié pour tous les plateformes
const TrashEntry = ({
  item,
  currentTheme,
  onLoadEntry,
  onRestoreFromTrash,
  onDeletePermanently,
  getDaysUntilDeletion,
  isSearchResult = false,
  highlightedPreview,
}: {
  item: MurmureEntry;
  currentTheme: any;
  onLoadEntry: (entry: MurmureEntry) => void;
  onRestoreFromTrash: (entry: MurmureEntry) => void;
  onDeletePermanently: (entry: MurmureEntry) => void;
  getDaysUntilDeletion: (entry: MurmureEntry) => number | null;
  isSearchResult?: boolean;
  highlightedPreview?: string;
}) => {
  const isEmpty = item.content.trim().length === 0;
  const [menuVisible, setMenuVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const daysLeft = getDaysUntilDeletion(item);

  const formattedDate = formatEntryDate(item.createdAt, {
    relative: true,
    showTime: false,
    fullFormat: false,
  });

  const dateColorIntensity = getDateColorIntensity(item.createdAt);

  // ✅ Restauration avec confirmation unifiée
  const handleRestore = async () => {
    if (isProcessing) return;
    setMenuVisible(false);
    setIsProcessing(true);

    try {
      const itemName =
        item.previewText || item.content.substring(0, 50) || "Session vide";

      if (Platform.OS === "web") {
        const confirmed = window.confirm(
          `Restaurer "${itemName}" depuis la corbeille ?`
        );
        if (!confirmed) {
          setIsProcessing(false);
          return;
        }
        await onRestoreFromTrash(item);
      } else {
        Alert.alert(
          "Restaurer depuis la corbeille ?",
          `Restaurer "${itemName}" depuis la corbeille ?`,
          [
            {
              text: "Annuler",
              style: "cancel",
              onPress: () => setIsProcessing(false),
            },
            {
              text: "Restaurer",
              onPress: async () => {
                try {
                  await onRestoreFromTrash(item);
                } catch (error) {
                  console.error("❌ [TrashEntry] Erreur restauration:", error);
                } finally {
                  setIsProcessing(false);
                }
              },
            },
          ]
        );
        return;
      }
    } catch (error) {
      console.error("❌ [TrashEntry] Erreur restauration:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Suppression définitive avec confirmation unifiée
  const handleDeletePermanently = async () => {
    if (isProcessing) return;
    setMenuVisible(false);
    setIsProcessing(true);

    try {
      const itemName =
        item.previewText || item.content.substring(0, 50) || "Session vide";

      if (Platform.OS === "web") {
        const confirmed = window.confirm(
          `Supprimer définitivement ?\n\n"${itemName}"\n\n⚠️ Cette action est irréversible !`
        );
        if (!confirmed) {
          setIsProcessing(false);
          return;
        }
        await onDeletePermanently(item);
      } else {
        Alert.alert(
          "Suppression définitive ?",
          `Supprimer définitivement ?\n\n"${itemName}"\n\n⚠️ Cette action est irréversible !`,
          [
            {
              text: "Annuler",
              style: "cancel",
              onPress: () => setIsProcessing(false),
            },
            {
              text: "Supprimer définitivement",
              style: "destructive",
              onPress: async () => {
                try {
                  await onDeletePermanently(item);
                } catch (error) {
                  console.error(
                    "❌ [TrashEntry] Erreur suppression définitive:",
                    error
                  );
                } finally {
                  setIsProcessing(false);
                }
              },
            },
          ]
        );
        return;
      }
    } catch (error) {
      console.error("❌ [TrashEntry] Erreur suppression définitive:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Menu contextuel Android unifié
  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      Alert.alert("Actions", `Session du ${formattedDate} (Corbeille)`, [
        {
          text: "♻️ Restaurer",
          onPress: handleRestore,
        },
        {
          text: "💀 Supprimer définitivement",
          style: "destructive",
          onPress: handleDeletePermanently,
        },
        {
          text: "Annuler",
          style: "cancel",
        },
      ]);
    }
  };

  return (
    <View style={sidebarStyles.sidebarEntryContainer}>
      <TouchableOpacity
        style={[
          sidebarStyles.sidebarEntry,
          {
            backgroundColor: "transparent",
            borderLeftColor: `${currentTheme.accent}${Math.round(
              dateColorIntensity * 255
            )
              .toString(16)
              .padStart(2, "0")}`,
            opacity: isProcessing ? 0.6 : 1,
            // ✅ Design unifié Android pour corbeille
            ...(Platform.OS === "android" && {
              elevation: 0,
              borderRadius: 8,
              marginHorizontal: 4,
              marginVertical: 2,
              backgroundColor: "#ef444408", // Léger arrière-plan rouge
            }),
          },
        ]}
        onPress={() => !isProcessing && onLoadEntry(item)}
        onLongPress={handleLongPress}
        disabled={isProcessing}
        {...(Platform.OS === "android" && {
          android_ripple : {
            color: "#ef444430",
            borderless: false,
          },
        })}
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

      {/* ✅ Menu Web uniquement */}
      {Platform.OS === "web" && (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          contentStyle={{
            backgroundColor: currentTheme.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: currentTheme.border,
            minWidth: 140,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
          anchor={
            <TouchableOpacity
              onPress={() => !isProcessing && setMenuVisible(true)}
              style={[
                sidebarStyles.webActionsButtonExternal,
                {
                  backgroundColor: currentTheme.surface,
                  borderColor: "#ef4444",
                },
              ]}
              disabled={isProcessing}
            >
              <Text
                style={[sidebarStyles.webActionsIcon, { color: "#ef4444" }]}
              >
                ⋯
              </Text>
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={handleRestore}
            title="♻️ Restaurer"
            disabled={isProcessing}
            titleStyle={{ color: "#10b981", fontSize: 14 }}
          />
          <Menu.Item
            onPress={handleDeletePermanently}
            title="💀 Supprimer définitivement"
            disabled={isProcessing}
            titleStyle={{ color: "#ef4444", fontSize: 14 }}
          />
        </Menu>
      )}
    </View>
  );
};

// ✅ Composant principal avec design unifié
const SimplifiedSidebar = ({
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
  onDataChanged,
  onExportEntry,
}: SimplifiedSidebarProps) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("sessions");
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);

  const searchOptions = useMemo(
    () => ({
      searchInContent: true,
      searchInPreview: true,
      searchInDate: false,
      caseSensitive: false,
      minScore: 0.1,
      minQueryLength: 2,
      searchWholeWordsOnly: false,
    }),
    []
  );

  const sessionsSearch = useSearch(entries, searchOptions);
  const trashSearch = useSearch(trashEntries, searchOptions);

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

  // ✅ Vidage corbeille avec confirmation unifiée
  const handleEmptyTrash = async () => {
    if (trashEntries.length === 0 || isEmptyingTrash) return;
    setIsEmptyingTrash(true);

    try {
      if (Platform.OS === "web") {
        const confirmed = window.confirm(
          `Vider la corbeille ?\n\n${trashEntries.length} session${
            trashEntries.length > 1 ? "s" : ""
          } sera${
            trashEntries.length > 1 ? "ont" : ""
          } définitivement supprimée${
            trashEntries.length > 1 ? "s" : ""
          }.\n\n⚠️ Cette action est irréversible !`
        );
        if (!confirmed) {
          setIsEmptyingTrash(false);
          return;
        }
        await onEmptyTrash();
      } else {
        Alert.alert(
          "Vider la corbeille ?",
          `${trashEntries.length} session${
            trashEntries.length > 1 ? "s" : ""
          } sera${
            trashEntries.length > 1 ? "ont" : ""
          } définitivement supprimée${
            trashEntries.length > 1 ? "s" : ""
          }.\n\n⚠️ Cette action est irréversible !`,
          [
            {
              text: "Annuler",
              style: "cancel",
              onPress: () => setIsEmptyingTrash(false),
            },
            {
              text: "Vider la corbeille",
              style: "destructive",
              onPress: async () => {
                try {
                  await onEmptyTrash();
                } catch (error) {
                  console.error(
                    "❌ [SimplifiedSidebar] Erreur vidage corbeille:",
                    error
                  );
                } finally {
                  setIsEmptyingTrash(false);
                }
              },
            },
          ]
        );
        return;
      }
    } catch (error) {
      console.error("❌ [SimplifiedSidebar] Erreur vidage corbeille:", error);
    } finally {
      setIsEmptyingTrash(false);
    }
  };

  const renderSessionEntry = ({ item }: { item: any }) => (
    <SessionEntry
      item={item}
      currentTheme={currentTheme}
      currentEntry={currentEntry}
      onLoadEntry={onLoadEntry}
      onMoveToTrash={onMoveToTrash}
      onExportEntry={onExportEntry}
      isSearchResult={item.isSearchResult}
      highlightedPreview={item.highlightedPreview}
    />
  );

  const renderTrashEntry = ({ item }: { item: any }) => (
    <TrashEntry
      item={item}
      currentTheme={currentTheme}
      onLoadEntry={onLoadEntry}
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
          // ✅ Design unifié Android
          ...(Platform.OS === "android" && {
            elevation: 8,
            shadowColor: "#000",
          }),
        },
      ]}
    >
      {/* ✅ Header unifié */}
      <View
        style={[
          sidebarStyles.sidebarHeader,
          {
            borderBottomColor: currentTheme.border,
            // ✅ Padding unifié Android
            ...(Platform.OS === "android" && {
              paddingTop: 8,
              elevation: 2,
            }),
          },
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
            {...(Platform.OS === "android" && {
              android_ripple: {
                color: currentTheme.accent + "30",
                borderless: false,
              },
            })}
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
            {...(Platform.OS === "android" && {
              android_ripple: {
                color: currentTheme.accent + "30",
                borderless: false,
              },
            })}
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

        <TouchableOpacity
          onPress={onClose}
          {...(Platform.OS === "android" && {
            android_ripple: {
              color: currentTheme.accent + "30",
              borderless: false,
            },
          })}
        >
          <Text
            style={[sidebarStyles.sidebarClose, { color: currentTheme.muted }]}
          >
            ×
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Barre de recherche unifiée */}
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

      {/* ✅ Contenu unifié */}
      {activeTab === "sessions" ? (
        <FlatList
          data={displayData.data}
          renderItem={renderSessionEntry}
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
                disabled={isEmptyingTrash}
                style={{
                  backgroundColor: isEmptyingTrash ? "#ef444460" : "#ef4444",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  // ✅ Design unifié Android
                  ...(Platform.OS === "android" && {
                    elevation: isEmptyingTrash ? 0 : 2,
                  }),
                }}
                {...(Platform.OS === "android" && {
                  android_ripple: {
                    color: "#ffffff30",
                    borderless: false,
                  },
                })}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    fontWeight: "600",
                    opacity: isEmptyingTrash ? 0.7 : 1,
                  }}
                >
                  {isEmptyingTrash
                    ? "vidage en cours..."
                    : "🗑️ vider la corbeille"}
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

export { SimplifiedSidebar as EnhancedSidebar };
