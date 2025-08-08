// app/index.tsx
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

// ---------- FeatureCard ----------
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

// ---------- FAQItem ----------
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

// ---------- Page ----------
const MurmureLanding = memo(() => {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const logoSize = width > 768 ? 100 : width > 400 ? 80 : 60;

  const { currentTheme, changeTheme } = useAdvancedTheme({
    defaultTheme: "papyrus",
    defaultMode: "light",
    persistPreferences: false,
  });

  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  useEffect(() => {
    changeTheme("papyrus");
  }, [changeTheme]);

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
  const toggleSecurity = useCallback(() => toggleFAQ("security"), [toggleFAQ]);
  const toggleFree = useCallback(() => toggleFAQ("free"), [toggleFAQ]);
  const toggleExport = useCallback(() => toggleFAQ("export"), [toggleFAQ]);

  // ===== MÉMORISATION DES OBJETS COMPLEXES =====
  const phoneTransform = useMemo(() => [{ rotate: "3deg" }], []);

  const headerBackgroundStyle = useMemo(
    () => ({
      backgroundColor: `${currentTheme.surface}cc`,
      borderBottomColor: currentTheme.border,
    }),
    [currentTheme.surface, currentTheme.border]
  );

  const dynamicBackgrounds = useMemo(
    () => ({
      hero: { backgroundColor: currentTheme.background },
      why: { backgroundColor: `${currentTheme.accent}08` },
      features: { backgroundColor: currentTheme.surface },
      faq: { backgroundColor: currentTheme.background },
    }),
    [currentTheme.background, currentTheme.accent, currentTheme.surface]
  );

  const footerDynamicStyles = useMemo(
    () => ({
      iconColor: { color: currentTheme.accent },
      buttonBackground: { backgroundColor: currentTheme.accent },
    }),
    [currentTheme.accent]
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

  return (
    <ScrollView
      style={[landingStyles.container, dynamicBackgrounds.hero]}
      removeClippedSubviews
      showsVerticalScrollIndicator
      bounces
    >
      {/* Header */}
      <View style={[landingStyles.header, headerBackgroundStyle]}>
        <View style={landingStyles.headerContent}>
          <View style={landingStyles.logo}>
            <Image
              source={require("@/assets/images/logo-murmure.png")}
              style={[
                mainPageStyles.logoImage,
                { width: logoSize, height: logoSize },
              ]}
              accessible
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

      {/* Hero */}
      <View style={landingStyles.hero}>
        <View
          style={landingStyles.backgroundElement1}
          accessibilityElementsHidden
        />
        <View
          style={landingStyles.backgroundElement2}
          accessibilityElementsHidden
        />

        <View style={landingStyles.heroContent}>
          <View style={landingStyles.heroTitleContainer}>
            <Text
              style={landingStyles.heroMainTitle}
              accessibilityRole="header"
            >
              Écris librement.
            </Text>
            <Text style={landingStyles.heroSubTitle} accessibilityRole="header">
              Murmure ce que tu n&apos;oses dire.
            </Text>
          </View>

          <Text style={landingStyles.heroDescription}>
            Un refuge numérique pour tes pensées les plus intimes.{"\n"}
            Écris sans filtre, sans jugement, juste toi et tes mots.
          </Text>

          {/* Phone Mockup */}
          <View
            style={landingStyles.phoneMockupContainer}
            accessibilityRole="image"
            accessibilityLabel="Aperçu de l'interface de l'application Murmure sur mobile"
          >
            <View
              style={[landingStyles.phoneMockup, { transform: phoneTransform }]}
            >
              <View style={landingStyles.phoneGradient}>
                <View style={landingStyles.phoneScreen}>
                  <View style={landingStyles.phoneHeader}>
                    <View style={landingStyles.phoneAppInfo}>
                      <Text
                        style={landingStyles.phoneMoonIcon}
                        accessibilityElementsHidden
                      >
                        🌙
                      </Text>
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

          {/* CTA */}
          <View style={landingStyles.ctaContainer}>
            <TouchableOpacity
              style={landingStyles.ctaPrimaryGreen}
              onPress={handleWebAppClick}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Essayer Murmure maintenant gratuitement"
            >
              <Text style={landingStyles.ctaPrimaryGreenText}>
                ✨ Essayer maintenant
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={landingStyles.ctaSecondaryOutline}
              onPress={handleDownloadClick}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Télécharger l'application mobile Murmure"
            >
              <Text style={landingStyles.ctaSecondaryOutlineText}>
                📱 Télécharger l&apos;app
              </Text>
            </TouchableOpacity>
          </View>

          {/* Trust */}
          <View style={landingStyles.trustIndicators}>
            <View style={landingStyles.trustItem}>
              <Text style={landingStyles.trustIcon} accessibilityElementsHidden>
                ❤️
              </Text>
              <Text style={landingStyles.trustText}>Gratuit</Text>
            </View>
            <View style={landingStyles.trustItem}>
              <Text style={landingStyles.trustIcon} accessibilityElementsHidden>
                🛡️
              </Text>
              <Text style={landingStyles.trustText}>100% privé</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Why */}
      <View style={[landingStyles.whySection, dynamicBackgrounds.why]}>
        <Text
          style={[landingStyles.sectionTitle, { color: currentTheme.text }]}
          accessibilityRole="header"
        >
          Pourquoi Murmure ?
        </Text>
        <Text
          style={[landingStyles.whyText, { color: currentTheme.textSecondary }]}
        >
          Nous avons tous des choses à écrire, mais parfois, trop d&apos;outils
          tuent la plume. Murmure est né du besoin d&apos;un endroit calme, sans
          bruit, sans jugement, pour simplement… écrire. Un retour à
          l&apos;essentiel de l&apos;écriture introspective, où seuls comptent
          tes mots et tes pensées.
        </Text>
      </View>

      {/* Features */}
      <View
        style={[landingStyles.features, dynamicBackgrounds.features]}
        accessible
        accessibilityLabel="Fonctionnalités de Murmure"
      >
        <Text
          style={[landingStyles.sectionTitle, { color: currentTheme.text }]}
          accessibilityRole="header"
        >
          Fonctionnalités
        </Text>

        <View style={landingStyles.featureGrid}>
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

      {/* FAQ */}
      <View
        style={[landingStyles.faqSection, dynamicBackgrounds.faq]}
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
      <View style={landingStyles.footer}>
        <View style={landingStyles.footerContent}>
          <View style={landingStyles.footerGrid}>
            {/* Col 1 */}
            <View style={landingStyles.footerColumn}>
              <View style={landingStyles.footerLogo}>
                <Text
                  style={[
                    landingStyles.footerLogoIcon,
                    footerDynamicStyles.iconColor,
                  ]}
                  accessibilityElementsHidden
                >
                  🌙
                </Text>
                <Text style={landingStyles.footerLogoText}>Murmure</Text>
              </View>
              <Text style={landingStyles.footerDescription}>
                L&apos;espace minimaliste pour ton écriture introspective.
              </Text>
            </View>

            {/* Col 2 */}
            <View style={landingStyles.footerColumn}>
              <Text style={landingStyles.footerColumnTitle}>Liens utiles</Text>
              <TouchableOpacity
                style={landingStyles.footerLink}
                accessible
                accessibilityRole="link"
                accessibilityLabel="En savoir plus sur Murmure"
                onPress={() => router.push("/about")}
              >
                <Text style={landingStyles.footerLinkText}>À propos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={landingStyles.footerLink}
                accessible
                accessibilityRole="link"
                accessibilityLabel="Politique de confidentialité"
                onPress={() => router.push("/privacy")}
              >
                <Text style={landingStyles.footerLinkText}>
                  Confidentialité
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={landingStyles.footerLink}
                accessible
                accessibilityRole="link"
                accessibilityLabel="Nous contacter"
                onPress={() => router.push("/support")}
              >
                <Text style={landingStyles.footerLinkText}>
                  Contact et Soutenir
                </Text>
              </TouchableOpacity>
            </View>

            {/* Col 3 */}
            <View style={landingStyles.footerColumn}>
              <Text style={landingStyles.footerColumnTitle}>Télécharger</Text>
              <TouchableOpacity
                style={[
                  landingStyles.footerButton,
                  footerDynamicStyles.buttonBackground,
                ]}
                onPress={handleDownloadClick}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Télécharger Murmure sur Google Play"
              >
                <Text style={landingStyles.footerButtonText}>
                  📲 Google Play
                </Text>
              </TouchableOpacity>
            </View>

            {/* Col 4 */}
            <View style={landingStyles.footerColumn}>
              <Text style={landingStyles.footerColumnTitle}>Suivez-nous</Text>
              <View style={landingStyles.socialLinks}>
                <TouchableOpacity
                  style={landingStyles.footerLink}
                  accessible
                  accessibilityRole="link"
                  accessibilityLabel="Suivre Murmure sur Twitter"
                  onPress={() => {
                    if (Platform.OS === "web")
                      window.open("https://twitter.com/MurmureApp", "_blank");
                  }}
                >
                  <Text style={landingStyles.footerLinkText}>Twitter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={landingStyles.footerBottom}>
          <Text style={landingStyles.footerCopyright}>
            © 2025 Murmure. Tous droits réservés.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
});
MurmureLanding.displayName = "MurmureLanding";

export default MurmureLanding;
