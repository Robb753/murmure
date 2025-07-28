import { useCallback } from "react";
import { Share } from "react-native";
import MurmureStorage, { MurmureEntry, StorageResult } from "@/app/lib/storage";
import { useConfirmation } from "./useConfirmation";
import { useErrorHandler } from "./useErrorHandler";

export interface UseEntryActionsProps {
  onDataChanged?: () => void;
  onCurrentEntryChanged?: (entry: MurmureEntry | null) => void;
}

export const useEntryActions = ({
  onDataChanged,
  onCurrentEntryChanged,
}: UseEntryActionsProps = {}) => {
  const {
    confirmMoveToTrash,
    confirmDeletePermanently,
    confirmEmptyTrash,
    confirmRestoreFromTrash,
  } = useConfirmation();

  const { withErrorHandling } = useErrorHandler();

  // Déplacer vers la corbeille
  const moveToTrash = useCallback(
    async (entry: MurmureEntry): Promise<boolean> => {
      const itemName = entry.previewText || "Session vide";
      const confirmed = await confirmMoveToTrash(itemName);

      if (!confirmed) return false;

      const result = await withErrorHandling(
        () => MurmureStorage.moveToTrash(entry.id),
        "déplacement vers corbeille"
      );

      if (result !== null) {
        onDataChanged?.();
        return true;
      }

      return false;
    },
    [confirmMoveToTrash, withErrorHandling, onDataChanged]
  );

  // Restaurer depuis la corbeille
  const restoreFromTrash = useCallback(
    async (entry: MurmureEntry): Promise<boolean> => {
      const itemName = entry.previewText || "Session vide";
      const confirmed = await confirmRestoreFromTrash(itemName);

      if (!confirmed) return false;

      const result = await withErrorHandling(
        () => MurmureStorage.restoreFromTrash(entry.id),
        "restauration depuis corbeille"
      );

      if (result !== null) {
        onDataChanged?.();
        return true;
      }

      return false;
    },
    [confirmRestoreFromTrash, withErrorHandling, onDataChanged]
  );

  // Supprimer définitivement
  const deletePermanently = useCallback(
    async (entry: MurmureEntry): Promise<boolean> => {
      const itemName = entry.previewText || "Session vide";
      const confirmed = await confirmDeletePermanently(itemName);

      if (!confirmed) return false;

      const result = await withErrorHandling(
        () => MurmureStorage.deleteEntryPermanently(entry.id),
        "suppression définitive"
      );

      if (result !== null) {
        onDataChanged?.();
        return true;
      }

      return false;
    },
    [confirmDeletePermanently, withErrorHandling, onDataChanged]
  );

  // Vider la corbeille
  const emptyTrash = useCallback(
    async (trashEntries: MurmureEntry[]): Promise<boolean> => {
      if (trashEntries.length === 0) return false;

      const confirmed = await confirmEmptyTrash(trashEntries.length);

      if (!confirmed) return false;

      const result = await withErrorHandling(
        () => MurmureStorage.emptyTrash(),
        "vidage corbeille"
      );

      if (result !== null) {
        onDataChanged?.();
        return true;
      }

      return false;
    },
    [confirmEmptyTrash, withErrorHandling, onDataChanged]
  );

  // Partager une entrée
  const shareEntry = useCallback(
    async (entry: MurmureEntry): Promise<boolean> => {
      try {
        await Share.share({
          message: `${entry.content}\n\n— Écrit avec Murmure 🌙`,
          title: `Session du ${entry.date}`,
        });
        return true;
      } catch (error) {
        console.error("Erreur partage:", error);
        return false;
      }
    },
    []
  );

  // Charger une entrée (avec sauvegarde automatique si nécessaire)
  const loadEntry = useCallback(
    async (
      entry: MurmureEntry,
      currentEntry: MurmureEntry | null,
      currentText: string,
      saveCurrentFn?: () => Promise<StorageResult>
    ): Promise<boolean> => {
      try {
        // Sauvegarder l'entrée courante si modifiée
        if (
          currentEntry &&
          currentText.trim() &&
          currentText !== currentEntry.content &&
          saveCurrentFn
        ) {
          const result = await saveCurrentFn();
          if (!result.success) {
            console.warn("Échec sauvegarde avant chargement:", result.error);
          }
        }

        // Changer l'entrée courante
        onCurrentEntryChanged?.(entry);

        // Sauvegarder l'ID en arrière-plan
        const saveIdResult = await MurmureStorage.saveCurrentEntryId(entry.id);
        if (!saveIdResult.success) {
          console.warn("⚠️ Échec sauvegarde ID:", saveIdResult.error);
        }

        return true;
      } catch (error) {
        console.error("Erreur chargement entrée:", error);
        return false;
      }
    },
    [onCurrentEntryChanged]
  );

  // Créer une nouvelle entrée
  const createNewEntry = useCallback(
    async (
      currentEntry: MurmureEntry | null,
      currentText: string,
      saveCurrentFn?: () => Promise<StorageResult>
    ): Promise<MurmureEntry | null> => {
      try {
        // Sauvegarder l'entrée courante si nécessaire
        if (currentEntry && currentText.trim() && saveCurrentFn) {
          const result = await saveCurrentFn();
          if (!result.success) {
            console.warn(
              "Échec sauvegarde avant nouvelle entrée:",
              result.error
            );
          }
        }

        const result = await withErrorHandling(
          () => MurmureStorage.getTodayEntryOrCreate(),
          "création nouvelle entrée"
        );

        if (result) {
          onCurrentEntryChanged?.(result);
          onDataChanged?.();
          return result;
        }

        return null;
      } catch (error) {
        console.error("Erreur création entrée:", error);
        return null;
      }
    },
    [withErrorHandling, onCurrentEntryChanged, onDataChanged]
  );

  // Obtenir le nombre de jours jusqu'à suppression
  const getDaysUntilDeletion = useCallback(
    (entry: MurmureEntry): number | null => {
      return MurmureStorage.getDaysUntilDeletion(entry);
    },
    []
  );

  return {
    // Actions principales
    moveToTrash,
    restoreFromTrash,
    deletePermanently,
    emptyTrash,
    shareEntry,
    loadEntry,
    createNewEntry,

    // Utilitaires
    getDaysUntilDeletion,
  };
};
