// components/SearchBar.tsx - Version finale corrigée
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";

interface SearchBarProps {
  currentTheme: any;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchClear: () => void;
  totalResults: number;
  isSearching: boolean;
  placeholder?: string;
  // ✅ Nouvelles props pour les messages intelligents
  searchStats?: {
    isValidQuery: boolean;
    queryTooShort: boolean;
    needsWholeWords: boolean;
  };
}

export const SearchBar: React.FC<SearchBarProps> = ({
  currentTheme,
  searchQuery,
  onSearchChange,
  onSearchClear,
  totalResults,
  isSearching,
  placeholder = "rechercher dans l'historique...",
  searchStats,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Animation de focus
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || searchQuery.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, searchQuery, animatedValue]);

  const handleFocus = () => {
    setIsFocused(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleClear = () => {
    onSearchClear();
    inputRef.current?.blur();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Couleur de bordure animée
  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [currentTheme.border, currentTheme.accent],
  });

  // Couleur de fond animée
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [currentTheme.surface, currentTheme.accent + "10"],
  });

  // ✅ Fonction pour obtenir le message d'état intelligent
  const getStatusMessage = () => {
    if (searchQuery.length === 0) return "";

    if (isSearching) {
      return "recherche en cours...";
    }

    if (searchStats) {
      if (searchStats.queryTooShort) {
        return "tapez au moins 3 caractères pour rechercher...";
      }

      if (searchStats.needsWholeWords) {
        return "utilisez des mots complets de 3+ caractères...";
      }

      if (!searchStats.isValidQuery) {
        return "requête non valide...";
      }
    }

    if (totalResults === 0) {
      return "aucun résultat trouvé";
    }

    return `${totalResults} résultat${totalResults > 1 ? "s" : ""} trouvé${
      totalResults > 1 ? "s" : ""
    }`;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.searchContainer,
          {
            borderColor,
            backgroundColor,
          },
        ]}
      >
        {/* Icône de recherche */}
        <View style={styles.iconContainer}>
          <Text
            style={[
              styles.searchIcon,
              {
                color:
                  isFocused || searchQuery.length > 0
                    ? currentTheme.accent
                    : currentTheme.muted,
              },
            ]}
          >
            🔍
          </Text>
        </View>

        {/* Champ de saisie */}
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            {
              color: currentTheme.text,
              ...(Platform.OS === "web" &&
                ({
                  outline: "none",
                  border: "none",
                  boxShadow: "none",
                } as any)),
            },
          ]}
          value={searchQuery}
          onChangeText={onSearchChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={currentTheme.muted}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="never"
        />

        {/* Bouton clear ou indicateur de chargement */}
        <View style={styles.rightContainer}>
          {isSearching && (
            <Text style={[styles.loadingText, { color: currentTheme.muted }]}>
              ⏳
            </Text>
          )}

          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity
              onPress={handleClear}
              style={[
                styles.clearButton,
                { backgroundColor: currentTheme.muted + "20" },
              ]}
            >
              <Text
                style={[styles.clearButtonText, { color: currentTheme.muted }]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* ✅ Indicateur de résultats avec messages intelligents */}
      {searchQuery.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text
            style={[
              styles.resultsText,
              {
                color:
                  searchStats?.queryTooShort || searchStats?.needsWholeWords
                    ? currentTheme.muted
                    : currentTheme.textSecondary,
              },
            ]}
          >
            {getStatusMessage()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  resultsContainer: {
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  resultsText: {
    fontSize: 12,
    fontStyle: "italic",
  },
});
