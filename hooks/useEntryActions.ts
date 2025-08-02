// hooks/useEntryActions.ts - Version vérifiée et optimisée
import { useCallback } from "react";
import { Share } from "react-native";
import MurmureStorage, { MurmureEntry, StorageResult } from "@/app/lib/storage";
import { useErrorHandler } from "./useErrorHandler";

export interface UseEntryActionsProps {
  onDataChanged?: () => void;
  onCurrentEntryChanged?: (entry: MurmureEntry | null) => void;
}

export const useEntryActions = ({
  onDataChanged,
  onCurrentEntryChanged,
}: UseEntryActionsProps = {}) => {
  const { withErrorHandling } = useErrorHandler();

  // ✅ ACTIONS TECHNIQUES PURES - AUCUNE CONFIRMATION (gérées dans l'UI)

  /**
   * Déplace une entrée vers la corbeille
   * Action technique pure sans confirmation
   */
  const moveToTrash = useCallback(
    async (entry: MurmureEntry): Promise<boolean> => {
      try {
        console.log(
          "🗑️ [useEntryActions] Début déplacement vers corbeille:",
          entry.id
        );

        const result = await MurmureStorage.moveToTrash(entry.id);

        if (result.success) {
          console.log("✅ [useEntryActions] Déplacement réussi");
          onDataChanged?.();
          return true;
        } else {
          console.error(
            "❌ [useEntryActions] Échec déplacement:",
            result.error
          );
          return false;
        }
      } catch (error) {
        console.error(
          "❌ [useEntryActions] Exception lors du déplacement:",
          error
        );
        return false;
      }
    },
    [onDataChanged]
  );

  /**
   * Restaure une entrée depuis la corbeille
   * Action technique pure sans confirmation
   */
  const restoreFromTrash = useCallback(
    async (entry: MurmureEntry): Promise<boolean> => {
      try {
        console.log("♻️ [useEntryActions] Début restauration:", entry.id);

        const result = await MurmureStorage.restoreFromTrash(entry.id);

        if (result.success) {
          console.log("✅ [useEntryActions] Restauration réussie");
          onDataChanged?.();
          return true;
        } else {
          console.error(
            "❌ [useEntryActions] Échec restauration:",
            result.error
          );
          return false;
        }
      } catch (error) {
        console.error(
          "❌ [useEntryActions] Exception lors de la restauration:",
          error
        );
        return false;
      }
    },
    [onDataChanged]
  );

  /**
   * Supprime définitivement une entrée
   * Action technique pure sans confirmation
   */
  const deletePermanently = useCallback(
    async (entry: MurmureEntry): Promise<boolean> => {
      try {
        console.log(
          "💀 [useEntryActions] Début suppression définitive:",
          entry.id
        );

        const result = await MurmureStorage.deleteEntryPermanently(entry.id);

        if (result.success) {
          console.log("✅ [useEntryActions] Suppression définitive réussie");
          onDataChanged?.();
          return true;
        } else {
          console.error(
            "❌ [useEntryActions] Échec suppression définitive:",
            result.error
          );
          return false;
        }
      } catch (error) {
        console.error(
          "❌ [useEntryActions] Exception lors de la suppression définitive:",
          error
        );
        return false;
      }
    },
    [onDataChanged]
  );

  /**
   * Vide complètement la corbeille
   * Action technique pure sans confirmation
   */
  const emptyTrash = useCallback(
    async (trashEntries: MurmureEntry[]): Promise<boolean> => {
      try {
        if (trashEntries.length === 0) {
          console.log("📭 [useEntryActions] Corbeille déjà vide");
          return false;
        }

        console.log(
          "🧹 [useEntryActions] Début vidage corbeille:",
          trashEntries.length,
          "entrées"
        );

        const result = await MurmureStorage.emptyTrash();

        if (result.success) {
          console.log("✅ [useEntryActions] Vidage corbeille réussi");
          onDataChanged?.();
          return true;
        } else {
          console.error(
            "❌ [useEntryActions] Échec vidage corbeille:",
            result.error
          );
          return false;
        }
      } catch (error) {
        console.error("❌ [useEntryActions] Exception lors du vidage:", error);
        return false;
      }
    },
    [onDataChanged]
  );

  /**
   * Partage une entrée via les options de partage du système
   * Action sans confirmation (immédiate)
   */
  const shareEntry = useCallback(
    async (entry: MurmureEntry): Promise<boolean> => {
      try {
        console.log("📤 [useEntryActions] Début partage:", entry.id);

        await Share.share({
          message: `${entry.content}\n\n— Écrit avec Murmure 🌙`,
          title: `Session du ${entry.date}`,
        });

        console.log("✅ [useEntryActions] Partage réussi");
        return true;
      } catch (error) {
        console.error("❌ [useEntryActions] Erreur partage:", error);
        return false;
      }
    },
    []
  );

  /**
   * Charge une entrée existante en sauvegardant l'actuelle si nécessaire
   * Action avec sauvegarde automatique
   */
  const loadEntry = useCallback(
    async (
      entry: MurmureEntry,
      currentEntry: MurmureEntry | null,
      currentText: string,
      saveCurrentFn?: () => Promise<StorageResult>
    ): Promise<boolean> => {
      try {
        console.log("📂 [useEntryActions] Chargement de l'entrée:", entry.id);

        // ✅ Sauvegarde automatique si nécessaire
        if (
          currentEntry &&
          currentText.trim() &&
          currentText !== currentEntry.content &&
          saveCurrentFn
        ) {
          console.log("💾 [useEntryActions] Sauvegarde avant chargement");
          const result = await saveCurrentFn();
          if (!result.success) {
            console.warn(
              "⚠️ [useEntryActions] Échec sauvegarde avant chargement:",
              result.error
            );
          }
        }

        // Changer l'entrée courante
        onCurrentEntryChanged?.(entry);

        // Sauvegarder l'ID de l'entrée courante
        const saveIdResult = await MurmureStorage.saveCurrentEntryId(entry.id);
        if (!saveIdResult.success) {
          console.warn(
            "⚠️ [useEntryActions] Échec sauvegarde ID:",
            saveIdResult.error
          );
        }

        console.log("✅ [useEntryActions] Entrée chargée avec succès");
        return true;
      } catch (error) {
        console.error("❌ [useEntryActions] Erreur chargement entrée:", error);
        return false;
      }
    },
    [onCurrentEntryChanged]
  );

  /**
   * Crée une nouvelle entrée en sauvegardant l'actuelle si nécessaire
   * Action avec sauvegarde automatique
   */
  const createNewEntry = useCallback(
    async (
      currentEntry: MurmureEntry | null,
      currentText: string,
      saveCurrentFn?: () => Promise<StorageResult>
    ): Promise<MurmureEntry | null> => {
      try {
        console.log("🆕 [useEntryActions] Création d'une nouvelle entrée...");

        // ✅ Sauvegarde automatique si nécessaire
        if (currentEntry && currentText.trim() && saveCurrentFn) {
          console.log(
            "💾 [useEntryActions] Sauvegarde avant création nouvelle entrée"
          );
          const result = await saveCurrentFn();
          if (!result.success) {
            console.warn(
              "⚠️ [useEntryActions] Échec sauvegarde avant nouvelle entrée:",
              result.error
            );
          }
        }

        // Créer la nouvelle entrée
        const result = await withErrorHandling(
          () => MurmureStorage.startNewSession(),
          "création nouvelle entrée"
        );

        if (result) {
          console.log("✅ [useEntryActions] Nouvelle entrée créée:", result.id);
          onCurrentEntryChanged?.(result);
          onDataChanged?.();
          return result;
        }

        console.error("❌ [useEntryActions] Échec création nouvelle entrée");
        return null;
      } catch (error) {
        console.error(
          "❌ [useEntryActions] Exception lors de la création:",
          error
        );
        return null;
      }
    },
    [withErrorHandling, onCurrentEntryChanged, onDataChanged]
  );

  /**
   * Obtient le nombre de jours restants avant suppression définitive
   * Fonction utilitaire pure
   */
  const getDaysUntilDeletion = useCallback(
    (entry: MurmureEntry): number | null => {
      return MurmureStorage.getDaysUntilDeletion(entry);
    },
    []
  );

  return {
    // ✅ Actions principales - AUCUNE CONFIRMATION (gérées dans l'UI)
    moveToTrash,
    restoreFromTrash,
    deletePermanently,
    emptyTrash,

    // ✅ Actions sans confirmation
    shareEntry,
    loadEntry,
    createNewEntry,

    // ✅ Utilitaires
    getDaysUntilDeletion,
  };
};
