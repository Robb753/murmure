import { useState, useEffect } from "react";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const useResponsiveDesign = () => {
  // 1. Récupérer les dimensions de l'écran
  const [screen, setScreen] = useState(() => Dimensions.get("window"));
  const insets = useSafeAreaInsets();

  // 2. Écouter les changements d'orientation
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreen(window);
    });
    return () => subscription?.remove();
  }, []);

  // 3. Classifier la taille de l'écran
  const isSmallScreen = screen.width < 375; // iPhone SE, petits Android
  const isLargeScreen = screen.width >= 414; // iPhone Pro, grands Android
  const isTablet = screen.width >= 768; // iPad, tablettes Android

  // 4. Calculer les espacements adaptatifs
  const spacing = {
    small: isSmallScreen ? 8 : 12,
    medium: isSmallScreen ? 16 : 20,
    large: isSmallScreen ? 24 : 32,
  };

  // 5. Calculer le padding des containers
  const containerPadding = isSmallScreen ? 16 : 20;

  // 6. Tailles de texte adaptatives
  const fontSize = {
    small: isSmallScreen ? 12 : 14,
    body: isSmallScreen ? 16 : 18,
    title: isSmallScreen ? 20 : 24,
  };

  return {
    width: screen.width,
    height: screen.height,
    isSmallScreen,
    isLargeScreen,
    isTablet,
    insets,
    spacing,
    containerPadding,
    fontSize,
  };
};
