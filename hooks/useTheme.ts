import { useState, useCallback } from "react";
import * as Haptics from "expo-haptics";

// Thème épuré unifié
const theme = {
  light: {
    background: "#f8f7f4",
    surface: "#f8f7f4",
    text: "#2c2c2c",
    textSecondary: "#666666",
    border: "#e8e6e1",
    accent: "#8b7355",
    muted: "#999999",
  },
  dark: {
    background: "#1a1a1a",
    surface: "#1a1a1a",
    text: "#e0e0e0",
    textSecondary: "#a0a0a0",
    border: "#2a2a2a",
    accent: "#b8a082",
    muted: "#666666",
  },
};

export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(!isDarkMode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isDarkMode]);

  return {
    isDarkMode,
    currentTheme,
    toggleDarkMode,
    theme, // Export pour accès direct si nécessaire
  };
};
