// Types de base pour les couleurs
export type ColorValue = string;
export type ColorOpacity = string; // Pour les couleurs avec opacité comme "#ffffff80"

// Interface stricte pour le thème Murmure
export interface MurmureTheme {
  readonly background: ColorValue;
  readonly surface: ColorValue;
  readonly text: ColorValue;
  readonly textSecondary: ColorValue;
  readonly border: ColorValue;
  readonly accent: ColorValue;
  readonly muted: ColorValue;
}

// Types pour React Native Paper (si utilisé)
export interface PaperThemeColors {
  readonly primary: ColorValue;
  readonly primaryContainer: ColorValue;
  readonly secondary: ColorValue;
  readonly secondaryContainer: ColorValue;
  readonly tertiary: ColorValue;
  readonly surface: ColorValue;
  readonly surfaceVariant: ColorValue;
  readonly background: ColorValue;
  readonly error: ColorValue;
  readonly onPrimary: ColorValue;
  readonly onSecondary: ColorValue;
  readonly onSurface: ColorValue;
  readonly onBackground: ColorValue;
  readonly outline: ColorValue;
}

// Interface complète pour un mode de thème (light/dark)
export interface ThemeMode {
  readonly colors: PaperThemeColors;
  readonly murmure: MurmureTheme;
}

// Interface pour un thème complet avec ses deux modes
export interface ThemeDefinition {
  readonly name: string;
  readonly light: ThemeMode;
  readonly dark: ThemeMode;
}

// Types pour les noms de thèmes disponibles
export type ThemeName = "ocean" | "forest" | "sunset" | "lavender" | "midnight";
export type ThemeModeName = "light" | "dark";

// Interface pour les informations d'un thème (utilisée dans les sélecteurs)
export interface ThemeInfo {
  readonly key: ThemeName;
  readonly name: string; // Nom d'affichage avec emoji
  readonly colors: MurmureTheme;
}

// Type pour la collection complète des thèmes
export type ThemeCollection = Record<ThemeName, ThemeDefinition>;

// Interface pour les props des composants utilisant les thèmes
export interface ThemedComponentProps {
  readonly currentTheme: MurmureTheme;
  readonly isDarkMode: boolean;
  readonly themeName: ThemeName;
}

// Interface pour les props de sélection de thème
export interface ThemeSelectorProps {
  readonly visible: boolean;
  readonly currentTheme: MurmureTheme;
  readonly currentThemeName: ThemeName;
  readonly isDarkMode: boolean;
  readonly onThemeChange: (themeName: ThemeName) => void;
  readonly onToggleDarkMode: () => void;
  readonly onClose: () => void;
  readonly getThemesList: () => readonly ThemeInfo[];
}

// Types pour les actions de thème
export type ThemeChangeAction = (themeName: ThemeName) => void;
export type DarkModeToggleAction = () => void;

// Interface pour le hook useAdvancedTheme
export interface UseAdvancedThemeReturn {
  readonly currentThemeName: ThemeName;
  readonly isDarkMode: boolean;
  readonly currentTheme: MurmureTheme;
  readonly paperTheme: ThemeMode;
  readonly changeTheme: ThemeChangeAction;
  readonly toggleDarkMode: DarkModeToggleAction;
  readonly getThemesList: () => readonly ThemeInfo[];
}

// Types pour la persistance des préférences de thème
export interface ThemePreferences {
  readonly themeName: ThemeName;
  readonly isDarkMode: boolean;
}

// Interface pour les styles dynamiques basés sur le thème
export interface ThemedStyles {
  readonly backgroundColor: ColorValue;
  readonly color: ColorValue;
  readonly borderColor: ColorValue;
}

// Type guard pour vérifier si une valeur est un nom de thème valide
export const isValidThemeName = (value: unknown): value is ThemeName => {
  return (
    typeof value === "string" &&
    ["ocean", "forest", "sunset", "lavender", "midnight"].includes(value)
  );
};

// Type guard pour vérifier si une valeur est un mode de thème valide
export const isValidThemeMode = (value: unknown): value is ThemeModeName => {
  return typeof value === "string" && ["light", "dark"].includes(value);
};

// Type pour les erreurs de thème
export interface ThemeError {
  readonly code:
    | "INVALID_THEME_NAME"
    | "INVALID_THEME_MODE"
    | "THEME_LOAD_ERROR";
  readonly message: string;
  readonly themeName?: string;
}

// Types pour les animations de thème
export interface ThemeTransition {
  readonly duration: number;
  readonly easing: "ease" | "ease-in" | "ease-out" | "ease-in-out";
}

// Interface pour les métadonnées de thème
export interface ThemeMetadata {
  readonly version: string;
  readonly author: string;
  readonly description: string;
  readonly tags: readonly string[];
}

// Type pour les hooks de thème personnalisés
export interface ThemeHookConfig {
  readonly persistPreferences?: boolean;
  readonly storageKey?: string;
  readonly defaultTheme?: ThemeName;
  readonly defaultMode?: ThemeModeName;
}