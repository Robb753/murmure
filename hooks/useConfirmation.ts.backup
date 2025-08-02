import { useCallback, useMemo } from "react";
import { Alert, Platform } from "react-native";
import * as Haptics from "expo-haptics";

// Types pour les confirmations
export interface ConfirmationOptions {
  title: string;
  message: string;
  destructive?: boolean;
  confirmText?: string;
  cancelText?: string;
  haptic?: boolean;
}

export interface ConfirmationPreset {
  moveToTrash: (itemName: string) => ConfirmationOptions;
  deletePermantly: (itemName: string) => ConfirmationOptions;
  emptyTrash: (count: number) => ConfirmationOptions;
  restoreFromTrash: (itemName: string) => ConfirmationOptions;
  createNewSession: () => ConfirmationOptions;
}

export const useConfirmation = () => {
  // Fonction de base pour les confirmations
  const showConfirmation = useCallback(
    async (options: ConfirmationOptions): Promise<boolean> => {
      const {
        title,
        message,
        destructive = false,
        confirmText = destructive ? "Supprimer" : "Confirmer",
        cancelText = "Annuler",
        haptic = true,
      } = options;

      // Feedback haptique avant la confirmation
      if (haptic && Platform.OS !== "web") {
        await Haptics.impactAsync(
          destructive
            ? Haptics.ImpactFeedbackStyle.Heavy
            : Haptics.ImpactFeedbackStyle.Medium
        );
      }

      if (Platform.OS === "web") {
        return window.confirm(`${title}\n\n${message}`);
      }

      return new Promise<boolean>((resolve) => {
        Alert.alert(title, message, [
          {
            text: cancelText,
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: confirmText,
            style: destructive ? "destructive" : "default",
            onPress: () => resolve(true),
          },
        ]);
      });
    },
    []
  );

  // ✅ Presets mémorisés pour éviter les recréations
  const presets: ConfirmationPreset = useMemo(
    () => ({
      moveToTrash: (itemName: string) => ({
        title: "Déplacer vers la corbeille ?",
        message: `Déplacer "${itemName}" vers la corbeille ?\n\nSuppression définitive dans 30 jours.`,
        destructive: true,
        confirmText: "Déplacer",
        haptic: true,
      }),

      deletePermantly: (itemName: string) => ({
        title: "Suppression définitive ?",
        message: `Supprimer définitivement ?\n\n"${itemName}"\n\n⚠️ Cette action est irréversible !`,
        destructive: true,
        confirmText: "Supprimer définitivement",
        haptic: true,
      }),

      emptyTrash: (count: number) => ({
        title: "Vider la corbeille ?",
        message: `Vider la corbeille ?\n\n${count} session${
          count > 1 ? "s" : ""
        } sera${count > 1 ? "ont" : ""} définitivement supprimée${
          count > 1 ? "s" : ""
        }.\n\n⚠️ Cette action est irréversible !`,
        destructive: true,
        confirmText: "Vider la corbeille",
        haptic: true,
      }),

      restoreFromTrash: (itemName: string) => ({
        title: "Restaurer depuis la corbeille ?",
        message: `Restaurer "${itemName}" depuis la corbeille ?`,
        destructive: false,
        confirmText: "Restaurer",
        haptic: false,
      }),

      createNewSession: () => ({
        title: "Créer une nouvelle session ?",
        message: "Votre travail actuel sera sauvegardé automatiquement.",
        destructive: false,
        confirmText: "Nouvelle session",
        haptic: false,
      }),
    }),
    []
  ); // ✅ Pas de dépendances car les fonctions sont statiques


  const confirmDeletePermanently = useCallback(
    (itemName: string) => showConfirmation(presets.deletePermantly(itemName)),
    [showConfirmation, presets]
  );

  const confirmEmptyTrash = useCallback(
    (count: number) => showConfirmation(presets.emptyTrash(count)),
    [showConfirmation, presets]
  );

  const confirmRestoreFromTrash = useCallback(
    (itemName: string) => showConfirmation(presets.restoreFromTrash(itemName)),
    [showConfirmation, presets]
  );

  const confirmCreateNewSession = useCallback(
    () => showConfirmation(presets.createNewSession()),
    [showConfirmation, presets]
  );

  return {
    // Fonction de base
    showConfirmation,

    // Presets
    presets,

    // Fonctions spécialisées
    confirmDeletePermanently,
    confirmEmptyTrash,
    confirmRestoreFromTrash,
    confirmCreateNewSession,
  };
};
