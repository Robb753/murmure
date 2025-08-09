import { DimensionValue, Platform, StyleSheet } from "react-native";

// ==========================================
// STYLES EXISTANTS DE L'APPLICATION
// ==========================================

export const mainPageStyles = StyleSheet.create({
  logoImage: {
    resizeMode: "contain" as const,
  },

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

export const landingStyles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
  },

  // Header styles
  header: {
    borderBottomWidth: 1,
    paddingTop: Platform.OS === "web" ? 0 : 50,
  },

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },

  logo: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoIcon: {
    fontSize: 32,
    marginRight: 8,
  },

  logoText: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: Platform.select({
      ios: "Palatino",
      android: "serif",
      web: "'Crimson Text', 'Palatino Linotype', serif",
    }),
  },

  // Navigation
  nav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  navItem: {
    paddingVertical: 8,
    marginRight: 32,
  },

  navText: {
    fontSize: 16,
    fontWeight: "500",
  },

  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  primaryButtonText: {
    color: "white",
    fontWeight: "600",
  },

  // Nouveau bouton soft pour le header
  primaryButtonSoft: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    ...(Platform.OS === "web" && ({ transition: "all 0.3s ease" } as any)),
  },

  primaryButtonSoftText: {
    fontSize: 16,
    fontWeight: "500",
  },

  // Hero section
  hero: {
    paddingHorizontal: 20,
    paddingVertical: 80,
    alignItems: "center",
    maxWidth: 1200 as const,
    alignSelf: "center",
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },

  backgroundElement1: {
    position: "absolute",
    top: 80,
    left: 40,
    width: 128,
    height: 128,
    backgroundColor: "rgba(254, 215, 170, 0.3)",
    borderRadius: 64,
  },

  backgroundElement2: {
    position: "absolute",
    bottom: 80,
    right: 40,
    width: 160,
    height: 160,
    backgroundColor: "rgba(254, 215, 170, 0.2)",
    borderRadius: 80,
  },

  heroContent: {
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },

  heroTitleContainer: {
    marginBottom: 32,
    alignItems: "center",
  },

  heroMainTitle: {
    fontSize: Platform.OS === "web" ? 48 : 32,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: "Palatino",
      android: "serif",
      web: "'Crimson Text', 'Palatino Linotype', 'Book Antiqua', Palatino, serif",
    }),
  },

  heroSubTitle: {
    fontSize: Platform.OS === "web" ? 40 : 28,
    fontWeight: "300",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: Platform.select({
      ios: "Palatino",
      android: "serif",
      web: "'Crimson Text', 'Palatino Linotype', 'Book Antiqua', Palatino, serif",
    }),
  },

  heroDescription: {
    fontSize: Platform.OS === "web" ? 20 : 18,
    textAlign: "center",
    marginBottom: 64,
    maxWidth: 600,
    lineHeight: 28,
    fontWeight: "300",
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      web: "'Crimson Text', Georgia, 'Times New Roman', serif",
    }),
  },

  // Phone Mockup
  phoneMockupContainer: {
    marginBottom: 64,
  },

  phoneMockup: {
    maxWidth: 300,
    transform: [{ rotate: "3deg" }],
  },

  phoneGradient: {
    backgroundColor: "#92400e",
    borderRadius: 40,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },

  phoneScreen: {
    backgroundColor: "#fffbeb",
    borderRadius: 32,
    padding: 24,
    minHeight: 400,
  },

  phoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  phoneAppInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  phoneMoonIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  phoneAppName: {
    fontSize: 12,
    color: "#92400e",
    fontFamily: Platform.select({
      ios: "Palatino",
      android: "serif",
      web: "'Crimson Text', 'Palatino Linotype', serif",
    }),
  },

  phoneTime: {
    fontSize: 12,
    color: "#b45309",
  },

  phoneContent: {
    flex: 1,
  },

  phoneSessionLabel: {
    fontSize: 12,
    color: "#b45309",
    fontWeight: "500",
    marginBottom: 12,
  },

  phoneTextArea: {
    marginBottom: 16,
  },

  phoneText: {
    fontSize: 12,
    color: "#92400e",
    lineHeight: 18,
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      web: "'Crimson Text', Georgia, serif",
    }),
    fontStyle: "italic",
  },

  phoneCursor: {
    width: 64,
    height: 2,
    backgroundColor: "#fbbf24",
    opacity: 0.8,
  },

  phoneFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#fde68a",
  },

  phoneWordCount: {
    fontSize: 12,
    color: "#b45309",
  },

  phoneDots: {
    flexDirection: "row",
  },

  phoneDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: 4,
  },

  // CTA Buttons
  ctaContainer: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: "center",
  },

  ctaPrimaryGreen: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 280,
    alignItems: "center",
    marginBottom: Platform.OS === "web" ? 0 : 16,
    marginRight: Platform.OS === "web" ? 16 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
    ...(Platform.OS === "web" && ({ transition: "all 0.3s ease" } as any)),
  },

  ctaPrimaryGreenText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },

  ctaSecondaryOutline: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 2,
    borderColor: "#fbbf24",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 280,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    ...(Platform.OS === "web" && ({ transition: "all 0.3s ease" } as any)),
  },

  ctaSecondaryOutlineText: {
    color: "#92400e",
    fontSize: 18,
    fontWeight: "500",
  },

  // Trust indicators
  trustIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },

  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
  },

  trustIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  trustText: {
    fontSize: 14,
    color: "#b45309",
    fontWeight: "400",
  },

  // Why Section
  whySection: {
    paddingHorizontal: 20,
    paddingVertical: 80,
    alignItems: "center",
  },

  whyText: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 800,
  },

  // Features Section
  features: {
    paddingHorizontal: 20,
    paddingVertical: 80,
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 64,
    fontFamily: Platform.select({
      ios: "Palatino",
      android: "serif",
      web: "'Crimson Text', 'Palatino Linotype', serif",
    }),
  },

  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    maxWidth: 1300,
    width: "100%",
  },

  featureCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    width: Platform.OS === "web" ? 280 : "100%",
    minHeight: 240,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
    elevation: 8,
    margin: 16,
    ...(Platform.OS === "web" && ({ transition: "all 0.3s ease" } as any)),
    cursor: Platform.OS === "web" ? "default" : undefined,
  },

  featureIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  featureTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },

  featureDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },

  // FAQ Section
  faqSection: {
    paddingHorizontal: 20,
    paddingVertical: 80,
    alignItems: "center",
  },

  faqContainer: {
    maxWidth: 800,
    width: "100%",
  },

  faqItem: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    padding: 24,
  },

  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  faqQuestionText: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 16,
  },

  faqIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },

  faqAnswer: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
  },

  // Footer
  footer: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingVertical: 64,
  },

  footerContent: {
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },

  footerGrid: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    justifyContent: "space-between",
    marginBottom: 48,
  },

  footerColumn: {
    flex: 1,
    marginBottom: Platform.OS === "web" ? 0 : 32,
    marginRight: Platform.OS === "web" ? 32 : 0,
  },

  footerLogo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  footerLogoIcon: {
    fontSize: 32,
    marginRight: 8,
  },

  footerLogoText: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },

  footerDescription: {
    color: "#94a3b8",
    fontSize: 16,
    lineHeight: 24,
  },

  // Nouveau slogan dans le footer
  footerSlogan: {
    marginTop: 8,
    fontSize: 14,
    fontStyle: "italic",
    color: "#9ca3af",
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      web: "'Crimson Text', Georgia, serif",
    }),
  },

  footerColumnTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },

  footerLink: {
    marginBottom: 12,
  },

  footerLinkText: {
    color: "#94a3b8",
    fontSize: 16,
  },

  footerButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    maxWidth: 200,
  },

  footerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  socialLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: 32,
    alignItems: "center",
  },

  footerCopyright: {
    color: "#64748b",
    textAlign: "center",
    fontSize: 14,
  },
});

// Type pour les paramètres de design responsive
interface ResponsiveDesign {
  containerPadding: number;
  isSmallScreen: boolean;
  insets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const createResponsiveMainStyles = (design: ResponsiveDesign) => {
  return StyleSheet.create({
    // Header responsive
    responsiveHeader: {
      paddingHorizontal: design.containerPadding,
      minHeight: design.isSmallScreen ? 44 : 48,
      paddingVertical: design.isSmallScreen ? 8 : 12,
    },

    responsiveHeaderButton: {
      paddingHorizontal: design.isSmallScreen ? 10 : 12,
      paddingVertical: design.isSmallScreen ? 5 : 6,
      borderRadius: design.isSmallScreen ? 6 : 8,
    },

    // Zone d'écriture responsive
    responsiveWritingContainer: {
      paddingHorizontal: design.isSmallScreen ? 16 : 20,
      paddingVertical: design.isSmallScreen ? 16 : 20,
    },

    responsivePaperSheet: {
      padding: design.isSmallScreen ? 20 : 24,
      borderRadius: design.isSmallScreen ? 12 : 16,
      maxWidth: design.isSmallScreen ? "100%" : 1150,
    },

    // Footer responsive
    responsiveFooter: {
      paddingHorizontal: design.containerPadding,
      paddingVertical: design.isSmallScreen ? 6 : 8,
      minHeight: design.isSmallScreen ? 40 : 42,
    },

    responsiveFooterButton: {
      paddingHorizontal: design.isSmallScreen ? 4 : 6,
      paddingVertical: design.isSmallScreen ? 2 : 3,
      borderRadius: design.isSmallScreen ? 4 : 6,
      minWidth: design.isSmallScreen ? 24 : 28,
    },

    // Timer responsive
    responsiveTimerSection: {
      paddingHorizontal: design.containerPadding,
      paddingVertical: design.isSmallScreen ? 8 : 12,
      gap: design.isSmallScreen ? 6 : 8,
    },

    responsiveDurationButton: {
      paddingHorizontal: design.isSmallScreen ? 10 : 12,
      paddingVertical: design.isSmallScreen ? 5 : 6,
      borderRadius: design.isSmallScreen ? 8 : 12,
      minWidth: design.isSmallScreen ? 45 : 50,
    },

    responsiveTimerButton: {
      paddingHorizontal: design.isSmallScreen ? 14 : 16,
      paddingVertical: design.isSmallScreen ? 6 : 8,
      borderRadius: design.isSmallScreen ? 8 : 12,
      minWidth: design.isSmallScreen ? 120 : 140,
    },

    // Autres styles responsive
    responsiveTextInput: {
      paddingHorizontal: design.isSmallScreen ? 12 : 15,
      paddingVertical: design.isSmallScreen ? 12 : 15,
    },

    responsiveSidebar: {
      width: design.isSmallScreen ? 300 : 350,
    },

    responsiveModal: {
      marginHorizontal: design.containerPadding,
      padding: design.isSmallScreen ? 20 : 24,
      borderRadius: design.isSmallScreen ? 12 : 16,
    },

    responsiveFocusMode: {
      paddingTop: design.insets.top + (design.isSmallScreen ? 50 : 55),
      paddingBottom: design.insets.bottom + (design.isSmallScreen ? 50 : 55),
      paddingHorizontal:
        design.containerPadding + (design.isSmallScreen ? 5 : 10),
    },

    responsiveFocusControls: {
      top: design.insets.top + (design.isSmallScreen ? 15 : 20),
      left: design.isSmallScreen ? 20 : 30,
      right: design.isSmallScreen ? 20 : 30,
    },

    responsiveFocusTimer: {
      top: design.insets.top + (design.isSmallScreen ? 15 : 20),
      right: design.isSmallScreen ? 20 : 30,
    },

    // Animations et transitions (web only)
    webTransitions:
      Platform.OS === "web"
        ? ({
            transition: "all 0.2s ease",
          } as any)
        : {},

    responsiveShadow: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: design.isSmallScreen ? 2 : 4,
      },
      shadowOpacity: design.isSmallScreen ? 0.1 : 0.15,
      shadowRadius: design.isSmallScreen ? 4 : 8,
      elevation: design.isSmallScreen ? 4 : 8,
    },

    adaptiveLayout: {
      flexDirection: design.isSmallScreen ? "column" : "row",
      gap: design.isSmallScreen ? 8 : 12,
    },

    adaptiveSpacing: {
      marginVertical: design.isSmallScreen ? 8 : 12,
      marginHorizontal: design.isSmallScreen ? 12 : 16,
    },
  });
};
