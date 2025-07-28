import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { ThemeSelectorProps, ThemeInfo } from "@/types/theme";

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  visible,
  onClose,
  currentTheme,
  currentThemeName,
  isDarkMode,
  onThemeChange,
  onToggleDarkMode,
  getThemesList,
}) => {
  const themes = getThemesList();

  const renderThemeItem = ({ item }: { item: ThemeInfo }) => {
    const isSelected = item.key === currentThemeName;

    return (
      <TouchableOpacity
        onPress={() => onThemeChange(item.key)}
        style={[
          styles.themeItem,
          {
            backgroundColor: isSelected
              ? currentTheme.accent + "20"
              : "transparent",
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? currentTheme.accent : currentTheme.border,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Sélectionner le thème ${item.name}`}
        accessibilityState={{ selected: isSelected }}
      >
        {/* Aperçu des couleurs */}
        <View style={styles.colorPreview}>
          <View
            style={[
              styles.colorSample,
              {
                backgroundColor: item.colors.accent,
                borderColor: currentTheme.border,
              },
            ]}
          />
          <View
            style={[
              styles.colorSample,
              {
                backgroundColor: item.colors.surface,
                borderColor: item.colors.border,
              },
            ]}
          />
        </View>

        <Text
          style={[
            styles.themeName,
            {
              color: isSelected ? currentTheme.accent : currentTheme.text,
              fontWeight: isSelected ? "600" : "400",
            },
          ]}
        >
          {item.name}
        </Text>

        {isSelected && (
          <Text style={[styles.selectedIcon, { color: currentTheme.accent }]}>
            ✓
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: ThemeInfo) => item.key;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[styles.container, { backgroundColor: currentTheme.background }]}
      >
        {/* Header */}
        <View
          style={[styles.header, { borderBottomColor: currentTheme.border }]}
        >
          <Text style={[styles.title, { color: currentTheme.text }]}>
            Choisir un thème
          </Text>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fermer le sélecteur de thème"
          >
            <Text style={[styles.closeButton, { color: currentTheme.text }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        {/* Toggle Dark Mode */}
        <View style={styles.darkModeSection}>
          <TouchableOpacity
            onPress={onToggleDarkMode}
            style={[
              styles.darkModeToggle,
              {
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border,
              },
            ]}
            accessibilityRole="switch"
            accessibilityState={{ checked: isDarkMode }}
            accessibilityLabel={`${
              isDarkMode ? "Désactiver" : "Activer"
            } le mode sombre`}
          >
            <Text style={[styles.darkModeLabel, { color: currentTheme.text }]}>
              {isDarkMode ? "🌙 Mode sombre" : "☀️ Mode clair"}
            </Text>
            <View
              style={[
                styles.switchContainer,
                {
                  backgroundColor: isDarkMode
                    ? currentTheme.accent
                    : currentTheme.border,
                },
              ]}
            >
              <View
                style={[
                  styles.switchThumb,
                  {
                    alignSelf: isDarkMode ? "flex-end" : "flex-start",
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Liste des thèmes */}
        <FlatList
          data={themes}
          renderItem={renderThemeItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.themesList}
          showsVerticalScrollIndicator={false}
          accessibilityRole="list"
        />

        {/* Footer avec info */}
        <View style={[styles.footer, { borderTopColor: currentTheme.border }]}>
          <Text style={[styles.footerText, { color: currentTheme.muted }]}>
            Chaque thème a son mode clair et sombre
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    fontSize: 18,
    padding: 4,
  },
  darkModeSection: {
    padding: 20,
  },
  darkModeToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  darkModeLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  switchContainer: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
  },
  themesList: {
    padding: 20,
    paddingTop: 0,
  },
  themeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  colorPreview: {
    flexDirection: "row",
    marginRight: 12,
  },
  colorSample: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
    borderWidth: 1,
  },
  themeName: {
    flex: 1,
    fontSize: 16,
  },
  selectedIcon: {
    fontSize: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
  },
});

export default ThemeSelector;
