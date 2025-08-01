import { useState, useCallback, useMemo, useEffect } from "react";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ThemeName,
  ThemeCollection,
  ThemeInfo,
  MurmureTheme,
  UseAdvancedThemeReturn,
  ThemePreferences,
  ThemeHookConfig,
  isValidThemeName,
} from "@/types/theme";

// Configuration par défaut
const DEFAULT_CONFIG: Required<ThemeHookConfig> = {
  persistPreferences: true,
  storageKey: "murmure_theme_preferences",
  defaultTheme: "papyrus",
  defaultMode: "light",
};

// Définition complète des thèmes avec types stricts
const customThemes: ThemeCollection = {
  ocean: {
    name: "Ocean 🌊",
    light: {
      colors: {
        primary: "#006494",
        primaryContainer: "#cae6ff",
        secondary: "#4f616a",
        secondaryContainer: "#d2e6f1",
        tertiary: "#5d5b7d",
        surface: "#f8fdff",
        surfaceVariant: "#dce4e9",
        background: "#f8fdff",
        error: "#ba1a1a",
        onPrimary: "#ffffff",
        onSecondary: "#ffffff",
        onSurface: "#191c1e",
        onBackground: "#191c1e",
        outline: "#6f797a",
      },
      murmure: {
        background: "#f0f8ff",
        surface: "#ffffff",
        text: "#1a3a52",
        textSecondary: "#4f616a",
        border: "#b3d1e8",
        accent: "#006494",
        muted: "#89a4b0",
      },
    },
    dark: {
      colors: {
        primary: "#90cdf4",
        primaryContainer: "#00497a",
        secondary: "#b6cad6",
        secondaryContainer: "#374951",
        tertiary: "#c7c5dd",
        surface: "#0f1416",
        surfaceVariant: "#40484c",
        background: "#0f1416",
        error: "#ffb4ab",
        onPrimary: "#00344f",
        onSecondary: "#20333a",
        onSurface: "#c4c7c8",
        onBackground: "#c4c7c8",
        outline: "#8a9294",
      },
      murmure: {
        background: "#0a1520",
        surface: "#1a2530",
        text: "#e0e8f0",
        textSecondary: "#b6cad6",
        border: "#2a3c48",
        accent: "#90cdf4",
        muted: "#6a7d88",
      },
    },
  },

  forest: {
    name: "Forest 🌲",
    light: {
      colors: {
        primary: "#2d5a27",
        primaryContainer: "#b4f39e",
        secondary: "#52634f",
        secondaryContainer: "#d5e8cf",
        tertiary: "#39656b",
        surface: "#f8fdf6",
        surfaceVariant: "#dee5d9",
        background: "#f8fdf6",
        error: "#ba1a1a",
        onPrimary: "#ffffff",
        onSecondary: "#ffffff",
        onSurface: "#191d18",
        onBackground: "#191d18",
        outline: "#72796f",
      },
      murmure: {
        background: "#f0f8ed",
        surface: "#ffffff",
        text: "#1a2e17",
        textSecondary: "#52634f",
        border: "#c4d6be",
        accent: "#2d5a27",
        muted: "#7a8a76",
      },
    },
    dark: {
      colors: {
        primary: "#99d584",
        primaryContainer: "#0f3f0b",
        secondary: "#b9ccb4",
        secondaryContainer: "#3a4b37",
        tertiary: "#a0d0d6",
        surface: "#101511",
        surfaceVariant: "#414942",
        background: "#101511",
        error: "#ffb4ab",
        onPrimary: "#003a02",
        onSecondary: "#243425",
        onSurface: "#c2c8bc",
        onBackground: "#c2c8bc",
        outline: "#8c9388",
      },
      murmure: {
        background: "#0d1a0a",
        surface: "#1d2a1a",
        text: "#e0f0dd",
        textSecondary: "#b9ccb4",
        border: "#2d3f2a",
        accent: "#99d584",
        muted: "#6a7a66",
      },
    },
  },

  sunset: {
    name: "Sunset 🌅",
    light: {
      colors: {
        primary: "#b8390e",
        primaryContainer: "#ffdbca",
        secondary: "#75574a",
        secondaryContainer: "#ffdbca",
        tertiary: "#645c42",
        surface: "#fffbf8",
        surfaceVariant: "#f5ddd6",
        background: "#fffbf8",
        error: "#ba1a1a",
        onPrimary: "#ffffff",
        onSecondary: "#ffffff",
        onSurface: "#221a16",
        onBackground: "#221a16",
        outline: "#85736b",
      },
      murmure: {
        background: "#fff8f3",
        surface: "#ffffff",
        text: "#3d2419",
        textSecondary: "#75574a",
        border: "#e8d0c4",
        accent: "#b8390e",
        muted: "#a08a7d",
      },
    },
    dark: {
      colors: {
        primary: "#ffb692",
        primaryContainer: "#8f2700",
        secondary: "#e7bdb0",
        secondaryContainer: "#5c3f33",
        tertiary: "#d4c2a0",
        surface: "#1a110e",
        surfaceVariant: "#52443d",
        background: "#1a110e",
        error: "#ffb4ab",
        onPrimary: "#5c1900",
        onSecondary: "#43291e",
        onSurface: "#f0dedb",
        onBackground: "#f0dedb",
        outline: "#9c8d84",
      },
      murmure: {
        background: "#1a0f08",
        surface: "#2a1f18",
        text: "#f0dedb",
        textSecondary: "#e7bdb0",
        border: "#3d2f26",
        accent: "#ffb692",
        muted: "#8c7d74",
      },
    },
  },

  lavender: {
    name: "Lavender 💜",
    light: {
      colors: {
        primary: "#6947c0",
        primaryContainer: "#eaddff",
        secondary: "#625b71",
        secondaryContainer: "#e8def8",
        tertiary: "#7d5260",
        surface: "#fef7ff",
        surfaceVariant: "#e7e0ec",
        background: "#fef7ff",
        error: "#ba1a1a",
        onPrimary: "#ffffff",
        onSecondary: "#ffffff",
        onSurface: "#1d1b20",
        onBackground: "#1d1b20",
        outline: "#79747e",
      },
      murmure: {
        background: "#fcf4ff",
        surface: "#ffffff",
        text: "#2d1d3d",
        textSecondary: "#625b71",
        border: "#d4c7e0",
        accent: "#6947c0",
        muted: "#8a7f96",
      },
    },
    dark: {
      colors: {
        primary: "#d0bcff",
        primaryContainer: "#4f2b99",
        secondary: "#ccc2dc",
        secondaryContainer: "#4a4458",
        tertiary: "#efb8c8",
        surface: "#141218",
        surfaceVariant: "#49454f",
        background: "#141218",
        error: "#ffb4ab",
        onPrimary: "#371e73",
        onSecondary: "#332d41",
        onSurface: "#e6e0e9",
        onBackground: "#e6e0e9",
        outline: "#938f99",
      },
      murmure: {
        background: "#0f0d14",
        surface: "#1f1d24",
        text: "#e6e0e9",
        textSecondary: "#ccc2dc",
        border: "#2f2d34",
        accent: "#d0bcff",
        muted: "#6a6576",
      },
    },
  },

  midnight: {
    name: "Midnight 🌙",
    light: {
      colors: {
        primary: "#1f2937",
        primaryContainer: "#e5e7eb",
        secondary: "#4b5563",
        secondaryContainer: "#e5e7eb",
        tertiary: "#374151",
        surface: "#f9fafb",
        surfaceVariant: "#e5e7eb",
        background: "#f9fafb",
        error: "#dc2626",
        onPrimary: "#ffffff",
        onSecondary: "#ffffff",
        onSurface: "#111827",
        onBackground: "#111827",
        outline: "#6b7280",
      },
      murmure: {
        background: "#f8fafc",
        surface: "#ffffff",
        text: "#1f2937",
        textSecondary: "#4b5563",
        border: "#d1d5db",
        accent: "#1f2937",
        muted: "#9ca3af",
      },
    },
    dark: {
      colors: {
        primary: "#f3f4f6",
        primaryContainer: "#374151",
        secondary: "#d1d5db",
        secondaryContainer: "#4b5563",
        tertiary: "#e5e7eb",
        surface: "#111827",
        surfaceVariant: "#374151",
        background: "#0f172a",
        error: "#f87171",
        onPrimary: "#1f2937",
        onSecondary: "#374151",
        onSurface: "#f9fafb",
        onBackground: "#f9fafb",
        outline: "#6b7280",
      },
      murmure: {
        background: "#0a0f1a",
        surface: "#1a202c",
        text: "#f7fafc",
        textSecondary: "#d1d5db",
        border: "#2d3748",
        accent: "#60a5fa",
        muted: "#718096",
      },
    },
  },

  papyrus: {
    name: "Papyrus 📜",
    light: {
      colors: {
        primary: "#8b4513",
        primaryContainer: "#f5deb3",
        secondary: "#a0522d",
        secondaryContainer: "#f5deb3",
        tertiary: "#cd853f",
        surface: "#faf0e6",
        surfaceVariant: "#f5deb3",
        background: "#fdf6e3",
        error: "#8b0000",
        onPrimary: "#ffffff",
        onSecondary: "#ffffff",
        onSurface: "#2f1b14",
        onBackground: "#2f1b14",
        outline: "#8b7355",
      },
      murmure: {
        background: "#fdf6e3",
        surface: "#fef9f0",
        text: "#2f1b14",
        textSecondary: "#5d4e37",
        border: "#d2b48c",
        accent: "#8b4513",
        muted: "#a0522d",
      },
    },
    dark: {
      colors: {
        primary: "#deb887",
        primaryContainer: "#5d4e37",
        secondary: "#d2b48c",
        secondaryContainer: "#704214",
        tertiary: "#f4a460",
        surface: "#1c1611",
        surfaceVariant: "#3e352a",
        background: "#181510",
        error: "#cd5c5c",
        onPrimary: "#2f1b14",
        onSecondary: "#2f1b14",
        onSurface: "#f5deb3",
        onBackground: "#f5deb3",
        outline: "#8b7355",
      },
      murmure: {
        background: "#1a1611",
        surface: "#2a241f",
        text: "#f5deb3",
        textSecondary: "#d2b48c",
        border: "#3e352a",
        accent: "#deb887",
        muted: "#8b7355",
      },
    },
  },

  matrix: {
    name: "Matrix 💚",
    light: {
      colors: {
        primary: "#008f11",
        primaryContainer: "#c7f7c7",
        secondary: "#00ff41",
        secondaryContainer: "#e8f8e8",
        tertiary: "#32cd32",
        surface: "#f8fff8",
        surfaceVariant: "#e0ffe0",
        background: "#fafffe",
        error: "#ff0040",
        onPrimary: "#000000",
        onSecondary: "#000000",
        onSurface: "#003300",
        onBackground: "#001100",
        outline: "#008800",
      },
      murmure: {
        background: "#f0fff0",
        surface: "#ffffff",
        text: "#003300",
        textSecondary: "#006600",
        border: "#90ee90",
        accent: "#008f11",
        muted: "#32cd32",
      },
    },
    dark: {
      colors: {
        primary: "#00ff41",
        primaryContainer: "#004d00",
        secondary: "#39ff14",
        secondaryContainer: "#003300",
        tertiary: "#32cd32",
        surface: "#000d00",
        surfaceVariant: "#001a00",
        background: "#000000",
        error: "#ff0040",
        onPrimary: "#000000",
        onSecondary: "#000000",
        onSurface: "#00ff41",
        onBackground: "#00ff41",
        outline: "#008800",
      },
      murmure: {
        background: "#000000",
        surface: "#001100",
        text: "#00ff41",
        textSecondary: "#39ff14",
        border: "#003300",
        accent: "#00ff41",
        muted: "#008800",
      },
    },
  },

  inkwell: {
    name: "Inkwell 🖋️",
    light: {
      colors: {
        primary: "#191970",
        primaryContainer: "#e6e6fa",
        secondary: "#2f4f4f",
        secondaryContainer: "#f0f8ff",
        tertiary: "#483d8b",
        surface: "#fffef7",
        surfaceVariant: "#f8f8ff",
        background: "#fffffe",
        error: "#8b0000",
        onPrimary: "#ffffff",
        onSecondary: "#ffffff",
        onSurface: "#2f2f2f",
        onBackground: "#1a1a1a",
        outline: "#696969",
      },
      murmure: {
        background: "#fffffe",
        surface: "#fffff8",
        text: "#2f2f2f",
        textSecondary: "#4f4f4f",
        border: "#dcdcdc",
        accent: "#191970",
        muted: "#708090",
      },
    },
    dark: {
      colors: {
        primary: "#b0c4de",
        primaryContainer: "#2f4f4f",
        secondary: "#d3d3d3",
        secondaryContainer: "#191970",
        tertiary: "#9370db",
        surface: "#1c1c1c",
        surfaceVariant: "#2f2f2f",
        background: "#0f0f0f",
        error: "#cd5c5c",
        onPrimary: "#191970",
        onSecondary: "#2f2f2f",
        onSurface: "#f5f5f5",
        onBackground: "#f0f0f0",
        outline: "#808080",
      },
      murmure: {
        background: "#0f0f0f",
        surface: "#1c1c1c",
        text: "#f5f5f5",
        textSecondary: "#d3d3d3",
        border: "#2f2f2f",
        accent: "#b0c4de",
        muted: "#708090",
      },
    },
  },

  synthwave: {
    name: "Synthwave 🌆",
    light: {
      colors: {
        primary: "#ff006e",
        primaryContainer: "#ffe0ec",
        secondary: "#8338ec",
        secondaryContainer: "#f0e6ff",
        tertiary: "#3a86ff",
        surface: "#fff0f8",
        surfaceVariant: "#f8e8ff",
        background: "#fffafc",
        error: "#ff073a",
        onPrimary: "#ffffff",
        onSecondary: "#ffffff",
        onSurface: "#2d1b3d",
        onBackground: "#1a0a2e",
        outline: "#8b5a8c",
      },
      murmure: {
        background: "#fffafc",
        surface: "#ffffff",
        text: "#2d1b3d",
        textSecondary: "#5a4b7c",
        border: "#e0b3ff",
        accent: "#ff006e",
        muted: "#8338ec",
      },
    },
    dark: {
      colors: {
        primary: "#ff1b8d",
        primaryContainer: "#8b003d",
        secondary: "#a855f7",
        secondaryContainer: "#4c1d95",
        tertiary: "#06b6d4",
        surface: "#0f0514",
        surfaceVariant: "#2d1b3d",
        background: "#0a0118",
        error: "#ff2d92",
        onPrimary: "#ffffff",
        onSecondary: "#ffffff",
        onSurface: "#f0e6ff",
        onBackground: "#f8e8ff",
        outline: "#8b5a8c",
      },
      murmure: {
        background: "#0a0118",
        surface: "#1a0a2e",
        text: "#f0e6ff",
        textSecondary: "#d8b3ff",
        border: "#2d1b3d",
        accent: "#ff1b8d",
        muted: "#8b5a8c",
      },
    },
  },

  gothic: {
    name: "Gothic 🏰",
    light: {
      colors: {
        primary: "#722f37",
        primaryContainer: "#f2e6e6",
        secondary: "#8b4513",
        secondaryContainer: "#f5deb3",
        tertiary: "#2f4f4f",
        surface: "#fdf8f0",
        surfaceVariant: "#f0e6d2",
        background: "#fefcf8",
        error: "#8b0000",
        onPrimary: "#ffffff",
        onSecondary: "#ffffff",
        onSurface: "#3c2415",
        onBackground: "#2f1b14",
        outline: "#8b7355",
      },
      murmure: {
        background: "#fefcf8",
        surface: "#fdf9f3",
        text: "#3c2415",
        textSecondary: "#6b4423",
        border: "#d4c4a8",
        accent: "#722f37",
        muted: "#8b7355",
      },
    },
    dark: {
      colors: {
        primary: "#d2a679",
        primaryContainer: "#4a1e2a",
        secondary: "#deb887",
        secondaryContainer: "#5d4037",
        tertiary: "#b0bec5",
        surface: "#1a1611",
        surfaceVariant: "#3c2e1d",
        background: "#141210",
        error: "#cd5c5c",
        onPrimary: "#3c2415",
        onSecondary: "#2f1b14",
        onSurface: "#f0e6d2",
        onBackground: "#f5deb3",
        outline: "#8b7355",
      },
      murmure: {
        background: "#141210",
        surface: "#201d18",
        text: "#f0e6d2",
        textSecondary: "#d4c4a8",
        border: "#3c2e1d",
        accent: "#d2a679",
        muted: "#8b7355",
      },
    },
  },
} as const;

export const useAdvancedTheme = (
  config: ThemeHookConfig = {}
): UseAdvancedThemeReturn => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // États avec types stricts
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>(
    finalConfig.defaultTheme
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    finalConfig.defaultMode === "dark"
  );

  // Thème actuel calculé de manière mémorisée
  const currentTheme = useMemo((): MurmureTheme => {
    const themeDefinition = customThemes[currentThemeName];
    const mode = isDarkMode ? "dark" : "light";
    return themeDefinition[mode].murmure;
  }, [currentThemeName, isDarkMode]);

  // Thème Paper calculé de manière mémorisée
  const paperTheme = useMemo(() => {
    const themeDefinition = customThemes[currentThemeName];
    const mode = isDarkMode ? "dark" : "light";
    return themeDefinition[mode];
  }, [currentThemeName, isDarkMode]);

  // Sauvegarde des préférences
  const savePreferences = useCallback(
    async (themeName: ThemeName, darkMode: boolean) => {
      if (!finalConfig.persistPreferences) return;

      try {
        const preferences: ThemePreferences = {
          themeName,
          isDarkMode: darkMode,
        };
        await AsyncStorage.setItem(
          finalConfig.storageKey,
          JSON.stringify(preferences)
        );
      } catch (error) {
        console.warn("Erreur sauvegarde préférences thème:", error);
      }
    },
    [finalConfig.persistPreferences, finalConfig.storageKey]
  );

  // Chargement des préférences au démarrage
  useEffect(() => {
    if (!finalConfig.persistPreferences) return;

    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem(finalConfig.storageKey);
        if (!stored) return;

        const preferences: ThemePreferences = JSON.parse(stored);

        // Validation avec type guards
        if (isValidThemeName(preferences.themeName)) {
          setCurrentThemeName(preferences.themeName);
        }

        if (typeof preferences.isDarkMode === "boolean") {
          setIsDarkMode(preferences.isDarkMode);
        }
      } catch (error) {
        console.warn("Erreur chargement préférences thème:", error);
      }
    };

    loadPreferences();
  }, [finalConfig.persistPreferences, finalConfig.storageKey]);

  // Action de changement de thème avec validation
  const changeTheme = useCallback(
    (themeName: ThemeName) => {
      if (!isValidThemeName(themeName)) {
        console.error(`Nom de thème invalide: ${themeName}`);
        return;
      }

      setCurrentThemeName(themeName);
      savePreferences(themeName, isDarkMode);

      // Feedback haptique
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        // Ignore si les haptics ne sont pas disponibles
      });
    },
    [isDarkMode, savePreferences]
  );

  // Action de basculement du mode sombre
  const toggleDarkMode = useCallback(() => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    savePreferences(currentThemeName, newDarkMode);

    // Feedback haptique
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
      // Ignore si les haptics ne sont pas disponibles
    });
  }, [isDarkMode, currentThemeName, savePreferences]);

  // Liste des thèmes avec mémorisation
  const getThemesList = useCallback((): readonly ThemeInfo[] => {
    const mode = isDarkMode ? "dark" : "light";

    return Object.entries(customThemes).map(([key, theme]) => ({
      key: key as ThemeName,
      name: theme.name,
      colors: theme[mode].murmure,
    }));
  }, [isDarkMode]);

  return {
    currentThemeName,
    isDarkMode,
    currentTheme,
    paperTheme,
    changeTheme,
    toggleDarkMode,
    getThemesList,
  };
};
