import { StyleSheet } from "react-native";

export const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 8,
    minWidth: 150,
    maxWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  modalItemText: {
    fontSize: 16,
    textAlign: "center",
  },

  // Styles pour le menu contextuel
  menuContent: {
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  menuItem: {
    paddingVertical: 8,
  },

  menuItemTitle: {
    fontSize: 14,
  },

  menuItemTitleDelete: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ef4444",
  },

  menuDivider: {
    height: 1,
  },
});
