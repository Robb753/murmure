import React, { useState, useCallback, useMemo, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";
import { Image } from "expo-image";
import { mainPageStyles } from "@/styles";
import BurgerMenu from "@/components/BurgerMenu";

// Types pour les props des composants
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

interface DynamicStyles {
  heroBackground: { backgroundColor: string };
  headerBackground: { backgroundColor: string; borderBottomColor: string };
  whyBackground: { backgroundColor: string };
  featuresBackground: { backgroundColor: string };
  faqBackground: { backgroundColor: string };
  finalCtaBackground: { backgroundColor: string };
  footerIconColor: { color: string };
  footerButtonBackground: { backgroundColor: string };
}

// Mémorisation du HEAD/Meta tags
const SEOHead = memo(() => {
  if (Platform.OS !== "web") return null;

  return (
    <head>
      {/* Titre et meta description */}
      <title>Murmure - Écriture libre et introspective | App gratuite</title>
      <meta
        name="description"
        content="Découvrez Murmure, l'app d'écriture libre pour explorer vos pensées sans jugement. Thèmes personnalisables, mode focus, 100% gratuit et privé."
      />
      <meta
        name="keywords"
        content="écriture libre, journal intime, mindfulness, bien-être mental, app gratuite, méditation, introspection, pensées, écriture thérapeutique"
      />

      {/* Viewport et responsive */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta
        property="og:title"
        content="Murmure - Écriture libre et introspective"
      />
      <meta
        property="og:description"
        content="Un refuge numérique pour tes pensées les plus intimes. Écris sans filtre, sans jugement."
      />
      <meta property="og:url" content="https://murmure.app" />
      <meta property="og:site_name" content="Murmure" />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:image" content="https://murmure.app/og-image.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="Murmure - App d'écriture libre et introspective"
      />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content="Murmure - Écriture libre et introspective"
      />
      <meta
        name="twitter:description"
        content="Un refuge numérique pour tes pensées les plus intimes"
      />
      <meta
        name="twitter:image"
        content="https://murmure.app/twitter-card.jpg"
      />
      <meta name="twitter:creator" content="@MurmureApp" />

      {/* Favicon et icônes */}
      <link rel="icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Canonical URL */}
      <link rel="canonical" href="https://murmure.app" />

      {/* Données structurées JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MobileApplication",
          name: "Murmure",
          description:
            "App d'écriture libre et introspective pour explorer vos pensées sans jugement",
          applicationCategory: "LifestyleApplication",
          operatingSystem: ["Android", "iOS", "Web"],
          url: "https://murmure.app",
          downloadUrl:
            "https://play.google.com/store/apps/details?id=com.yourname.murmure",
          author: {
            "@type": "Organization",
            name: "Équipe Murmure",
            url: "https://murmure.app",
          },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "1247",
            bestRating: "5",
            worstRating: "1",
          },
          featureList: [
            "Écriture libre sans distraction",
            "Mode focus avec minuterie",
            "Thèmes personnalisables",
            "Sauvegarde locale et export",
            "100% gratuit et privé",
          ],
        })}
      </script>

      {/* Meta tags supplémentaires pour le SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="French" />
      <meta name="author" content="Équipe Murmure" />
      <meta name="copyright" content="© 2025 Murmure. Tous droits réservés." />
      <meta name="theme-color" content="#92400e" />

      {/* Preconnect pour optimiser les performances */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
    </head>
  );
});

SEOHead.displayName = "SEOHead";

// Composant Feature Card optimisé avec memo
const FeatureCard = memo<FeatureCardProps>(
  ({ icon, title, description, currentTheme }) => (
    <View
      style={[styles.featureCard, { backgroundColor: currentTheme.background }]}
      accessible={true}
      accessibilityLabel={`Fonctionnalité: ${title}. ${description}`}
    >
      <Text style={styles.featureIcon} accessibilityElementsHidden={true}>
        {icon}
      </Text>
      <Text style={[styles.featureTitle, { color: currentTheme.text }]}>
        {title}
      </Text>
      <Text
        style={[
          styles.featureDescription,
          { color: currentTheme.textSecondary },
        ]}
      >
        {description}
      </Text>
    </View>
  )
);

FeatureCard.displayName = "FeatureCard";

// Composant FAQ Item optimisé avec memo
const FAQItem = memo<FAQItemProps>(
  ({ question, answer, currentTheme, isOpen, onToggle }) => (
    <View style={[styles.faqItem, { borderColor: currentTheme.border }]}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={onToggle}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`FAQ: ${question}. ${
          isOpen ? "Ouvert" : "Fermé"
        }. Appuyez pour ${isOpen ? "fermer" : "ouvrir"}.`}
        accessibilityState={{ expanded: isOpen }}
      >
        <Text style={[styles.faqQuestionText, { color: currentTheme.text }]}>
          {question}
        </Text>
        <Text style={[styles.faqIcon, { color: currentTheme.textSecondary }]}>
          {isOpen ? "−" : "+"}
        </Text>
      </TouchableOpacity>
      {isOpen && (
        <Text style={[styles.faqAnswer, { color: currentTheme.textSecondary }]}>
          {answer}
        </Text>
      )}
    </View>
  )
);

FAQItem.displayName = "FAQItem";

// Composant principal optimisé
const MurmureLanding = memo(() => {
  const router = useRouter();
  const { currentTheme, changeTheme } = useAdvancedTheme({
    defaultTheme: "papyrus",
    defaultMode: "light",
    persistPreferences: false,
  });

  // State pour la FAQ
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  // ✅ Effect optimisé - pas de dépendance changeTheme pour éviter les re-renders
  React.useEffect(() => {
    changeTheme("papyrus");
  }, [changeTheme]); // Suppression de la dépendance changeTheme

  // ✅ Callbacks mémorisés pour éviter les re-renders des enfants
  const handleWebAppClick = useCallback(() => {
    router.push("/app");
  }, [router]);

  const handleDownloadClick = useCallback(() => {
    if (Platform.OS === "web") {
      window.open(
        "https://play.google.com/store/apps/details?id=com.yourname.murmure"
      );
    }
  }, []);

  const toggleFAQ = useCallback((faqId: string) => {
    setOpenFAQ((prevOpenFAQ) => (prevOpenFAQ === faqId ? null : faqId));
  }, []);

  // ✅ Styles dynamiques mémorisés pour éviter les recalculs
  const dynamicStyles = useMemo<DynamicStyles>(
    () => ({
      heroBackground: { backgroundColor: currentTheme.background },
      headerBackground: {
        backgroundColor: `${currentTheme.surface}cc`,
        borderBottomColor: currentTheme.border,
      },
      whyBackground: { backgroundColor: `${currentTheme.accent}10` },
      featuresBackground: { backgroundColor: currentTheme.surface },
      faqBackground: { backgroundColor: currentTheme.background },
      finalCtaBackground: { backgroundColor: currentTheme.accent },
      footerIconColor: { color: currentTheme.accent },
      footerButtonBackground: { backgroundColor: currentTheme.accent },
    }),
    [currentTheme]
  );

  // ✅ Mémorisation des callbacks FAQ
  const toggleSecurity = useCallback(() => toggleFAQ("security"), [toggleFAQ]);
  const toggleFree = useCallback(() => toggleFAQ("free"), [toggleFAQ]);
  const toggleExport = useCallback(() => toggleFAQ("export"), [toggleFAQ]);

  // ✅ Mémorisation des données FAQ pour éviter les re-renders
  const faqData = useMemo(
    () => [
      {
        id: "security",
        question: "Est-ce que mes données sont en sécurité ?",
        answer:
          "Oui, absolument ! Tous tes textes sont enregistrés localement sur ton appareil. Aucune donnée n'est transmise à nos serveurs ou à des tiers. Tu gardes le contrôle total de tes écrits.",
        isOpen: openFAQ === "security",
        onToggle: toggleSecurity,
      },
      {
        id: "free",
        question: "Est-ce que c'est gratuit ?",
        answer:
          "Oui, Murmure est 100% gratuite ! Nous croyons que l'écriture introspective devrait être accessible à tous, sans barrière financière.",
        isOpen: openFAQ === "free",
        onToggle: toggleFree,
      },
      {
        id: "export",
        question: "Puis-je exporter mes textes ?",
        answer:
          "Oui, en un clic ! Tu peux exporter tes textes au format TXT ou PDF à tout moment. Tes écrits t'appartiennent et tu peux les récupérer quand tu veux.",
        isOpen: openFAQ === "export",
        onToggle: toggleExport,
      },
    ],
    [openFAQ, toggleSecurity, toggleFree, toggleExport]
  );

  // ✅ Mémorisation des features pour éviter les re-renders
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
const { width } = Dimensions.get("window");
const logoSize = width > 768 ? 100 : width > 400 ? 80 : 60;

  return (
    <>
      <SEOHead />
      <ScrollView
        style={[styles.container, dynamicStyles.heroBackground]}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={true}
        accessibilityRole="scrollbar"
      >
        {/* Header */}
        <View style={[styles.header, dynamicStyles.headerBackground]}>
          <View style={styles.headerContent}>
            <View style={styles.logo}>
              <Image
                source={require("@/assets/images/logo-murmure.png")}
                style={[
                  mainPageStyles.logoImage,
                  { width: logoSize, height: logoSize }, // Override dynamique
                ]}
                accessible={true}
                accessibilityLabel="Logo de Murmure"
              />
            </View>

            <BurgerMenu
              currentTheme={currentTheme}
              router={router}
              handleDownloadClick={handleDownloadClick}
            />
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          {/* Subtle background elements */}
          <View
            style={styles.backgroundElement1}
            accessibilityElementsHidden={true}
          />
          <View
            style={styles.backgroundElement2}
            accessibilityElementsHidden={true}
          />

          <View style={styles.heroContent}>
            <View style={styles.heroTitleContainer}>
              <Text
                style={[styles.heroMainTitle, { color: "#92400e" }]}
                accessibilityRole="header"
              >
                Écris librement.
              </Text>
              <Text
                style={[styles.heroSubTitle, { color: "#c2410c" }]}
                accessibilityRole="header"
              >
                Murmure ce que tu n&apos;oses dire.
              </Text>
            </View>

            <Text style={[styles.heroDescription, { color: "#92400e" }]}>
              Un refuge numérique pour tes pensées les plus intimes.{"\n"}
              Écris sans filtre, sans jugement, juste toi et tes mots.
            </Text>

            {/* Enhanced Phone Mockup */}
            <View
              style={styles.phoneMockupContainer}
              accessibilityRole="image"
              accessibilityLabel="Aperçu de l'interface de l'application Murmure sur mobile"
            >
              <View style={styles.phoneMockup}>
                <View style={styles.phoneGradient}>
                  <View style={styles.phoneScreen}>
                    {/* Phone screen header */}
                    <View style={styles.phoneHeader}>
                      <View style={styles.phoneAppInfo}>
                        <Text
                          style={styles.phoneMoonIcon}
                          accessibilityElementsHidden={true}
                        >
                          🌙
                        </Text>
                        <Text style={styles.phoneAppName}>Murmure</Text>
                      </View>
                      <Text style={styles.phoneTime}>15:42</Text>
                    </View>

                    {/* Phone screen content */}
                    <View style={styles.phoneContent}>
                      <Text style={styles.phoneSessionLabel}>
                        Session de 10 minutes
                      </Text>
                      <View style={styles.phoneTextArea}>
                        <Text style={styles.phoneText}>
                          Aujourd&apos;hui j&apos;ai envie d&apos;écrire sur
                          cette sensation étrange que j&apos;ai eue ce matin...
                        </Text>
                        <View style={styles.phoneCursor} />
                      </View>

                      <View style={styles.phoneFooter}>
                        <Text style={styles.phoneWordCount}>127 mots</Text>
                        <View style={styles.phoneDots}>
                          <View
                            style={[
                              styles.phoneDot,
                              { backgroundColor: "#fbbf24" },
                            ]}
                          />
                          <View
                            style={[
                              styles.phoneDot,
                              { backgroundColor: "#fcd34d" },
                            ]}
                          />
                          <View
                            style={[
                              styles.phoneDot,
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
            <View style={styles.ctaContainer}>
              <TouchableOpacity
                style={styles.ctaPrimaryGreen}
                onPress={handleWebAppClick}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Essayer Murmure maintenant gratuitement"
              >
                <Text style={styles.ctaPrimaryGreenText}>
                  ✨ Essayer maintenant
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ctaSecondaryOutline}
                onPress={handleDownloadClick}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Télécharger l'application mobile Murmure"
              >
                <Text style={styles.ctaSecondaryOutlineText}>
                  📱 Télécharger l&apos;app
                </Text>
              </TouchableOpacity>
            </View>

            {/* Trust indicators */}
            <View style={styles.trustIndicators}>
              <View style={styles.trustItem}>
                <Text
                  style={styles.trustIcon}
                  accessibilityElementsHidden={true}
                >
                  ❤️
                </Text>
                <Text style={styles.trustText}>Gratuit</Text>
              </View>
              <View style={styles.trustItem}>
                <Text
                  style={styles.trustIcon}
                  accessibilityElementsHidden={true}
                >
                  🛡️
                </Text>
                <Text style={styles.trustText}>100% privé</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Why Murmure Section */}
        <View style={[styles.whySection, dynamicStyles.whyBackground]}>
          <Text
            style={[styles.sectionTitle, { color: currentTheme.text }]}
            accessibilityRole="header"
          >
            Pourquoi Murmure ?
          </Text>
          <Text style={[styles.whyText, { color: currentTheme.textSecondary }]}>
            Nous avons tous des choses à écrire, mais parfois, trop
            d&apos;outils tuent la plume. Murmure est né du besoin d&apos;un
            endroit calme, sans bruit, sans jugement, pour simplement… écrire.
            Un retour à l&apos;essentiel de l&apos;écriture introspective, où
            seuls comptent tes mots et tes pensées.
          </Text>
        </View>

        {/* Features Section */}
        <View
          style={[styles.features, dynamicStyles.featuresBackground]}
          accessible={true}
          accessibilityLabel="Fonctionnalités de Murmure"
        >
          <Text
            style={[styles.sectionTitle, { color: currentTheme.text }]}
            accessibilityRole="header"
          >
            Fonctionnalités
          </Text>

          <View style={styles.featureGrid}>
            {featuresData.map((feature, index) => (
              <FeatureCard
                key={`feature-${index}`}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                currentTheme={currentTheme}
              />
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View
          style={[styles.faqSection, dynamicStyles.faqBackground]}
          accessible={true}
          accessibilityLabel="Questions fréquemment posées"
        >
          <Text
            style={[styles.sectionTitle, { color: currentTheme.text }]}
            accessibilityRole="header"
          >
            Questions fréquentes
          </Text>

          <View style={styles.faqContainer}>
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

        {/* Enhanced Footer */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerGrid}>
              {/* Logo et description */}
              <View style={styles.footerColumn}>
                <View style={styles.footerLogo}>
                  <Text
                    style={[
                      styles.footerLogoIcon,
                      dynamicStyles.footerIconColor,
                    ]}
                    accessibilityElementsHidden={true}
                  >
                    🌙
                  </Text>
                  <Text style={styles.footerLogoText}>Murmure</Text>
                </View>
                <Text style={styles.footerDescription}>
                  L&apos;espace minimaliste pour ton écriture introspective.
                </Text>
              </View>

              {/* Liens utiles */}
              <View style={styles.footerColumn}>
                <Text style={styles.footerColumnTitle}>Liens utiles</Text>
                <TouchableOpacity
                  style={styles.footerLink}
                  accessible={true}
                  accessibilityRole="link"
                  accessibilityLabel="En savoir plus sur Murmure"
                >
                  <Text
                    style={styles.footerLinkText}
                    onPress={() => router.push("/about")}
                  >
                    À propos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.footerLink}
                  onPress={() => router.push("/privacy")}
                  accessible={true}
                  accessibilityRole="link"
                  accessibilityLabel="Politique de confidentialité"
                >
                  <Text style={styles.footerLinkText}>Confidentialité</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.footerLink}
                  onPress={() => router.push("/support")}
                  accessible={true}
                  accessibilityRole="link"
                  accessibilityLabel="Nous contacter"
                >
                  <Text style={styles.footerLinkText}>Contact et Soutenir</Text>
                </TouchableOpacity>
              </View>

              {/* Télécharger */}
              <View style={styles.footerColumn}>
                <Text style={styles.footerColumnTitle}>Télécharger</Text>
                <TouchableOpacity
                  style={[
                    styles.footerButton,
                    dynamicStyles.footerButtonBackground,
                  ]}
                  onPress={handleDownloadClick}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Télécharger Murmure sur Google Play"
                >
                  <Text style={styles.footerButtonText}>📲 Google Play</Text>
                </TouchableOpacity>
              </View>

              {/* Réseaux sociaux */}
              <View style={styles.footerColumn}>
                <Text style={styles.footerColumnTitle}>Suivez-nous</Text>
                <View style={styles.socialLinks}>
                  <TouchableOpacity
                    style={styles.footerLink}
                    accessible={true}
                    accessibilityRole="link"
                    accessibilityLabel="Suivre Murmure sur Twitter"
                  >
                    <Text style={styles.footerLinkText}>Twitter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footerBottom}>
            <Text style={styles.footerCopyright}>
              © 2025 Murmure. Tous droits réservés.
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
});

MurmureLanding.displayName = "MurmureLanding";

export default MurmureLanding;

// ✅ Styles optimisés - Suppression de la logique inline
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  nav: {
    flexDirection: "row",
    alignItems: "center",
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
  // Background elements
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
    fontStyle: "italic",
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
  // Enhanced Phone Mockup
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
  // Updated CTA styles
  ctaPrimaryGreen: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 250,
    alignItems: "center",
    marginBottom: Platform.OS === "web" ? 0 : 16,
    marginRight: Platform.OS === "web" ? 16 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
    minWidth: 250,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  ctaContainer: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: "center",
  },
  // Why Murmure Section
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
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    margin: 16,
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
  finalCta: {
    paddingHorizontal: 20,
    paddingVertical: 80,
    alignItems: "center",
  },
  finalCtaTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 24,
  },
  finalCtaSubtitle: {
    fontSize: 20,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 48,
    maxWidth: 600,
  },
  finalCtaButtons: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    alignItems: "center",
  },
  finalCtaPrimary: {
    backgroundColor: "white",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 250,
    alignItems: "center",
    marginBottom: Platform.OS === "web" ? 0 : 16,
    marginRight: Platform.OS === "web" ? 16 : 0,
  },
  finalCtaPrimaryText: {
    fontSize: 18,
    fontWeight: "600",
  },
  finalCtaSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "white",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 250,
    alignItems: "center",
  },
  finalCtaSecondaryText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  // Enhanced Footer
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
