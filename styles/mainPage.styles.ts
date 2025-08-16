import { DimensionValue, Platform, StyleSheet } from "react-native";

// ==========================================
// CONSTANTES DE DESIGN
// ==========================================

const COLORS = {
  primary: "#8B4513",
  primaryLight: "#A0522D",
  accent: "#F4D03F",
  accentLight: "#FFF8DC",
  accentDark: "#F39C12",
  background: "rgba(255, 255, 255, 0.95)",
  text: "#8B4513",
  textSecondary: "#b45309",
  border: "rgba(139, 115, 85, 0.3)",
  shadow: "#000",
} as const;

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 25,
} as const;

// ==========================================
// STYLES DE L'APPLICATION PRINCIPALE
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: Platform.OS === "web" ? SPACING.sm : 10,
    borderBottomWidth: 1,
    minHeight: Platform.OS === "web" ? 42 : 48,
  },

  headerButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
  },

  headerButtonText: {
    fontSize: Platform.OS === "web" ? 13 : 15,
    fontWeight: "500" as const,
  },

  writingContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  paperSheet: {
    width: "100%" as DimensionValue,
    maxWidth: 1150,
    flex: 1,
    padding: SPACING.xxl,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderRadius: BORDER_RADIUS.lg,
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: Platform.OS === "web" ? 6 : SPACING.sm,
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
    gap: SPACING.sm,
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

// ==========================================
// STYLES DE LA PAGE DE LANDING
// ==========================================

export const landingStyles = StyleSheet.create({
  // ================== LAYOUT ==================
  container: {
    flex: 1,
  },

  // ================== HEADER ==================
  header: {
    borderBottomWidth: 1,
    paddingTop: Platform.OS === "web" ? 0 : 50,
    backgroundColor: COLORS.background,
    ...(Platform.OS === "web" && ({
      backdropFilter: "blur(10px)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    } as any)),
  },

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xl,
    maxWidth: 1200,
    alignSelf: "center",
    width: "100%",
  },

  headerContentMobile: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },

  // ================== LOGO ==================
  logo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  logoIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },

  logoText: {
    fontSize: 24,
    fontWeight: "600",
    fontFamily: Platform.select({
      ios: "Palatino",
      android: "serif",
      web: "'Crimson Text', 'Palatino Linotype', serif",
    }),
    letterSpacing: 0.5,
  },

  logoMobile: {
    marginRight: SPACING.md,
  },

  logoTextMobile: {
    fontSize: 22,
  },

  // ================== NAVIGATION ==================
  nav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  navItem: {
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    ...(Platform.OS === "web" && ({
      transition: "all 0.25s ease",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "rgba(139, 115, 85, 0.08)",
        transform: "translateY(-1px)",
      },
    } as any)),
  },

  navText: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.3,
  },

  // ================== BOUTONS ==================
  // Bouton "À propos"
  aboutButton: {
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    ...(Platform.OS === "web" && ({
      transition: "all 0.25s ease",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "rgba(139, 115, 85, 0.08)",
        transform: "translateY(-1px)",
      },
    } as any)),
  },

  // Bouton "Soutenir"
  supportButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.accentLight,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accentDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    ...(Platform.OS === "web" && ({
      transition: "all 0.25s ease",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "#FFF3CD",
        borderColor: "#F1C40F",
        transform: "translateY(-1px)",
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
    } as any)),
  },

  supportButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // Bouton "Version Web"
  webAppButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: "rgba(139, 115, 85, 0.05)",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...(Platform.OS === "web" && ({
      transition: "all 0.25s ease",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "rgba(139, 115, 85, 0.1)",
        borderColor: "rgba(139, 115, 85, 0.5)",
        transform: "translateY(-1px)",
      },
    } as any)),
  },

  webAppButtonText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // Bouton principal
  primaryButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    ...(Platform.OS === "web" && ({
      transition: "all 0.25s ease",
      cursor: "pointer",
      ":hover": {
        backgroundColor: COLORS.primaryLight,
        transform: "translateY(-1px)",
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
    } as any)),
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // ================== HERO SECTION ==================
  hero: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: 80,
    alignItems: "center",
    maxWidth: 1200,
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
    marginBottom: SPACING.xxxl,
    alignItems: "center",
  },

  heroMainTitle: {
    fontSize: Platform.OS === "web" ? 48 : 32,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.xxl,
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

  // ================== PHONE MOCKUP ==================
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
    padding: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },

  phoneScreen: {
    backgroundColor: "#fffbeb",
    borderRadius: 32,
    padding: SPACING.xxl,
    minHeight: 400,
  },

  phoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  phoneAppInfo: {
    flexDirection: "row",
    alignItems: "center",
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
    color: COLORS.textSecondary,
  },

  phoneContent: {
    flex: 1,
  },

  phoneSessionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginBottom: SPACING.md,
  },

  phoneTextArea: {
    marginBottom: SPACING.lg,
  },

  phoneText: {
    fontSize: 12,
    color: "#92400e",
    lineHeight: 18,
    marginBottom: SPACING.sm,
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
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: "#fde68a",
  },

  phoneWordCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
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

  // ================== CTA BUTTONS ==================
  ctaContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: SPACING.lg,
    width: "100%",
    paddingHorizontal: SPACING.lg,
  },

  ctaPrimaryGreen: {
    backgroundColor: "#16a34a",
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxl,
    minWidth: 280,
    maxWidth: 320,
    width: "100%",
    alignItems: "center",
    shadowColor: COLORS.shadow,
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
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxl,
    minWidth: 280,
    alignItems: "center",
    shadowColor: COLORS.shadow,
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

  // ================== TRUST INDICATORS ==================
  trustIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xxxl,
  },

  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SPACING.xxl,
  },

  trustIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },

  trustText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "400",
  },

  // ================== SECTIONS ==================
  whySection: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: 80,
    alignItems: "center",
  },

  whyText: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 800,
  },

  features: {
    paddingHorizontal: SPACING.lg,
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
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 1300,
    width: "100%",
    paddingHorizontal: 0,
  },

  featureCard: {
    padding: SPACING.xxxl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    width: Platform.OS === "web" ? 280 : "100%",
    maxWidth: 320,
    minHeight: 240,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 2,
    marginVertical: SPACING.lg,
    marginHorizontal: Platform.OS === "web" ? SPACING.lg : 0,
    alignSelf: "center",
    ...(Platform.OS === "web" && ({ transition: "all 0.3s ease" } as any)),
  },

  featureIcon: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },

  featureTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: SPACING.md,
  },

  featureDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },

  // ================== FAQ ==================
  faqSection: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: 80,
    alignItems: "center",
  },

  faqContainer: {
    maxWidth: 800,
    width: "100%",
  },

  faqItem: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    padding: SPACING.xxl,
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
    marginRight: SPACING.lg,
  },

  faqIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },

  faqAnswer: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: SPACING.lg,
  },

  // ================== FOOTER ==================
  footer: {
    backgroundColor: "#0f172a",
    paddingHorizontal: SPACING.xl,
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
    marginBottom: Platform.OS === "web" ? 0 : SPACING.xxxl,
    marginRight: Platform.OS === "web" ? SPACING.xxxl : 0,
  },

  footerLogo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  footerLogoIcon: {
    fontSize: 32,
    marginRight: SPACING.sm,
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

  footerSlogan: {
    marginTop: SPACING.sm,
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
    marginBottom: SPACING.lg,
  },

  footerLink: {
    marginBottom: SPACING.sm,
    ...(Platform.OS === "web" && ({
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        transform: "translateX(4px)",
      },
    } as any)),
  },

  footerLinkText: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "400",
    ...(Platform.OS === "web" && ({
      transition: "color 0.2s ease",
      ":hover": {
        color: "#cbd5e1",
      },
    } as any)),
  },

  footerButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    maxWidth: 220,
    minWidth: 180,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    ...(Platform.OS === "web" && ({
      transition: "all 0.3s ease",
      ":hover": {
        transform: "translateY(-2px)",
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
    } as any)),
  },

  footerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingTop: SPACING.xxxl,
    alignItems: "center",
  },

  footerCopyright: {
    color: "#64748b",
    textAlign: "center",
    fontSize: 14,
  },
});

// ==========================================
// TYPES ET INTERFACE RESPONSIVE
// ==========================================

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
      paddingVertical: design.isSmallScreen ? SPACING.sm : SPACING.md,
    },

    responsiveHeaderButton: {
      paddingHorizontal: design.isSmallScreen ? 10 : SPACING.md,
      paddingVertical: design.isSmallScreen ? 5 : 6,
      borderRadius: design.isSmallScreen ? 6 : BORDER_RADIUS.sm,
    },

    // Zone d'écriture responsive
    responsiveWritingContainer: {
      paddingHorizontal: design.isSmallScreen ? SPACING.lg : SPACING.xl,
      paddingVertical: design.isSmallScreen ? SPACING.lg : SPACING.xl,
    },

    responsivePaperSheet: {
      padding: design.isSmallScreen ? SPACING.xl : SPACING.xxl,
      borderRadius: design.isSmallScreen ? SPACING.md : BORDER_RADIUS.lg,
      maxWidth: design.isSmallScreen ? "100%" : 1150,
    },

    // Footer responsive
    responsiveFooter: {
      paddingHorizontal: design.containerPadding,
      paddingVertical: design.isSmallScreen ? 6 : SPACING.sm,
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
      paddingVertical: design.isSmallScreen ? SPACING.sm : SPACING.md,
      gap: design.isSmallScreen ? 6 : SPACING.sm,
    },

    responsiveDurationButton: {
      paddingHorizontal: design.isSmallScreen ? 10 : SPACING.md,
      paddingVertical: design.isSmallScreen ? 5 : 6,
      borderRadius: design.isSmallScreen ? SPACING.sm : SPACING.md,
      minWidth: design.isSmallScreen ? 45 : 50,
    },

    responsiveTimerButton: {
      paddingHorizontal: design.isSmallScreen ? 14 : SPACING.lg,
      paddingVertical: design.isSmallScreen ? 6 : SPACING.sm,
      borderRadius: design.isSmallScreen ? SPACING.sm : SPACING.md,
      minWidth: design.isSmallScreen ? 120 : 140,
    },

    // Autres styles responsive
    responsiveTextInput: {
      paddingHorizontal: design.isSmallScreen ? SPACING.md : 15,
      paddingVertical: design.isSmallScreen ? SPACING.md : 15,
    },

    responsiveSidebar: {
      width: design.isSmallScreen ? 300 : 350,
    },

    responsiveModal: {
      marginHorizontal: design.containerPadding,
      padding: design.isSmallScreen ? SPACING.xl : SPACING.xxl,
      borderRadius: design.isSmallScreen ? SPACING.md : BORDER_RADIUS.lg,
    },

    responsiveFocusMode: {
      paddingTop: design.insets.top + (design.isSmallScreen ? 50 : 55),
      paddingBottom: design.insets.bottom + (design.isSmallScreen ? 50 : 55),
      paddingHorizontal: design.containerPadding + (design.isSmallScreen ? 5 : 10),
    },

    responsiveFocusControls: {
      top: design.insets.top + (design.isSmallScreen ? 15 : SPACING.xl),
      left: design.isSmallScreen ? SPACING.xl : 30,
      right: design.isSmallScreen ? SPACING.xl : 30,
    },

    responsiveFocusTimer: {
      top: design.insets.top + (design.isSmallScreen ? 15 : SPACING.xl),
      right: design.isSmallScreen ? SPACING.xl : 30,
    },

    // Animations et transitions (web only)
    webTransitions: Platform.OS === "web" ? ({ transition: "all 0.2s ease" } as any) : {},

    responsiveShadow: {
      shadowColor: COLORS.shadow,
            shadowOffset: {
              width: 0,
              height: design.isSmallScreen ? 2 : 4,
            },
          },
        });
      };