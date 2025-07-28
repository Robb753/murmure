import { useState, useCallback } from "react";
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import * as Haptics from "expo-haptics";

// Définition des thèmes personnalisés
export const customThemes = {
  ocean: {
    name: "Ocean 🌊",
    light: {
      ...MD3LightTheme,
      colors: {
        ...MD3LightTheme.colors,
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
      // Couleurs personnalisées pour Murmure
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
      ...MD3DarkTheme,
      colors: {
        ...MD3DarkTheme.colors,
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
      ...MD3LightTheme,
      colors: {
        ...MD3LightTheme.colors,
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
      ...MD3DarkTheme,
      colors: {
        ...MD3DarkTheme.colors,
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
      ...MD3LightTheme,
      colors: {
        ...MD3LightTheme.colors,
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
      ...MD3DarkTheme,
      colors: {
        ...MD3DarkTheme.colors,
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
      ...MD3LightTheme,
      colors: {
        ...MD3LightTheme.colors,
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
      ...MD3DarkTheme,
      colors: {
        ...MD3DarkTheme.colors,
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
      ...MD3LightTheme,
      colors: {
        ...MD3LightTheme.colors,
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
      ...MD3DarkTheme,
      colors: {
        ...MD3DarkTheme.colors,
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
};

export type ThemeName = keyof typeof customThemes;
export type ThemeMode = "light" | "dark";

export const useAdvancedTheme = () => {
  const [currentThemeName, setCurrentThemeName] = useState<ThemeName>("ocean");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currentTheme =
    customThemes[currentThemeName][isDarkMode ? "dark" : "light"];
  const currentMurmureTheme = currentTheme.murmure;

  const changeTheme = useCallback((themeName: ThemeName) => {
    setCurrentThemeName(themeName);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(!isDarkMode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isDarkMode]);

  const getThemesList = useCallback(() => {
    return Object.entries(customThemes).map(([key, theme]) => ({
      key: key as ThemeName,
      name: theme.name,
      colors: theme[isDarkMode ? "dark" : "light"].murmure,
    }));
  }, [isDarkMode]);

  return {
    currentThemeName,
    isDarkMode,
    currentTheme: currentMurmureTheme,
    paperTheme: currentTheme,
    changeTheme,
    toggleDarkMode,
    getThemesList,
  };
};
