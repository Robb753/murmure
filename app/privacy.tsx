import React, { memo, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Dimensions,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";

// Hook pour gérer le SEO sur le web
const useWebSEO = () => {
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === "web") {
        document.title =
          "Confidentialité - Murmure | Politique de confidentialité";

        const metaDescription = document.querySelector(
          'meta[name="description"]'
        );
        if (metaDescription) {
          metaDescription.setAttribute(
            "content",
            "Notre politique de confidentialité : aucune donnée collectée, stockage 100% local, pas de publicité. Découvrez nos engagements pour votre vie privée."
          );
        }
      }
    }, [])
  );
};

// Interface pour les sections de politique
interface PolicySectionProps {
  icon: string;
  title: string;
  content: string;
  highlight?: string;
  currentTheme: any;
}

// Composant section de politique mémorisé
const PolicySection = memo<PolicySectionProps>(
  ({ icon, title, content, highlight, currentTheme }) => (
    <View
      style={[styles.policyCard, { backgroundColor: currentTheme.surface }]}
    >
      <View style={styles.policyHeader}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${currentTheme.accent}15` },
          ]}
        >
          <Text style={styles.policyIcon} accessibilityElementsHidden={true}>
            {icon}
          </Text>
        </View>
        <Text style={[styles.policyTitle, { color: currentTheme.text }]}>
          {title}
        </Text>
      </View>
      <Text
        style={[styles.policyContent, { color: currentTheme.textSecondary }]}
      >
        {content}
      </Text>
      {highlight && (
        <View
          style={[
            styles.highlightBox,
            { backgroundColor: `${currentTheme.accent}10` },
          ]}
        >
          <Text style={[styles.highlightText, { color: currentTheme.accent }]}>
            💡 {highlight}
          </Text>
        </View>
      )}
    </View>
  )
);

PolicySection.displayName = "PolicySection";

// Composant principal optimisé
const PrivacyPolicy = memo(() => {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const { currentTheme } = useAdvancedTheme();

  // Hook SEO
  useWebSEO();

  // Callbacks mémorisés
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleContactEmail = useCallback(async () => {
    const email = "contact@murmure.app";
    const subject = "Question concernant la confidentialité";
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback pour le web
        if (Platform.OS === "web") {
          window.location.href = url;
        }
      }
    } catch (error) {
      console.log("Erreur lors de l'ouverture du client email:", error);
    }
  }, []);

  // Styles dynamiques mémorisés
  const dynamicStyles = useMemo(
    () => ({
      container: { backgroundColor: currentTheme.background },
      heroBackground: { backgroundColor: `${currentTheme.accent}10` },
      backButton: {
        backgroundColor: "transparent",
        borderColor: currentTheme.textSecondary,
        borderWidth: 1,
      },
    }),
    [currentTheme]
  );

  // Données des sections de politique mémorisées
  const policyData = useMemo(
    () => [
      {
        icon: "🔒",
        title: "Aucune donnée collectée",
        content:
          "Tous tes textes sont stockés localement sur ton appareil. Ils ne sont ni envoyés à des serveurs, ni partagés avec des tiers. Nous n'avons littéralement aucun accès à ce que tu écris.",
        highlight: "Tes mots restent sur ton appareil, point final.",
      },
      {
        icon: "🚫",
        title: "Pas de compte, pas de traqueurs",
        content:
          "Murmure ne nécessite pas de création de compte. Nous n'utilisons ni cookies publicitaires, ni outils d'analyse invasifs, ni pixels de suivi. Ton utilisation de l'app reste anonyme.",
        highlight: "Utilise Murmure sans créer de compte, en toute liberté.",
      },
      {
        icon: "📤",
        title: "Export libre de tes données",
        content:
          "Tu peux exporter tes écrits à tout moment au format TXT ou PDF. Tu es seul·e propriétaire de ce que tu écris. Aucune restriction, aucune condition.",
        highlight:
          "Tes textes t'appartiennent, tu peux les récupérer quand tu veux.",
      },
      {
        icon: "🚭",
        title: "Aucune publicité",
        content:
          "Murmure est 100% sans publicité. L'objectif est de préserver un espace calme, non commercial, sans distraction. Nous ne vendons pas ton attention.",
        highlight:
          "Un espace pur, sans tentative de monétisation de tes données.",
      },
      {
        icon: "🌐",
        title: "Données techniques minimales",
        content:
          "Seules les données techniques essentielles au fonctionnement de l'app sont traitées localement (préférences d'interface, thèmes choisis). Rien n'est transmis à l'extérieur.",
        highlight: "Même les réglages restent sur ton appareil.",
      },
      {
        icon: "🔄",
        title: "Mises à jour transparentes",
        content:
          "Si cette politique évolue, nous t'en informerons clairement. Nous nous engageons à maintenir ces standards de confidentialité élevés.",
        highlight: "Nos principes ne changeront pas : ta vie privée d'abord.",
      },
    ],
    []
  );

  const lastUpdated = "Dernière mise à jour : 04 Aout 2025";
  const isWideScreen = width > 768;

  return (
    <ScrollView
      style={[styles.container, dynamicStyles.container]}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {/* Header avec navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, dynamicStyles.backButton]}
          onPress={handleGoBack}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Retour à la page précédente"
        >
          <Text
            style={[
              styles.backButtonText,
              { color: currentTheme.textSecondary },
            ]}
          >
            ← Retour
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={[styles.heroSection, dynamicStyles.heroBackground]}>
        <View style={styles.heroContent}>
          <Text
            style={[styles.heroTitle, { color: currentTheme.text }]}
            accessibilityRole="header"
          >
            Politique de{" "}
            <Text
              style={[styles.heroTitleAccent, { color: currentTheme.accent }]}
            >
              confidentialité
            </Text>
          </Text>
          <Text
            style={[styles.heroSubtitle, { color: currentTheme.textSecondary }]}
          >
            Transparence totale sur la protection de ta vie privée
          </Text>
          <Text
            style={[styles.lastUpdated, { color: currentTheme.textSecondary }]}
          >
            {lastUpdated}
          </Text>
        </View>
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Introduction */}
        <View style={styles.section}>
          <View
            style={[
              styles.introCard,
              { backgroundColor: `${currentTheme.accent}08` },
            ]}
          >
            <Text style={[styles.introText, { color: currentTheme.text }]}>
              Chez Murmure, nous croyons à un numérique plus respectueux.
            </Text>
            <Text
              style={[
                styles.introSubtext,
                { color: currentTheme.textSecondary },
              ]}
            >
              Notre approche est simple : ce que tu écris te regarde. Point
              final. Voici nos engagements concrets pour protéger ta vie privée.
            </Text>
          </View>
        </View>

        {/* Résumé visuel */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            En résumé
          </Text>
          <View
            style={[
              styles.summaryContainer,
              { flexDirection: isWideScreen ? "row" : "column" },
            ]}
          >
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: currentTheme.surface },
              ]}
            >
              <Text
                style={[styles.summaryNumber, { color: currentTheme.accent }]}
              >
                0
              </Text>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: currentTheme.textSecondary },
                ]}
              >
                Données collectées
              </Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: currentTheme.surface },
              ]}
            >
              <Text
                style={[styles.summaryNumber, { color: currentTheme.accent }]}
              >
                100%
              </Text>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: currentTheme.textSecondary },
                ]}
              >
                Stockage local
              </Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: currentTheme.surface },
              ]}
            >
              <Text
                style={[styles.summaryNumber, { color: currentTheme.accent }]}
              >
                0
              </Text>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: currentTheme.textSecondary },
                ]}
              >
                Publicité
              </Text>
            </View>
          </View>
        </View>

        {/* Sections de politique */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Nos engagements détaillés
          </Text>

          {policyData.map((policy, index) => (
            <PolicySection
              key={`policy-${index}`}
              icon={policy.icon}
              title={policy.title}
              content={policy.content}
              highlight={policy.highlight}
              currentTheme={currentTheme}
            />
          ))}
        </View>

        {/* Section comparaison */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Murmure vs autres apps
          </Text>
          <View
            style={[
              styles.comparisonCard,
              { backgroundColor: currentTheme.surface },
            ]}
          >
            <View style={styles.comparisonRow}>
              <Text
                style={[
                  styles.comparisonLabel,
                  { color: currentTheme.textSecondary },
                ]}
              >
                Collecte de données
              </Text>
              <View style={styles.comparisonValue}>
                <Text
                  style={[
                    styles.comparisonMurmure,
                    { color: currentTheme.accent },
                  ]}
                >
                  Murmure: ❌ Aucune
                </Text>
                <Text style={[styles.comparisonOthers, { color: "#ef4444" }]}>
                  Autres: ✅ Toutes
                </Text>
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text
                style={[
                  styles.comparisonLabel,
                  { color: currentTheme.textSecondary },
                ]}
              >
                Création de compte
              </Text>
              <View style={styles.comparisonValue}>
                <Text
                  style={[
                    styles.comparisonMurmure,
                    { color: currentTheme.accent },
                  ]}
                >
                  Murmure: ❌ Pas besoin
                </Text>
                <Text style={[styles.comparisonOthers, { color: "#ef4444" }]}>
                  Autres: ✅ Obligatoire
                </Text>
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <Text
                style={[
                  styles.comparisonLabel,
                  { color: currentTheme.textSecondary },
                ]}
              >
                Publicité
              </Text>
              <View style={styles.comparisonValue}>
                <Text
                  style={[
                    styles.comparisonMurmure,
                    { color: currentTheme.accent },
                  ]}
                >
                  Murmure: ❌ Jamais
                </Text>
                <Text style={[styles.comparisonOthers, { color: "#ef4444" }]}>
                  Autres: ✅ Partout
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section légale */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Aspects légaux
          </Text>
          <View
            style={[
              styles.legalCard,
              { backgroundColor: currentTheme.surface },
            ]}
          >
            <Text
              style={[styles.legalText, { color: currentTheme.textSecondary }]}
            >
              Cette politique est conforme au RGPD européen et aux lois
              françaises sur la protection des données. Cependant, comme nous ne
              collectons aucune donnée personnelle, la plupart des articles ne
              s&apos;appliquent même pas à Murmure.
            </Text>
            <Text
              style={[styles.legalHighlight, { color: currentTheme.accent }]}
            >
              💡 En fait, nous sommes probablement l&apos;une des rares apps à
              ne pas avoir besoin de politique RGPD !
            </Text>
          </View>
        </View>

        {/* Contact et support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Questions ou préoccupations ?
          </Text>
          <View
            style={[
              styles.contactCard,
              { backgroundColor: `${currentTheme.accent}08` },
            ]}
          >
            <Text
              style={[
                styles.contactText,
                { color: currentTheme.textSecondary },
              ]}
            >
              Tu as une question sur cette politique ou sur la protection de tes
              données ? Nous sommes là pour t&apos;aider et répondre en toute
              transparence.
            </Text>

            <TouchableOpacity
              style={[
                styles.contactButton,
                { backgroundColor: currentTheme.accent },
              ]}
              onPress={handleContactEmail}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Nous contacter par email"
            >
              <Text style={styles.contactButtonText}>📧 Nous contacter</Text>
            </TouchableOpacity>

            <Text
              style={[styles.emailText, { color: currentTheme.textSecondary }]}
            >
              contact@murmure.app
            </Text>
          </View>
        </View>

        {/* Footer avec engagement */}
        <View style={styles.footerSection}>
          <View
            style={[
              styles.pledgeCard,
              { backgroundColor: `${currentTheme.accent}15` },
            ]}
          >
            <Text style={[styles.pledgeTitle, { color: currentTheme.text }]}>
              Notre engagement
            </Text>
            <Text
              style={[styles.pledgeText, { color: currentTheme.textSecondary }]}
            >
              Nous nous engageons à maintenir ces standards de confidentialité
              élevés. Murmure restera toujours un espace privé, sans compromis
              sur ta vie privée.
            </Text>
            <Text
              style={[styles.pledgeSignature, { color: currentTheme.accent }]}
            >
              — L&apos;équipe Murmure
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
});

PrivacyPolicy.displayName = "PrivacyPolicy";

export default PrivacyPolicy;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "web" ? 40 : 60,
    paddingBottom: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  heroSection: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  heroContent: {
    maxWidth: 800,
    alignSelf: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: Platform.OS === "web" ? 48 : 36,
    fontWeight: "700",
    fontFamily: Platform.select({
      ios: "Palatino",
      android: "serif",
      web: "'Crimson Text', 'Palatino Linotype', serif",
    }),
    textAlign: "center",
    marginBottom: 16,
  },
  heroTitleAccent: {
    fontStyle: "italic",
  },
  heroSubtitle: {
    fontSize: Platform.OS === "web" ? 20 : 18,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "300",
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 14,
    fontStyle: "italic",
    opacity: 0.8,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 80,
    maxWidth: 1000,
    alignSelf: "center",
    width: "100%",
  },
  section: {
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: Platform.select({
      ios: "Palatino",
      android: "serif",
      web: "'Crimson Text', serif",
    }),
    marginBottom: 24,
  },
  introCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  introText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: "Palatino",
      android: "serif",
      web: "'Crimson Text', serif",
    }),
  },
  introSubtext: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  summaryContainer: {
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  policyCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  policyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  policyIcon: {
    fontSize: 24,
  },
  policyTitle: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
  },
  policyContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  highlightBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  highlightText: {
    fontSize: 14,
    fontWeight: "500",
    fontStyle: "italic",
  },
  comparisonCard: {
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  comparisonLabel: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  comparisonValue: {
    alignItems: "flex-end",
  },
  comparisonMurmure: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  comparisonOthers: {
    fontSize: 14,
    opacity: 0.7,
  },
  legalCard: {
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  legalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  legalHighlight: {
    fontSize: 16,
    fontWeight: "500",
    fontStyle: "italic",
  },
  contactCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  contactText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  contactButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 16,
  },
  contactButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emailText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footerSection: {
    marginTop: 40,
  },
  pledgeCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  pledgeTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: "Palatino",
      android: "serif",
      web: "'Crimson Text', serif",
    }),
  },
  pledgeText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  pledgeSignature: {
    fontSize: 16,
    fontWeight: "500",
    fontStyle: "italic",
  },
});
