import React, { memo, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAdvancedTheme } from "@/hooks/useAdvancedTheme";
import { BuyMeACoffeeButton } from "@/components/BuyMeACoffeeButton";

// Hook pour gérer le SEO sur le web
const useWebSEO = () => {
  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === "web") {
        document.title = "À propos - Murmure | Notre mission et nos valeurs";

        const metaDescription = document.querySelector(
          'meta[name="description"]'
        );
        if (metaDescription) {
          metaDescription.setAttribute(
            "content",
            "Découvrez l'histoire de Murmure, notre mission et nos engagements. Un refuge numérique pour l'écriture introspective, 100% privé et gratuit."
          );
        }
      }
    }, [])
  );
};

// Interface pour les cartes de valeurs
interface ValueCardProps {
  icon: string;
  title: string;
  description: string;
  currentTheme: any;
}

// Composant carte de valeur mémorisé
const ValueCard = memo<ValueCardProps>(
  ({ icon, title, description, currentTheme }) => {
    // ✅ STYLES MÉMORISÉS
    const cardStyle = useMemo(
      () => [styles.valueCard, { backgroundColor: currentTheme.surface }],
      [currentTheme.surface]
    );

    const titleStyle = useMemo(
      () => [styles.valueTitle, { color: currentTheme.text }],
      [currentTheme.text]
    );

    const descriptionStyle = useMemo(
      () => [styles.valueDescription, { color: currentTheme.textSecondary }],
      [currentTheme.textSecondary]
    );

    return (
      <View style={cardStyle}>
        <View style={styles.valueHeader}>
          <Text style={styles.valueIcon} accessibilityElementsHidden={true}>
            {icon}
          </Text>
          <Text style={titleStyle}>{title}</Text>
        </View>
        <Text style={descriptionStyle}>{description}</Text>
      </View>
    );
  },
  (prevProps, nextProps) => {
    // ✅ COMPARAISON CUSTOM
    return (
      prevProps.icon === nextProps.icon &&
      prevProps.title === nextProps.title &&
      prevProps.description === nextProps.description &&
      prevProps.currentTheme === nextProps.currentTheme
    );
  }
);

ValueCard.displayName = "ValueCard";

// Composant principal optimisé
const AboutPage = memo(() => {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const { currentTheme } = useAdvancedTheme();

  // Hook SEO
  useWebSEO();

  // Callbacks mémorisés
  const handleTryApp = useCallback(() => {
    router.push("/app");
  }, [router]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  // Styles dynamiques mémorisés
  const dynamicStyles = useMemo(
    () => ({
      container: { backgroundColor: currentTheme.background },
      heroBackground: { backgroundColor: `${currentTheme.accent}10` },
      ctaButton: { backgroundColor: currentTheme.accent },
      backButton: {
        backgroundColor: "transparent",
        borderColor: currentTheme.textSecondary,
        borderWidth: 1,
      },
    }),
    [currentTheme]
  );

  // Données des valeurs mémorisées
  const valuesData = useMemo(
    () => [
      {
        icon: "🔐",
        title: "100% privé",
        description:
          "Tes textes restent sur ton appareil. Aucune donnée n'est transmise à nos serveurs ou à des tiers.",
      },
      {
        icon: "💸",
        title: "Gratuit",
        description:
          "L'écriture introspective ne devrait pas avoir de prix. Murmure restera toujours gratuite.",
      },
      {
        icon: "🎨",
        title: "Minimaliste",
        description:
          "Une interface épurée, sans distraction, pour te concentrer sur l'essentiel : tes mots.",
      },
      {
        icon: "🌱",
        title: "Bienveillant",
        description:
          "Un espace sans jugement où tu peux explorer tes pensées en toute liberté.",
      },
    ],
    []
  );

  const isWideScreen = width > 768;

  return (
    <ScrollView
      style={[styles.container, dynamicStyles.container]}
      removeClippedSubviews={true}
      showsVerticalScrollIndicator={true}
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
            À propos de{" "}
            <Text
              style={[styles.heroTitleAccent, { color: currentTheme.accent }]}
            >
              Murmure
            </Text>
          </Text>
          <Text
            style={[styles.heroSubtitle, { color: currentTheme.textSecondary }]}
          >
            Un refuge numérique pour tes pensées les plus intimes
          </Text>
        </View>
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Story Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Notre histoire
          </Text>
          <View
            style={[styles.card, { backgroundColor: currentTheme.surface }]}
          >
            <Text
              style={[styles.paragraph, { color: currentTheme.textSecondary }]}
            >
              Murmure est né d&apos;un besoin simple : un espace calme pour
              écrire librement. Un lieu sans filtres, sans attentes, sans likes.
              Juste toi, tes mots, et le silence.
            </Text>
            <Text
              style={[styles.paragraph, { color: currentTheme.textSecondary }]}
            >
              Dans un monde où chaque pensée devient contenu, où chaque émotion
              se transforme en post, nous avons voulu créer quelque chose de
              différent. Un endroit où tes mots n&apos;appartiennent qu&apos;à
              toi.
            </Text>
          </View>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Notre mission
          </Text>
          <View
            style={[styles.card, { backgroundColor: currentTheme.surface }]}
          >
            <Text
              style={[styles.paragraph, { color: currentTheme.textSecondary }]}
            >
              Offrir un refuge numérique aux personnes qui veulent se
              reconnecter à elles-mêmes par l&apos;écriture. Dans un monde
              bruyant, Murmure t&apos;aide à faire le tri dans tes pensées.
            </Text>
            <Text
              style={[styles.paragraph, { color: currentTheme.textSecondary }]}
            >
              Nous croyons que l&apos;écriture introspective est un acte de
              bienveillance envers soi-même. C&apos;est pourquoi nous avons créé
              un outil simple, accessible et respectueux de ton intimité.
            </Text>
          </View>
        </View>

        {/* Values Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Nos engagements
          </Text>
          <View
            style={[
              styles.valuesGrid,
              { flexDirection: isWideScreen ? "row" : "column" },
            ]}
          >
            {valuesData.map((value, index) => (
              <ValueCard
                key={`value-${index}`}
                icon={value.icon}
                title={value.title}
                description={value.description}
                currentTheme={currentTheme}
              />
            ))}
          </View>
        </View>

        {/* Philosophy Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Pourquoi Murmure ?
          </Text>
          <View
            style={[
              styles.card,
              styles.philosophyCard,
              { backgroundColor: `${currentTheme.accent}15` },
            ]}
          >
            <View style={styles.quoteContainer}>
              <Text style={[styles.quoteText, { color: currentTheme.text }]}>
                Parce que ce que tu écris ici n&apos;est pas destiné à être
                crié.
              </Text>
            </View>
            <Text
              style={[styles.paragraph, { color: currentTheme.textSecondary }]}
            >
              C&apos;est un murmure. Un mot que l&apos;on dit à soi-même, ou à
              quelqu&apos;un de très proche. Un acte intime. Une confidence que
              l&apos;on se fait dans le silence de ses pensées.
            </Text>
            <Text
              style={[styles.paragraph, { color: currentTheme.textSecondary }]}
            >
              Dans un monde où tout crie, nous avons choisi de chuchoter. Car
              les mots les plus vrais sont souvent ceux qu&apos;on prononce tout
              bas.
            </Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={[styles.ctaTitle, { color: currentTheme.text }]}>
            Prêt à commencer ton voyage d&apos;écriture ?
          </Text>
          <Text
            style={[styles.ctaSubtitle, { color: currentTheme.textSecondary }]}
          >
            Rejoins la communauté Murmure et redécouvre le plaisir d&apos;écrire
            pour toi.
          </Text>

          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={[styles.ctaButton, dynamicStyles.ctaButton]}
              onPress={handleTryApp}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Commencer à utiliser Murmure maintenant"
            >
              <Text style={styles.ctaText}>Essayer maintenant</Text>
            </TouchableOpacity>
            
            <BuyMeACoffeeButton size="large" style={{ minWidth: 280 }} />

            <TouchableOpacity
              style={[styles.ctaSecondary, dynamicStyles.backButton]}
              onPress={handleGoBack}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Retour à l'accueil"
            >
              <Text
                style={[
                  styles.ctaSecondaryText,
                  { color: currentTheme.textSecondary },
                ]}
              >
                Retour à l&apos;accueil
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
});

AboutPage.displayName = "AboutPage";

export default AboutPage;

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
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 80,
    maxWidth: 1000,
    alignSelf: "center",
    width: "100%",
  },
  section: {
    marginBottom: 64,
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
  card: {
    padding: 32,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      web: "'Crimson Text', Georgia, serif",
    }),
  },
  valuesGrid: {
    flexWrap: "wrap",
    gap: 16,
  },
  valueCard: {
    flex: Platform.OS === "web" ? 1 : undefined,
    minWidth: Platform.OS === "web" ? 280 : "100%",
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  valueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  valueIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  valueDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
  philosophyCard: {
    position: "relative",
  },
  quoteContainer: {
    marginBottom: 20,
  },
  quoteText: {
    fontSize: 20,
    fontStyle: "italic",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 28,
    fontFamily: Platform.select({
      ios: "Palatino",
      android: "serif",
      web: "'Crimson Text', serif",
    }),
  },
  teamValues: {
    marginTop: 20,
  },
  teamValue: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  statsContainer: {
    gap: 16,
  },
  statCard: {
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
  statNumber: {
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  ctaSection: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: "Palatino",
      android: "serif",
      web: "'Crimson Text', serif",
    }),
  },
  ctaSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    maxWidth: 500,
    lineHeight: 24,
  },
  ctaButtons: {
    alignItems: "center",
    gap: 16,
  },
  ctaButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 280,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  ctaSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
  },
  ctaSecondaryText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
