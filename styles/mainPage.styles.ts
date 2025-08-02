import { DimensionValue, Platform, StyleSheet } from "react-native";

export const mainPageStyles = StyleSheet.create({
  mainArea: {
    flex: 1,
  },

  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === "web" ? 8 : 10,
    borderBottomWidth: 1,
    minHeight: Platform.OS === "web" ? 42 : 48,
  },

  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  headerButtonText: {
    fontSize: Platform.OS === "web" ? 13 : 15,
    fontWeight: "500" as const,
  },

  // Zone d'écriture
  writingContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  paperSheet: {
    width: "100%" as DimensionValue,
    maxWidth: 1150,
    flex: 1,
    padding: 24,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderRadius: 16,
  },

  textInput: {
    flex: 1,
    width: "100%" as DimensionValue,
    textAlign: "center" as const,
  },

  // Footer
  footer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const, 
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === "web" ? 6 : 8,
    borderTopWidth: 1,
    minHeight: Platform.OS === "web" ? 36 : 42,
  },

  footerLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "flex-start" as const,
  },

  footerCenter: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  footerRight: {
    flex: 1,
    flexDirection: "row" as const,
    justifyContent: "flex-end" as const,
    alignItems: "center" as const,
    gap: 8,
  },

  footerButton: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    minWidth: 28,
    alignItems: "center" as const,
  },

  footerButtonText: {
    fontSize: Platform.OS === "web" ? 14 : 15,
    fontWeight: "500" as const,
  },

  fontNameDisplay: {
    fontSize: 11,
    fontWeight: "400" as const,
    marginLeft: 4,
  },

  wordCount: {
    fontSize: 15,
  },

  runningIndicator: {
    fontSize: 16,
    fontWeight: "500" as const,
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

    responsiveNormalTextInput: {
      paddingHorizontal: design.isSmallScreen ? 12 : 15,
      paddingVertical: design.isSmallScreen ? 12 : 15,
    },

    responsiveWritingContainer: {
      flex: 1,
      paddingHorizontal: design.containerPadding,
      paddingVertical: design.spacing.large,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      // Réserver de l'espace pour le footer
      paddingBottom: design.spacing.large + 20,
    },

    responsiveHeader: {
      paddingHorizontal: design.containerPadding,
      paddingVertical:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 6
            : 7 // ✅ RÉDUIT: était 8/10
          : design.isSmallScreen
          ? 8
          : 9, // ✅ RÉDUIT: était plus grand
      minHeight:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 38
            : 42 // ✅ RÉDUIT: était 45/50
          : design.isSmallScreen
          ? 44
          : 48, // ✅ RÉDUIT: était 55/60
    },

    responsiveTimerContainer: {
      paddingHorizontal: design.containerPadding,
      paddingVertical:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 4
            : 6 // ✅ RÉDUIT: était 6/8
          : design.isSmallScreen
          ? 6
          : 8, // ✅ RÉDUIT: était 10/12
      borderBottomWidth: 1,
      alignItems: "center" as const,
      justifyContent: "center" as const,
    },

    responsiveHeaderButton: {
      paddingHorizontal:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 10
            : 12 // ✅ RÉDUIT: était 12/14
          : design.isSmallScreen
          ? 12
          : 14, // ✅ RÉDUIT: était 16
      paddingVertical:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 4
            : 5 // ✅ RÉDUIT: était 6/8
          : design.isSmallScreen
          ? 5
          : 6, // ✅ RÉDUIT: était 8
      borderRadius: design.isSmallScreen ? 6 : 8, // ✅ RÉDUIT: était 8/12
    },

    responsiveTimerSection: {
      flexDirection: "column" as const,
      alignItems: "center" as const,
      gap: design.isSmallScreen ? 8 : 10, // ✅ RÉDUIT: était 10/12
    },

    responsiveTimerButton: {
      paddingHorizontal:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 12
            : 14 // ✅ RÉDUIT: était 14/16
          : design.isSmallScreen
          ? 14
          : 16, // ✅ RÉDUIT: était 18/20
      paddingVertical:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 6
            : 7 // ✅ RÉDUIT: était 7/8
          : design.isSmallScreen
          ? 7
          : 8, // ✅ RÉDUIT: était 8/10
      borderRadius: design.isSmallScreen ? 8 : 10, // ✅ RÉDUIT: était 10/12
      minWidth:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 110
            : 120 // ✅ RÉDUIT: était 120/140
          : design.isSmallScreen
          ? 120
          : 140, // ✅ RÉDUIT: était 140/160
      borderWidth: 1,
    },

    responsiveDurationButtons: {
      flexDirection: "row" as const,
      gap:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 4
            : 6 // ✅ RÉDUIT: était 6/8
          : design.isSmallScreen
          ? 6
          : 8, // ✅ RÉDUIT: était 8/12
      justifyContent: "center" as const,
    },

    responsiveDurationButton: {
      paddingHorizontal:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 8
            : 10 // ✅ RÉDUIT: était 10/12
          : design.isSmallScreen
          ? 10
          : 12, // ✅ RÉDUIT: était 14/16
      paddingVertical:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 4
            : 5 // ✅ RÉDUIT: était 5/6
          : design.isSmallScreen
          ? 5
          : 6, // ✅ RÉDUIT: était 6/8
      borderRadius: design.isSmallScreen ? 6 : 7, // ✅ RÉDUIT: était 6/8
      minWidth:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 40
            : 45 // ✅ RÉDUIT: était 45/50
          : design.isSmallScreen
          ? 50
          : 55, // ✅ RÉDUIT: était 55/60
      borderWidth: 1,
    },

    responsiveFooter: {
      paddingHorizontal: design.containerPadding,
      paddingVertical:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 4
            : 5 // ✅ RÉDUIT: était plus grand
          : design.isSmallScreen
          ? 6
          : 7, // ✅ RÉDUIT: était plus grand
      minHeight:
        Platform.OS === "web"
          ? design.isSmallScreen
            ? 32
            : 36 // ✅ RÉDUIT: nouveau
          : design.isSmallScreen
          ? 38
          : 42, // ✅ RÉDUIT: nouveau
    },

    responsivePaperSheet: {
      width: "100%" as DimensionValue, // ✅ CORRECTION: Type explicite
      maxWidth: 1150,
      flex: 1,
      padding: design.spacing.large,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      borderRadius: design.isSmallScreen ? 12 : 16,
      // ✅ CORRECTION: Utiliser une valeur numérique ou undefined
      ...(design.height && { maxHeight: design.height * 0.85 }),
    },

    responsiveFooterButton: {
      paddingHorizontal: design.isSmallScreen ? 5 : 6,
      paddingVertical: design.isSmallScreen ? 2 : 3,
      borderRadius: design.isSmallScreen ? 5 : 6,
      minWidth: design.isSmallScreen ? 26 : 28,
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },

  durationButtons: {
    flexDirection: "row" as const,
    gap: 4,
  },

  durationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  durationButtonText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },

  timerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },

  timerContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },

  timerIcon: {
    fontSize: 16,
  },

  timerText: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
});

export const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
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
    fontWeight: "600" as const,
    marginBottom: 16,
    textAlign: "center" as const,
  },

  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },

  modalItemText: {
    fontSize: 16,
    textAlign: "center" as const,
  },
});
