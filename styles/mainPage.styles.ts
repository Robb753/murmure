import { Platform, StyleSheet } from "react-native";

export const mainPageStyles = StyleSheet.create({
  mainArea: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === "web" ? 12 : 16, // ✅ Moins de padding sur web
    borderBottomWidth: 1,
    minHeight: Platform.OS === "web" ? 50 : 60, // ✅ Plus compact sur web
  },

  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },

  headerButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },

  // Zone d'écriture
  writingContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  paperSheet: {
    width: "100%",
    maxWidth: 1150,
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },

  textInput: {
    flex: 1,
    width: "100%",
    textAlign: "center",
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },

  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  footerCenter: {
    justifyContent: "center",
    alignItems: "center",
  },

  footerRight: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },

  footerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 35,
    alignItems: "center",
  },

  footerButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },

  fontNameDisplay: {
    fontSize: 11,
    fontWeight: "400",
    marginLeft: 4,
  },

  wordCount: {
    fontSize: 16,
  },

  runningIndicator: {
    fontSize: 16,
    fontWeight: "500",
  },
});

// Fonction pour créer des styles responsives dynamiques
export const createResponsiveMainStyles = (design: any) => {
  return {
    // Styles qui s'adaptent à la taille d'écran
    responsiveTextInput: {
      fontSize: design.isSmallScreen ? 16 : 18,
      padding: design.spacing.medium,
      lineHeight: (design.isSmallScreen ? 16 : 18) * 1.5,
    },

    responsiveWritingContainer: {
      paddingHorizontal: design.containerPadding,
      paddingVertical: design.spacing.large,
    },

    responsiveHeader: {
      paddingHorizontal: design.containerPadding,
      paddingVertical:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 8
            : 10 // Web : plus compact
          : design.spacing.medium, // Mobile : normal
      minHeight:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 45
            : 50 // Web : plus bas
          : design.isSmallScreen
          ? 55
          : 60, // Mobile : normal
    },

    responsiveHeaderButton: {
      paddingHorizontal:
        Platform.OS === "web" ? (design.isSmallScreen ? 12 : 14) : 16,
      paddingVertical:
        Platform.OS === "web" ? (design.isSmallScreen ? 6 : 8) : 8,
      borderRadius: design.isSmallScreen ? 8 : 12,
    },

    responsiveTimerSection: {
      gap: Platform.OS === "web" ? (design.isSmallScreen ? 8 : 10) : 12,
    },

    responsiveTimerButton: {
      paddingHorizontal:
        Platform.OS === "web" ? (design.isSmallScreen ? 12 : 14) : 16,
      paddingVertical:
        Platform.OS === "web" ? (design.isSmallScreen ? 6 : 8) : 8,
      borderRadius: design.isSmallScreen ? 8 : 12,
    },

    responsiveDurationButton: {
      paddingHorizontal:
        Platform.OS === "web" ? (design.isSmallScreen ? 8 : 10) : 12,
      paddingVertical:
        Platform.OS === "web" ? (design.isSmallScreen ? 4 : 6) : 6,
      borderRadius: design.isSmallScreen ? 6 : 8,
    },

    responsiveFooter: {
      paddingHorizontal: design.containerPadding,
      paddingVertical: design.spacing.small,
    },

    responsivePaperSheet: {
      padding: design.spacing.large,
      borderRadius: design.isSmallScreen ? 12 : 16,
    },

    responsiveFooterButton: {
      paddingHorizontal: design.isSmallScreen ? 6 : 8,
      paddingVertical: design.isSmallScreen ? 3 : 4,
      borderRadius: design.isSmallScreen ? 6 : 8,
      minWidth: design.isSmallScreen ? 30 : 35,
    },
  };
};

// Styles communs
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  layout: {
    flex: 1,
  },
});

export const timerStyles = StyleSheet.create({
  timerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  durationButtons: {
    flexDirection: "row",
    gap: 4,
  },

  durationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  durationButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },

  timerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },

  timerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  timerIcon: {
    fontSize: 16,
  },

  timerText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    borderRadius: 16,
    padding: 24,
    minWidth: 250,
    maxWidth: 320,
    borderWidth: 1,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },

  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },

  modalItemText: {
    fontSize: 16,
    textAlign: "center",
  },
});
