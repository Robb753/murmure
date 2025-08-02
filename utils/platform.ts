import { Platform } from "react-native";

/**
 * Détecte si l'app s'exécute sur web
 */
export const isWeb = (): boolean => {
  return (Platform.OS as string) === "web";
};

/**
 * Détecte si l'app s'exécute sur mobile (iOS ou Android)
 */
export const isMobile = (): boolean => {
  return Platform.OS === "ios" || Platform.OS === "android";
};

/**
 * Détecte si l'app s'exécute sur iOS
 */
export const isIOS = (): boolean => {
  return Platform.OS === "ios";
};

/**
 * Détecte si l'app s'exécute sur Android
 */
export const isAndroid = (): boolean => {
  return Platform.OS === "android";
};

/**
 * Obtient la plateforme actuelle de manière type-safe
 */
export const getCurrentPlatform = (): string => {
  return Platform.OS as string;
};

/**
 * Exécute du code conditionnel basé sur la plateforme
 */
export const platformSwitch = <T>(options: {
  web?: T;
  ios?: T;
  android?: T;
  mobile?: T;
  default?: T;
}): T | undefined => {
  const { web, ios, android, mobile, default: defaultValue } = options;

  if (isWeb() && web !== undefined) return web;
  if (isIOS() && ios !== undefined) return ios;
  if (isAndroid() && android !== undefined) return android;
  if (isMobile() && mobile !== undefined) return mobile;

  return defaultValue;
};
