import { StyleSheet } from "react-native";

export const sidebarStyles = StyleSheet.create({
  sidebar: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    // Bordure subtile à gauche
    borderLeftWidth: 1,
  },

  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderTopLeftRadius: 16,
    minHeight: 60, // Hauteur fixe pour éviter les décalages
  },

  sidebarTitle: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: -0.3,
  },

  sidebarClose: {
    fontSize: 24,
    fontWeight: "300",
    lineHeight: 20,
  },

  sidebarContent: {
    padding: 12,
    flex: 1,
  },

  sidebarEntry: {
    padding: 14,
    marginVertical: 3,
    borderRadius: 12,
    borderLeftWidth: 3,
    flex: 1,
  },

  sidebarEntryDate: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: -0.2,
  },

  sidebarEntryPreview: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
    opacity: 0.8,
  },

  sidebarEntryMeta: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.6,
  },

  sidebarEntryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },

  // Styles pour les boutons d'action web
  webActionsButtonExternal: {
    padding: 8,
    marginLeft: 10,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 32,
    minHeight: 32,
  },

  webActionsIcon: {
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 14,
  },
});
