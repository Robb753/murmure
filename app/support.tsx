import React, { memo, useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
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
          "Contact & Support - Murmure | Nous contacter et soutenir le projet";

        const metaDescription = document.querySelector(
          'meta[name="description"]'
        );
        if (metaDescription) {
          metaDescription.setAttribute(
            "content",
            "Contactez l'équipe Murmure pour vos questions ou suggestions. Découvrez comment soutenir ce projet indépendant et sans publicité."
          );
        }
      }
    }, [])
  );
};

// Interface pour les cartes de contact
interface ContactCardProps {
  icon: string;
  title: string;
  description: string;
  actionText: string;
  actionUrl: string;
  actionType: "email" | "web";
  currentTheme: any;
  highlight?: boolean;
}

// Composant carte de contact mémorisé
const ContactCard = memo<ContactCardProps>(
  ({
    icon,
    title,
    description,
    actionText,
    actionUrl,
    actionType,
    currentTheme,
    highlight = false,
  }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handlePress = useCallback(async () => {
      try {
        if (actionType === "email") {
          const subject = "Contact depuis l'app Murmure";
          const url = `mailto:${actionUrl}?subject=${encodeURIComponent(
            subject
          )}`;
          const supported = await Linking.canOpenURL(url);

          if (supported) {
            await Linking.openURL(url);
          } else if (Platform.OS === "web") {
            window.location.href = url;
          }
        } else {
          const supported = await Linking.canOpenURL(actionUrl);
          if (supported) {
            await Linking.openURL(actionUrl);
          } else if (Platform.OS === "web") {
            window.open(actionUrl, "_blank");
          }
        }
      } catch (error) {
        console.log("Erreur lors de l'ouverture du lien:", error);
        if (Platform.OS !== "web") {
          Alert.alert(
            "Erreur",
            "Impossible d'ouvrir le lien. Veuillez réessayer.",
            [{ text: "OK" }]
          );
        }
      }
    }, [actionUrl, actionType]);

    return (
      <TouchableOpacity
        style={[
          styles.contactCard,
          {
            backgroundColor: highlight
              ? `${currentTheme.accent}08`
              : currentTheme.surface,
            borderColor: highlight ? currentTheme.accent : "transparent",
            borderWidth: highlight ? 2 : 0,
            transform: [{ scale: isPressed ? 0.98 : 1 }],
          },
        ]}
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${description}`}
      >
        <View
          style={[
            styles.cardIcon,
            { backgroundColor: `${currentTheme.accent}15` },
          ]}
        >
          <Text style={styles.iconText} accessibilityElementsHidden={true}>
            {icon}
          </Text>
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: currentTheme.text }]}>
            {title}
          </Text>
          <Text
            style={[
              styles.cardDescription,
              { color: currentTheme.textSecondary },
            ]}
          >
            {description}
          </Text>
          <View
            style={[
              styles.actionButton,
              { backgroundColor: currentTheme.accent },
            ]}
          >
            <Text style={styles.actionButtonText}>{actionText}</Text>
          </View>
        </View>

        {highlight && (
          <View
            style={[
              styles.highlightBadge,
              { backgroundColor: currentTheme.accent },
            ]}
          >
            <Text style={styles.highlightText}>Recommandé</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

ContactCard.displayName = "ContactCard";

// Interface pour les FAQ
interface FAQItemProps {
  question: string;
  answer: string;
  currentTheme: any;
}

const FAQItem = memo<FAQItemProps>(({ question, answer, currentTheme }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <View style={[styles.faqItem, { backgroundColor: currentTheme.surface }]}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={toggleOpen}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`FAQ: ${question}. ${isOpen ? "Ouvert" : "Fermé"}`}
      >
        <Text style={[styles.faqQuestionText, { color: currentTheme.text }]}>
          {question}
        </Text>
        <Text style={[styles.faqIcon, { color: currentTheme.accent }]}>
          {isOpen ? "−" : "+"}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <Text style={[styles.faqAnswer, { color: currentTheme.textSecondary }]}>
          {answer}
        </Text>
      )}
    </View>
  );
});

FAQItem.displayName = "FAQItem";

// Composant principal optimisé
const SupportAndContact = memo(() => {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const { currentTheme } = useAdvancedTheme();

  // Hook SEO
  useWebSEO();

  // Callbacks mémorisés
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

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

  // Données des contacts mémorisées
  const contactData = useMemo(
    () => [
      {
        icon: "📧",
        title: "Email direct",
        description:
          "Questions, bugs, suggestions ? Écris-moi librement, je réponds personnellement à chaque message.",
        actionText: "Envoyer un email",
        actionUrl: "contact@murmure.app",
        actionType: "email" as const,
        highlight: true,
      },
      {
        icon: "☕",
        title: "Soutenir le projet",
        description:
          "Tu aimes Murmure ? Offre-moi un café virtuel pour m'aider à continuer le développement.",
        actionText: "Buy me a coffee",
        actionUrl: "https://www.buymeacoffee.com/murmureapp",
        actionType: "web" as const,
        highlight: false,
      },
      {
        icon: "🐦",
        title: "Suivre les news",
        description:
          "Reste au courant des nouvelles fonctionnalités et mises à jour de Murmure.",
        actionText: "Suivre sur Twitter",
        actionUrl: "https://twitter.com/murmureapp",
        actionType: "web" as const,
        highlight: false,
      },
      {
        icon: "⭐",
        title: "Noter l'app",
        description:
          "Aide d'autres personnes à découvrir Murmure en laissant un avis sur le store.",
        actionText: "Laisser un avis",
        actionUrl:
          "https://play.google.com/store/apps/details?id=com.yourname.murmure",
        actionType: "web" as const,
        highlight: false,
      },
    ],
    []
  );

  // FAQ data mémorisée
  const faqData = useMemo(
    () => [
      {
        question: "Combien de temps pour avoir une réponse ?",
        answer:
          "Je réponds généralement dans les 24-48h. Si c'est urgent (bug critique), je fais de mon mieux pour répondre le jour même.",
      },
      {
        question: "Puis-je proposer de nouvelles fonctionnalités ?",
        answer:
          "Absolument ! J'adore recevoir des suggestions. Décris-moi ton idée et pourquoi elle t'aiderait dans ton écriture.",
      },
      {
        question: "Comment signaler un bug ?",
        answer:
          "Envoie-moi un email avec : ton type d'appareil, la version de l'app, et décris ce qui ne fonctionne pas. Captures d'écran bienvenues !",
      },
      {
        question: "Murmure va-t-elle rester gratuite ?",
        answer:
          "Oui, à 100% ! C'est un engagement ferme. Les dons sont uniquement pour soutenir le développement, jamais obligatoires.",
      },
    ],
    []
  );

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
            Contact &{" "}
            <Text
              style={[styles.heroTitleAccent, { color: currentTheme.accent }]}
            >
              Support
            </Text>
          </Text>
          <Text
            style={[styles.heroSubtitle, { color: currentTheme.textSecondary }]}
          >
            Un projet indépendant porté par la passion de l&apos;écriture
          </Text>
        </View>
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Contact Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Comment me contacter
          </Text>

          <View
            style={[
              styles.contactGrid,
              { flexDirection: isWideScreen ? "row" : "column" },
            ]}
          >
            {contactData.map((contact, index) => (
              <ContactCard
                key={`contact-${index}`}
                icon={contact.icon}
                title={contact.title}
                description={contact.description}
                actionText={contact.actionText}
                actionUrl={contact.actionUrl}
                actionType={contact.actionType}
                currentTheme={currentTheme}
                highlight={contact.highlight}
              />
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Questions fréquentes
          </Text>

          <View style={styles.faqContainer}>
            {faqData.map((faq, index) => (
              <FAQItem
                key={`faq-${index}`}
                question={faq.question}
                answer={faq.answer}
                currentTheme={currentTheme}
              />
            ))}
          </View>
        </View>

        {/* Philosophy Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
            Ma philosophie
          </Text>
          <View
            style={[
              styles.philosophyCard,
              { backgroundColor: `${currentTheme.accent}08` },
            ]}
          >
            <Text
              style={[styles.philosophyQuote, { color: currentTheme.text }]}
            >
              Chaque utilisateur compte, chaque retour est précieux.
            </Text>
            <Text
              style={[
                styles.philosophyText,
                { color: currentTheme.textSecondary },
              ]}
            >
              Murmure n&apos;est pas juste une app, c&apos;est un projet humain.
              Je développe dans le calme, à l&apos;écoute de ceux qui utilisent
              l&apos;outil. Pas de métriques de croissance, pas de course au
              profit. Juste l&apos;envie de créer quelque chose d&apos;utile et
              de beau.
            </Text>
            <Text
              style={[
                styles.philosophyText,
                { color: currentTheme.textSecondary },
              ]}
            >
              Ton message ne sera jamais un numéro dans une file d&apos;attente.
              C&apos;est une conversation entre humains passionnés
              d&apos;écriture.
            </Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={[styles.ctaTitle, { color: currentTheme.text }]}>
            Une question ? Une idée ?
          </Text>
          <Text
            style={[styles.ctaSubtitle, { color: currentTheme.textSecondary }]}
          >
            N&apos;hésite pas à me contacter. Chaque message m&apos;aide à
            améliorer Murmure.
          </Text>

          <View style={styles.ctaButtons}>
            <TouchableOpacity
              style={[
                styles.ctaButton,
                { backgroundColor: currentTheme.accent },
              ]}
              onPress={() =>
                Linking.openURL(
                  "mailto:contact@murmure.app?subject=Question depuis l'app Murmure"
                )
              }
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Envoyer un email de contact"
            >
              <Text style={styles.ctaText}>📧 M&apos;écrire maintenant</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.ctaSecondary,
                { borderColor: currentTheme.textSecondary },
              ]}
              onPress={handleGoBack}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Retour à l'application"
            >
              <Text
                style={[
                  styles.ctaSecondaryText,
                  { color: currentTheme.textSecondary },
                ]}
              >
                Retour à l&apos;app
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
});

SupportAndContact.displayName = "SupportAndContact";

export default SupportAndContact;

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  introText: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 16,
  },
  introDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  introSignature: {
    fontSize: 16,
    fontWeight: "500",
    fontStyle: "italic",
  },
  contactGrid: {
    gap: 16,
    flexWrap: "wrap",
  },
  contactCard: {
    flex: Platform.OS === "web" ? 1 : undefined,
    minWidth: Platform.OS === "web" ? 280 : "100%",
    padding: 24,
    borderRadius: 16,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  highlightBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  highlightText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
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
  faqContainer: {
    gap: 12,
  },
  faqItem: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 16,
  },
  faqIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  philosophyCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  philosophyQuote: {
    fontSize: 22,
    fontWeight: "600",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: Platform.select({
      ios: "Palatino",
      android: "serif",
      web: "'Crimson Text', serif",
    }),
  },
  philosophyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },
  supportCard: {
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  supportItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  supportIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 32,
  },
  supportText: {
    fontSize: 16,
    flex: 1,
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
    borderWidth: 1,
    minWidth: 200,
    alignItems: "center",
  },
  ctaSecondaryText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
