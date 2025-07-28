import React from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { ThemeName } from "@/hooks/useAdvancedTheme";

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
  currentTheme: any;
  currentThemeName: ThemeName;
  isDarkMode: boolean;
  onThemeChange: (themeName: ThemeName) => void;
  onToggleDarkMode: () => void;
  getThemesList: () => { key: ThemeName; name: string; colors: any }[];
}

export const ThemeSelector = ({
  visible,
  onClose,
  currentTheme,
  currentThemeName,
  isDarkMode,
  onThemeChange,
  onToggleDarkMode,
  getThemesList,
}: ThemeSelectorProps) => {
  const themes = getThemesList();

  const renderThemeItem = ({ item }: { item: (typeof themes)[0] }) => {
    const isSelected = item.key === currentThemeName;

    return (
      <TouchableOpacity
        onPress={() => onThemeChange(item.key)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          backgroundColor: isSelected
            ? currentTheme.accent + "20"
            : "transparent",
          borderRadius: 12,
          marginVertical: 4,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? currentTheme.accent : currentTheme.border,
        }}
      >
        {/* Aperçu des couleurs */}
        <View style={{ flexDirection: "row", marginRight: 12 }}>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: item.colors.accent,
              marginRight: 4,
              borderWidth: 1,
              borderColor: currentTheme.border,
            }}
          />
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: item.colors.surface,
              borderWidth: 1,
              borderColor: item.colors.border,
            }}
          />
        </View>

        <Text
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight: isSelected ? "600" : "400",
            color: isSelected ? currentTheme.accent : currentTheme.text,
          }}
        >
          {item.name}
        </Text>

        {isSelected && (
          <Text style={{ color: currentTheme.accent, fontSize: 16 }}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: currentTheme.background,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.border,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              color: currentTheme.text,
            }}
          >
            Choisir un thème
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text
              style={{
                fontSize: 18,
                color: currentTheme.text,
              }}
            >
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* Toggle Dark Mode */}
        <View style={{ padding: 20 }}>
          <TouchableOpacity
            onPress={onToggleDarkMode}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
              backgroundColor: currentTheme.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: currentTheme.border,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "500",
                color: currentTheme.text,
              }}
            >
              {isDarkMode ? "🌙 Mode sombre" : "☀️ Mode clair"}
            </Text>
            <View
              style={{
                width: 50,
                height: 30,
                borderRadius: 15,
                backgroundColor: isDarkMode
                  ? currentTheme.accent
                  : currentTheme.border,
                justifyContent: "center",
                paddingHorizontal: 3,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "white",
                  alignSelf: isDarkMode ? "flex-end" : "flex-start",
                }}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Liste des thèmes */}
        <FlatList
          data={themes}
          renderItem={renderThemeItem}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ padding: 20, paddingTop: 0 }}
          showsVerticalScrollIndicator={false}
        />

        {/* Footer avec info */}
        <View
          style={{
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: currentTheme.border,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 12,
              color: currentTheme.muted,
            }}
          >
            Chaque thème a son mode clair et sombre
          </Text>
        </View>
      </View>
    </Modal>
  );
};
