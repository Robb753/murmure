// components/TextSettings.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";

interface TextSettingsProps {
  visible: boolean;
  onClose: () => void;
  currentTheme: any;
  textOptions: {
    autoLowercase: boolean;
    preserveAcronyms: boolean;
    preserveStartOfSentence: boolean;
    preserveProperNouns: boolean;
  };
  onToggleOption: (option: keyof TextSettingsProps["textOptions"]) => void;
  onApplyProcessing: () => void;
  getTextStats: () => {
    originalLength: number;
    processedLength: number;
    uppercaseRemoved: number;
    uppercasePreserved: number;
    processingRate: number;
  };
}

export const TextSettings: React.FC<TextSettingsProps> = ({
  visible,
  onClose,
  currentTheme,
  textOptions,
  onToggleOption,
  onApplyProcessing,
  getTextStats,
}) => {
  const stats = getTextStats();

  const settingOptions = [
    {
      key: "autoLowercase" as const,
      title: "suppression automatique des majuscules",
      description: "convertit automatiquement les majuscules en minuscules",
      icon: "🔤",
      primary: true,
    },
    {
      key: "preserveAcronyms" as const,
      title: "préserver les acronymes",
      description: "garde les urls, emails et acronymes en majuscules",
      icon: "🔗",
      primary: false,
    },
    {
      key: "preserveStartOfSentence" as const,
      title: "préserver le début de phrase",
      description: "garde la première lettre après un point en majuscule",
      icon: "📝",
      primary: false,
    },
    {
      key: "preserveProperNouns" as const,
      title: "préserver les noms propres",
      description: "garde certains noms propres en majuscules",
      icon: "🏛️",
      primary: false,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[styles.container, { backgroundColor: currentTheme.background }]}
      >
        {/* Header */}
        <View
          style={[styles.header, { borderBottomColor: currentTheme.border }]}
        >
          <Text style={[styles.title, { color: currentTheme.text }]}>
            paramètres de texte
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text
              style={[styles.closeButtonText, { color: currentTheme.text }]}
            >
              ✕
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Statistiques */}
          {stats.uppercaseRemoved > 0 && (
            <View
              style={[
                styles.statsContainer,
                {
                  backgroundColor: currentTheme.surface,
                  borderColor: currentTheme.border,
                },
              ]}
            >
              <Text style={[styles.statsTitle, { color: currentTheme.text }]}>
                📊 statistiques du traitement
              </Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text
                    style={[styles.statValue, { color: currentTheme.accent }]}
                  >
                    {stats.uppercaseRemoved}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: currentTheme.textSecondary },
                    ]}
                  >
                    majuscules supprimées
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text
                    style={[styles.statValue, { color: currentTheme.accent }]}
                  >
                    {stats.uppercasePreserved}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: currentTheme.textSecondary },
                    ]}
                  >
                    majuscules préservées
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text
                    style={[styles.statValue, { color: currentTheme.accent }]}
                  >
                    {stats.processingRate.toFixed(0)}%
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: currentTheme.textSecondary },
                    ]}
                  >
                    taux de traitement
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Options de traitement */}
          <View style={styles.optionsContainer}>
            <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>
              options de traitement
            </Text>

            {settingOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                onPress={() => onToggleOption(option.key)}
                style={[
                  styles.optionItem,
                  {
                    backgroundColor: textOptions[option.key]
                      ? currentTheme.accent + "20"
                      : currentTheme.surface,
                    borderColor: textOptions[option.key]
                      ? currentTheme.accent
                      : currentTheme.border,
                  },
                ]}
              >
                <View style={styles.optionLeft}>
                  <Text style={styles.optionIcon}>{option.icon}</Text>
                  <View style={styles.optionTexts}>
                    <Text
                      style={[
                        styles.optionTitle,
                        {
                          color: textOptions[option.key]
                            ? currentTheme.accent
                            : currentTheme.text,
                          fontWeight: option.primary ? "600" : "500",
                        },
                      ]}
                    >
                      {option.title}
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        { color: currentTheme.textSecondary },
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.toggle,
                    {
                      backgroundColor: textOptions[option.key]
                        ? currentTheme.accent
                        : currentTheme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      {
                        alignSelf: textOptions[option.key]
                          ? "flex-end"
                          : "flex-start",
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action d'application */}
          {!textOptions.autoLowercase && (
            <View style={styles.actionContainer}>
              <TouchableOpacity
                onPress={onApplyProcessing}
                style={[
                  styles.applyButton,
                  { backgroundColor: currentTheme.accent },
                ]}
              >
                <Text style={styles.applyButtonText}>
                  🔄 appliquer le traitement au texte actuel
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Informations */}
          <View style={styles.infoContainer}>
            <Text style={[styles.infoTitle, { color: currentTheme.text }]}>
              💡 à propos de l écriture libre
            </Text>
            <Text
              style={[styles.infoText, { color: currentTheme.textSecondary }]}
            >
              la suppression des majuscules aide à libérer votre écriture en
              éliminant une contrainte de forme. cela vous permet de vous
              concentrer uniquement sur vos idées sans vous soucier de la
              correction typographique.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "300",
  },
  content: {
    flex: 1,
    padding: 20,
  },

  // Statistiques
  statsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },

  // Options
  optionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionTexts: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
  },

  // Action
  actionContainer: {
    marginBottom: 24,
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },

  // Informations
  infoContainer: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
