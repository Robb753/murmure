import { StyleSheet } from "react-native";

export const sidebarStyles = StyleSheet.create({
  sidebar: {
    width: 300,
    borderLeftWidth: 1,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },

  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderTopLeftRadius: 16,
  },

  sidebarTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  sidebarClose: {
    fontSize: 24,
    fontWeight: "300",
  },

  sidebarContent: {
    padding: 8,
  },

  sidebarEntry: {
    padding: 12,
    marginVertical: 2,
    borderRadius: 12,
    borderLeftWidth: 3,
    flex: 1,
  },

  sidebarEntryDate: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  sidebarEntryPreview: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },

  sidebarEntryMeta: {
    fontSize: 12,
  },

  sidebarEntryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 1,
  },

  webActionsButtonExternal: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 28,
    minHeight: 28,
  },

  webActionsIcon: {
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 14,
  },
});
