import { StyleSheet } from "react-native";

// Styles communs utilisés dans plusieurs composants
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  layout: {
    flex: 1,
    flexDirection: "row",
  },

  // Boutons communs
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 35,
    alignItems: "center",
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },

  // Textes communs
  title: {
    fontSize: 16,
    fontWeight: "600",
  },

  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },

  caption: {
    fontSize: 12,
    fontWeight: "400",
  },

  // Espacements
  marginSmall: {
    margin: 8,
  },

  marginMedium: {
    margin: 16,
  },

  paddingSmall: {
    padding: 8,
  },

  paddingMedium: {
    padding: 16,
  },

  // Bordures arrondies
  roundedSmall: {
    borderRadius: 8,
  },

  roundedMedium: {
    borderRadius: 12,
  },

  roundedLarge: {
    borderRadius: 16,
  },

  // Ombres
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
