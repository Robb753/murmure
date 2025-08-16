import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";
import { Image } from "expo-image";
import { mainPageStyles } from "@/styles";
import BurgerMenu from "@/components/BurgerMenu";
import { landingStyles } from "@/styles/mainPage.styles";

// Types
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  currentTheme: any;
}

interface FAQItemProps {
  question: string;
  answer: string;
  currentTheme: any;
  isOpen: boolean;
  onToggle: () => void;
}

// Components
const FeatureCard = memo<FeatureCardProps>(
  ({ icon, title, description, currentTheme }) => (
    <View
      style={[
        landingStyles.featureCard,
        { backgroundColor: currentTheme.background },
      ]}
      accessible
      accessibilityLabel={`Fonctionnalité: ${title}. ${description}`}
    >
      <Text style={landingStyles.featureIcon} accessibilityElementsHidden>
        {icon}
      </Text>
      <Text style={[landingStyles.featureTitle, { color: currentTheme.text }]}>
        {title}
      </Text>
      <Text
        style={[
          landingStyles.featureDescription,
          { color: currentTheme.textSecondary },
        ]}
      >
        {description}
      </Text>
    </View>
  )
);
FeatureCard.displayName = "FeatureCard";

const FAQItem = memo<FAQItemProps>(
  ({ question, answer, currentTheme, isOpen, onToggle }) => (
    <View style={[landingStyles.faqItem, { borderColor: currentTheme.border }]}>
      <TouchableOpacity
        style={landingStyles.faqQuestion}
        onPress={onToggle}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`FAQ: ${question}. ${
          isOpen ? "Ouvert" : "Fermé"
        }. Appuyez pour ${isOpen ? "fermer" : "ouvrir"}.`}
        accessibilityState={{ expanded: isOpen }}
      >
        <Text
          style={[landingStyles.faqQuestionText, { color: currentTheme.text }]}
        >
          {question}
        </Text>
        <Text
          style={[landingStyles.faqIcon, { color: currentTheme.textSecondary }]}
        >
          {isOpen ? "−" : "+"}
        </Text>
      </TouchableOpacity>
      {isOpen && (
        <Text
          style={[
            landingStyles.faqAnswer,
            { color: currentTheme.textSecondary },
          ]}
        >
          {answer}
        </Text>
      )}
    </View>
  )
);
FAQItem.displayName = "FAQItem";

// Main Component
const MurmureLanding = memo(() => {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  // Responsive breakpoints
  const isMobile = width < 768;
  const isSmallMobile = width < 400;
  const isVerySmallMobile = width < 360;
  const logoSize = width > 768 ? 100 : width > 400 ? 80 : 60;

  const { currentTheme, changeTheme } = useAdvancedTheme({
    defaultTheme: "papyrus",
    defaultMode: "light",
    persistPreferences: false,
  });

  // Effects
  useEffect(() => {
    changeTheme("papyrus");
  }, [changeTheme]);

  useEffect(() => {
    if (Platform.OS === "web") {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        const meta = document.createElement("meta");
        meta.name = "viewport";
        meta.content =
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
        document.head.appendChild(meta);
      }
      document.body.style.overflowX = "hidden";
    }
  }, []);

  // Handlers
  const handleWebAppClick = useCallback(() => {
    router.push("/app");
  }, [router]);

  const handleDownloadClick = useCallback(() => {
    if (Platform.OS === "web") {
      window.open(
        "https://play.google.com/store/apps/details?id=com.yourname.murmure",
        "_blank"
      );
    }
  }, []);

  const toggleFAQ = useCallback(
    (faqId: string) => setOpenFAQ((prev) => (prev === faqId ? null : faqId)),
    []
  );

  // Memoized data
  const responsiveOverrides = useMemo(
    () => ({
      hero: {
        paddingHorizontal: isVerySmallMobile ? 12 : isSmallMobile ? 16 : 20,
        paddingVertical: isMobile ? 40 : 80,
      },
      heroMainTitle: {
        fontSize: isVerySmallMobile
          ? 26
          : isSmallMobile
          ? 30
          : isMobile
          ? 32
          : 48,
        paddingHorizontal: isVerySmallMobile ? 4 : 8,
      },
      heroSubTitle: {
        fontSize: isVerySmallMobile
          ? 20
          : isSmallMobile
          ? 24
          : isMobile
          ? 28
          : 40,
        paddingHorizontal: isVerySmallMobile ? 4 : 8,
      },
      heroDescription: {
        fontSize: isVerySmallMobile
          ? 16
          : isSmallMobile
          ? 17
          : isMobile
          ? 18
          : 20,
        paddingHorizontal: isVerySmallMobile ? 8 : 12,
        maxWidth: isSmallMobile ? width - 32 : 600,
      },
      phoneMockup: {
        maxWidth: isVerySmallMobile ? 220 : isSmallMobile ? 250 : 300,
        transform: [{ rotate: isMobile ? "1deg" : "3deg" }],
      },
      featureGrid: {
        flexDirection: (isMobile ? "column" : "row") as "column" | "row",
        paddingHorizontal: isVerySmallMobile ? 8 : 16,
      },
      featureCard: {
        width: isMobile ? Math.min(width - 32, 320) : 280,
        padding: isSmallMobile ? 20 : 32,
      },
    }),
    [width, isMobile, isSmallMobile, isVerySmallMobile]
  );

  const featuresData = useMemo(
    () => [
      {
        icon: "✍️",
        title: "Écriture libre sans distraction",
        description:
          "Un espace calme pour explorer tes pensées sans interruption ni jugement.",
      },
      {
        icon: "🌙",
        title: "Mode focus avec minuterie",
        description:
          "Écris sans interruption pendant 5, 10 ou 15 minutes avec notre minuterie intégrée.",
      },
      {
        icon: "🎨",
        title: "Thèmes personnalisables",
        description:
          "Adapte ton espace d'écriture à ton humeur avec nos thèmes et typographies.",
      },
      {
        icon: "💾",
        title: "Sauvegarde & export",
        description:
          "Tes textes restent à toi. Sauvegarde locale et export en un clic.",
      },
    ],
    []
  );

  const faqData = useMemo(
    () => [
      {
        id: "security",
        question: "Est-ce que mes données sont en sécurité ?",
        answer:
          "Oui, absolument ! Tous tes textes sont enregistrés localement sur ton appareil. Aucune donnée n'est transmise à nos serveurs ou à des tiers. Tu gardes le contrôle total de tes écrits.",
        isOpen: openFAQ === "security",
        onToggle: () => toggleFAQ("security"),
      },
      {
        id: "free",
        question: "Est-ce que c'est gratuit ?",
        answer:
          "Oui, Murmure est 100% gratuite ! Nous croyons que l'écriture introspective devrait être accessible à tous, sans barrière financière.",
        isOpen: openFAQ === "free",
        onToggle: () => toggleFAQ("free"),
      },
      {
        id: "export",
        question: "Puis-je exporter mes textes ?",
        answer:
          "Oui, en un clic ! Tu peux exporter tes textes au format TXT ou PDF à tout moment. Tes écrits t'appartiennent et tu peux les récupérer quand tu veux.",
        isOpen: openFAQ === "export",
        onToggle: () => toggleFAQ("export"),
      },
    ],
    [openFAQ, toggleFAQ]
  );

  return (
    <ScrollView
      style={[
        landingStyles.container,
        { backgroundColor: currentTheme.background },
      ]}
      showsVerticalScrollIndicator
      bounces
    >
      {/* Header */}
      <View
        style={[
          landingStyles.header,
          {
            borderBottomColor: currentTheme.border + "30", // Bordure plus subtile
            backgroundColor: currentTheme.background + "F5", // Semi-transparent
          },
        ]}
      >
        <View style={landingStyles.headerContent}>
          {/* Logo à gauche */}
          <View style={landingStyles.logo}>
            <Image
              source={require("@/assets/images/logo-murmure.png")}
              style={[
                mainPageStyles.logoImage,
                {
                  width: logoSize,
                  height: logoSize,
                  borderRadius: logoSize * 0.2, // Coins légèrement arrondis
                  shadowColor: "#8B4513",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                },
              ]}
              accessible
              accessibilityLabel="Logo de Murmure"
            />
          </View>

          {/* BurgerMenu qui gère automatiquement responsive */}
          <BurgerMenu
            currentTheme={currentTheme}
            router={router}
            handleDownloadClick={handleDownloadClick}
            // Vous pouvez forcer un mode si nécessaire :
            // forceMode={isMobile ? "burger" : "nav"}
          />
        </View>
      </View>

      {/* Hero Section */}
      <View
        style={[
          landingStyles.hero,
          responsiveOverrides.hero,
          { backgroundColor: currentTheme.background },
        ]}
      >
        {/* Background Elements */}
        <View
          style={[
            landingStyles.backgroundElement1,
            {
              width: isMobile ? 64 : 128,
              height: isMobile ? 64 : 128,
              borderRadius: isMobile ? 32 : 64,
            },
          ]}
          accessibilityElementsHidden
        />
        <View
          style={[
            landingStyles.backgroundElement2,
            {
              width: isMobile ? 80 : 160,
              height: isMobile ? 80 : 160,
              borderRadius: isMobile ? 40 : 80,
            },
          ]}
          accessibilityElementsHidden
        />

        <View style={landingStyles.heroContent}>
          {/* Titles */}
          <View style={landingStyles.heroTitleContainer}>
            <Text
              style={[
                landingStyles.heroMainTitle,
                responsiveOverrides.heroMainTitle,
                { color: currentTheme.text },
              ]}
              accessibilityRole="header"
            >
              Écris librement.
            </Text>
            <Text
              style={[
                landingStyles.heroSubTitle,
                responsiveOverrides.heroSubTitle,
                { color: currentTheme.text },
              ]}
              accessibilityRole="header"
            >
              Murmure ce que tu n&apos;oses dire.
            </Text>
          </View>

          {/* Description */}
          <Text
            style={[
              landingStyles.heroDescription,
              responsiveOverrides.heroDescription,
              { color: currentTheme.textSecondary },
            ]}
          >
            Un refuge numérique pour tes pensées les plus intimes.{"\n"}
            Écris sans filtre, sans jugement, juste toi et tes mots.
          </Text>

          {/* Phone Mockup */}
          <View style={landingStyles.phoneMockupContainer}>
            <View
              style={[
                landingStyles.phoneMockup,
                responsiveOverrides.phoneMockup,
              ]}
            >
              <View style={landingStyles.phoneGradient}>
                <View style={landingStyles.phoneScreen}>
                  <View style={landingStyles.phoneHeader}>
                    <View style={landingStyles.phoneAppInfo}>
                      {/* REMPLACÉ: Emoji par votre logo */}
                      <Image
                        source={require("@/assets/images/logo-murmure.png")}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                        }}
                        accessible
                        accessibilityLabel="Logo Murmure"
                      />
                      <Text style={landingStyles.phoneAppName}>Murmure</Text>
                    </View>
                    <Text style={landingStyles.phoneTime}>15:42</Text>
                  </View>

                  <View style={landingStyles.phoneContent}>
                    <Text style={landingStyles.phoneSessionLabel}>
                      Session de 10 minutes
                    </Text>
                    <View style={landingStyles.phoneTextArea}>
                      <Text style={landingStyles.phoneText}>
                        Aujourd&apos;hui j&apos;ai envie d&apos;écrire sur cette
                        sensation étrange que j&apos;ai eue ce matin...
                      </Text>
                      <View style={landingStyles.phoneCursor} />
                    </View>

                    <View style={landingStyles.phoneFooter}>
                      <Text style={landingStyles.phoneWordCount}>127 mots</Text>
                      <View style={landingStyles.phoneDots}>
                        <View
                          style={[
                            landingStyles.phoneDot,
                            { backgroundColor: "#fbbf24" },
                          ]}
                        />
                        <View
                          style={[
                            landingStyles.phoneDot,
                            { backgroundColor: "#fcd34d" },
                          ]}
                        />
                        <View
                          style={[
                            landingStyles.phoneDot,
                            { backgroundColor: "#fde68a" },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={landingStyles.ctaContainer}>
            {/* ✅ LOGIQUE CONDITIONNELLE : Web vs App native */}
            {Platform.OS === "web" ? (
              // 🌐 VERSION WEB - 2 boutons comme avant
              <>
                <TouchableOpacity
                  style={[
                    landingStyles.ctaPrimaryGreen,
                    {
                      minWidth: isSmallMobile ? 250 : 280,
                      maxWidth: isSmallMobile ? width - 64 : 320,
                    },
                  ]}
                  onPress={handleWebAppClick}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Essayer Murmure maintenant gratuitement"
                >
                  <Text style={landingStyles.ctaPrimaryGreenText}>
                    Version Web
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    landingStyles.ctaSecondaryOutline,
                    {
                      minWidth: isSmallMobile ? 250 : 280,
                      maxWidth: isSmallMobile ? width - 64 : 320,
                    },
                  ]}
                  onPress={handleDownloadClick}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Télécharger l'application mobile Murmure"
                >
                  <Text style={landingStyles.ctaSecondaryOutlineText}>
                    Télécharge l&apos;app
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // 📱 VERSION APP NATIVE - 1 seul bouton
              <TouchableOpacity
                style={[
                  landingStyles.ctaPrimaryGreen,
                  {
                    minWidth: isSmallMobile ? 250 : 280,
                    maxWidth: isSmallMobile ? width - 64 : 320,
                  },
                ]}
                onPress={handleWebAppClick}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Commencer à écrire avec Murmure"
              >
                <Text style={landingStyles.ctaPrimaryGreenText}>
                  Commence à écrire
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Trust Indicators */}
          <View style={landingStyles.trustIndicators}>
            <View style={landingStyles.trustItem}>
              <Text style={landingStyles.trustIcon}>❤️</Text>
              <Text
                style={[
                  landingStyles.trustText,
                  { color: currentTheme.textSecondary },
                ]}
              >
                Gratuit
              </Text>
            </View>
            <View style={landingStyles.trustItem}>
              <Text style={landingStyles.trustIcon}>🛡️</Text>
              <Text
                style={[
                  landingStyles.trustText,
                  { color: currentTheme.textSecondary },
                ]}
              >
                100% privé
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Why Section */}
      <View
        style={[
          landingStyles.whySection,
          { backgroundColor: `${currentTheme.accent}08` },
        ]}
      >
        <Text
          style={[landingStyles.sectionTitle, { color: currentTheme.text }]}
        >
          Pourquoi Murmure ?
        </Text>
        <Text
          style={[landingStyles.whyText, { color: currentTheme.textSecondary }]}
        >
          Nous avons tous des choses à écrire, mais parfois, trop d&apos;outils
          tuent la plume. Murmure est né du besoin d&apos;un endroit calme, sans
          bruit, sans jugement, pour simplement… écrire.
        </Text>
      </View>

      {/* Features */}
      <View
        style={[
          {
            backgroundColor: currentTheme.surface,
            paddingVertical: 80,
            paddingHorizontal: 16,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text
          style={{
            fontSize: isSmallMobile ? 28 : 36,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 48,
            color: currentTheme.text,
            fontFamily: Platform.select({
              ios: "Palatino",
              android: "serif",
              web: "'Crimson Text', 'Palatino Linotype', serif",
            }),
          }}
        >
          Fonctionnalités
        </Text>

        {/* Container des cartes */}
        <View
          style={{
            width: "100%",
            maxWidth: 400, // ✅ Largeur max pour mobile
            alignItems: "center",
            gap: 20,
          }}
        >
          {featuresData.map((feature, index) => (
            <View
              key={`feature-${index}`}
              style={{
                backgroundColor: currentTheme.background,
                padding: isSmallMobile ? 20 : 28,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",

                // ✅ LARGEUR QUI MARCHE PARTOUT
                width: "100%",
                maxWidth: 350,
                minWidth: 280,
                minHeight: 180,

                // ✅ OMBRE ET BORDURE
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                borderWidth: 1,
                borderColor: currentTheme.border + "60",
              }}
            >
              <Text
                style={{
                  fontSize: 40,
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                {feature.icon}
              </Text>

              <Text
                style={{
                  fontSize: isSmallMobile ? 16 : 18,
                  fontWeight: "600",
                  color: currentTheme.text,
                  textAlign: "center",
                  marginBottom: 8,
                  lineHeight: isSmallMobile ? 22 : 24,
                }}
              >
                {feature.title}
              </Text>

              <Text
                style={{
                  fontSize: isSmallMobile ? 13 : 15,
                  color: currentTheme.textSecondary,
                  textAlign: "center",
                  lineHeight: isSmallMobile ? 18 : 20,
                }}
              >
                {feature.description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* FAQ */}
      <View
        style={[
          landingStyles.faqSection,
          { backgroundColor: currentTheme.background },
        ]}
        accessible
        accessibilityLabel="Questions fréquemment posées"
      >
        <Text
          style={[landingStyles.sectionTitle, { color: currentTheme.text }]}
          accessibilityRole="header"
        >
          Questions fréquentes
        </Text>

        <View style={landingStyles.faqContainer}>
          {faqData.map((faq) => (
            <FAQItem
              key={faq.id}
              question={faq.question}
              answer={faq.answer}
              currentTheme={currentTheme}
              isOpen={faq.isOpen}
              onToggle={faq.onToggle}
            />
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={[landingStyles.footer, { backgroundColor: "#0f172a" }]}>
        <View style={landingStyles.footerContent}>
          <View
            style={[
              landingStyles.footerGrid,
              {
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? 32 : 0,
                alignItems: isMobile ? "flex-start" : "stretch",
              },
            ]}
          >
            {/* Column 1 - Logo and description */}
            <View
              style={[
                landingStyles.footerColumn,
                {
                  flex: isMobile ? 0 : 1,
                  marginRight: isMobile ? 0 : 32,
                  maxWidth: isMobile ? "100%" : 300,
                },
              ]}
            >
              <View
                style={[landingStyles.footerLogo, { alignItems: "center" }]}
              >
                <Image
                  source={require("@/assets/images/logo-murmure.png")}
                  style={{
                    width: 28,
                    height: 28,
                    marginRight: 12,
                    borderRadius: 6,
                  }}
                  accessible
                  accessibilityLabel="Logo Murmure"
                />
                <Text style={landingStyles.footerLogoText}>Murmure</Text>
              </View>

              {/* ✅ CORRECTION : Conteneur pour le texte de description */}
              <View
                style={{
                  width: "100%",
                  flexDirection: "column", // Force la direction verticale pour le conteneur
                }}
              >
                <Text
                  style={[
                    landingStyles.footerDescription,
                    {
                      lineHeight: 24,
                      marginBottom: isMobile ? 8 : 16,
                      marginTop: 8,
                      width: "100%", // ✅ Largeur complète
                      flexWrap: "wrap", // ✅ Permet le retour à la ligne
                    },
                  ]}
                >
                  L&apos;espace minimaliste pour ton écriture introspective.
                </Text>
                <Text
                  style={[
                    landingStyles.footerDescription,
                    {
                      fontSize: 14,
                      fontStyle: "italic",
                      opacity: 0.8,
                      color: "#9ca3af",
                      lineHeight: 20,
                      width: "100%", // ✅ Largeur complète
                      flexWrap: "wrap", // ✅ Permet le retour à la ligne
                    },
                  ]}
                >
                  Écris sans filtre, murmure tes pensées.
                </Text>
              </View>
            </View>

            {/* Column 2 - Useful links */}
            <View
              style={[
                landingStyles.footerColumn,
                {
                  flex: isMobile ? 0 : 1,
                  marginRight: isMobile ? 0 : 32,
                  minWidth: isMobile ? "100%" : 160,
                },
              ]}
            >
              <Text
                style={[landingStyles.footerColumnTitle, { marginBottom: 16 }]}
              >
                Liens utiles
              </Text>

              {[
                { text: "À propos", route: "/about" },
                { text: "Confidentialité", route: "/privacy" },
                { text: "Contact et Support", route: "/support" },
              ].map((link, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    landingStyles.footerLink,
                    {
                      paddingVertical: 6,
                      borderRadius: 4,
                      paddingHorizontal: 8,
                      marginHorizontal: -8,
                      marginBottom: 8,
                    },
                  ]}
                  onPress={() => router.push(link.route)}
                  accessible
                  accessibilityRole="link"
                >
                  <Text
                    style={[
                      landingStyles.footerLinkText,
                      {
                        fontSize: 15,
                        color: "#cbd5e1",
                      },
                    ]}
                  >
                    {link.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Column 3 - Download */}
            <View
              style={[
                landingStyles.footerColumn,
                {
                  flex: isMobile ? 0 : 1,
                  marginRight: isMobile ? 0 : 32,
                  minWidth: isMobile ? "100%" : 200,
                },
              ]}
            >
              <Text
                style={[landingStyles.footerColumnTitle, { marginBottom: 16 }]}
              >
                Télécharger
              </Text>

              <TouchableOpacity
                style={[
                  landingStyles.footerButton,
                  {
                    backgroundColor: currentTheme.accent,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: isMobile ? 200 : 180,
                    maxWidth: isMobile ? 250 : 200,
                    shadowColor: currentTheme.accent,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 6,
                  },
                ]}
                onPress={handleDownloadClick}
                accessible
                accessibilityRole="button"
              >
                <Text
                  style={[
                    landingStyles.footerButtonText,
                    {
                      fontSize: 15,
                      fontWeight: "600",
                    },
                  ]}
                >
                  📲 Google Play
                </Text>
              </TouchableOpacity>

              <Text
                style={[
                  landingStyles.footerDescription,
                  {
                    fontSize: 12,
                    marginTop: 8,
                    opacity: 0.7,
                  },
                ]}
              >
                App Store bientôt disponible
              </Text>
            </View>

            {/* Column 4 - Social */}
            <View
              style={[
                landingStyles.footerColumn,
                {
                  flex: isMobile ? 0 : 1,
                  minWidth: isMobile ? "100%" : 160,
                },
              ]}
            >
              <Text
                style={[landingStyles.footerColumnTitle, { marginBottom: 18 }]}
              >
                Suivez-nous
              </Text>

              <View style={{ gap: 8 }}>
                {[
                  {
                    icon: "🐦",
                    text: "Twitter",
                    url: "https://twitter.com/MurmureApp",
                  },
                ].map((social, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      landingStyles.footerLink,
                      {
                        paddingVertical: 6,
                        borderRadius: 4,
                        paddingHorizontal: 8,
                        marginHorizontal: -8,
                        flexDirection: "row",
                        alignItems: "center",
                      },
                    ]}
                    onPress={() => {
                      if (Platform.OS === "web") {
                        window.open(social.url, "_blank");
                      }
                    }}
                    accessible
                    accessibilityRole="link"
                  >
                    <Text style={{ fontSize: 16, marginRight: 8 }}>
                      {social.icon}
                    </Text>
                    <Text
                      style={[
                        landingStyles.footerLinkText,
                        {
                          fontSize: 12,
                          color: "#cbd5e1",
                        },
                      ]}
                    >
                      {social.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Footer bottom */}
        <View
          style={[
            landingStyles.footerBottom,
            {
              paddingTop: isMobile ? 24 : 32,
              borderTopColor: "#1e293b",
              marginTop: 24,
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: isMobile ? 12 : 0,
            },
          ]}
        >
          <Text
            style={[
              landingStyles.footerCopyright,
              {
                textAlign: isMobile ? "center" : "left",
                flex: isMobile ? 0 : 1,
              },
            ]}
          >
            © 2025 Murmure. Tous droits réservés.
          </Text>

          <Text
            style={[
              landingStyles.footerCopyright,
              {
                textAlign: isMobile ? "center" : "right",
                fontSize: 12,
                opacity: 0.6,
              },
            ]}
          >
            Version 1.0.0 • Fait avec ❤️
          </Text>
        </View>
      </View>
    </ScrollView>
  );
});

MurmureLanding.displayName = "MurmureLanding";
export default MurmureLanding;
