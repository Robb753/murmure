// hooks/useEntryActions.ts - Version corrigée
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

  // ✅ Déplacer vers la corbeille - version corrigée
  const moveToTrash = useCallback(
    async (entry: MurmureEntry): Promise<boolean> => {
      try {
        console.log("🗑️ Début déplacement vers corbeille:", entry.id);

        const itemName =
          entry.previewText || entry.content.substring(0, 50) || "Session vide";
        const confirmed = await confirmMoveToTrash(itemName);

        if (!confirmed) {
          console.log("❌ Déplacement annulé par l'utilisateur");
          return false;
        }

        // ✅ Appel direct avec gestion d'erreur améliorée
        const result = await MurmureStorage.moveToTrash(entry.id);

        if (result.success) {
          console.log("✅ Déplacement réussi");
          onDataChanged?.();
          return true;
        } else {
          console.error("❌ Échec déplacement:", result.error);
          // Afficher l'erreur à l'utilisateur si nécessaire
          return false;
        }
      } catch (error) {
        console.error("❌ Exception lors du déplacement:", error);
        return false;
      }
    },
    [confirmMoveToTrash, onDataChanged]
  );

  // ✅ Restaurer depuis la corbeille - version corrigée
  const restoreFromTrash = useCallback(
    async (entry: MurmureEntry): Promise<boolean> => {
      try {
        console.log("♻️ Début restauration:", entry.id);

        const itemName =
          entry.previewText || entry.content.substring(0, 50) || "Session vide";
        const confirmed = await confirmRestoreFromTrash(itemName);

        if (!confirmed) {
          console.log("❌ Restauration annulée par l'utilisateur");
          return false;
        }

        const result = await MurmureStorage.restoreFromTrash(entry.id);

        if (result.success) {
          console.log("✅ Restauration réussie");
          onDataChanged?.();
          return true;
        } else {
          console.error("❌ Échec restauration:", result.error);
          return false;
        }
      } catch (error) {
        console.error("❌ Exception lors de la restauration:", error);
        return false;
      }
    },
    [confirmRestoreFromTrash, onDataChanged]
  );

  // ✅ Supprimer définitivement - version corrigée
  const deletePermanently = useCallback(
    async (entry: MurmureEntry): Promise<boolean> => {
      try {
        console.log("💀 Début suppression définitive:", entry.id);

        const itemName =
          entry.previewText || entry.content.substring(0, 50) || "Session vide";
        const confirmed = await confirmDeletePermanently(itemName);

        if (!confirmed) {
          console.log("❌ Suppression annulée par l'utilisateur");
          return false;
        }

        const result = await MurmureStorage.deleteEntryPermanently(entry.id);

        if (result.success) {
          console.log("✅ Suppression définitive réussie");
          onDataChanged?.();
          return true;
        } else {
          console.error("❌ Échec suppression définitive:", result.error);
          return false;
        }
      } catch (error) {
        console.error("❌ Exception lors de la suppression définitive:", error);
        return false;
      }
    },
    [confirmDeletePermanently, onDataChanged]
  );

  // ✅ Vider la corbeille - version corrigée
  const emptyTrash = useCallback(
    async (trashEntries: MurmureEntry[]): Promise<boolean> => {
      try {
        if (trashEntries.length === 0) {
          console.log("📭 Corbeille déjà vide");
          return false;
        }

        console.log(
          "🧹 Début vidage corbeille:",
          trashEntries.length,
          "entrées"
        );

        const confirmed = await confirmEmptyTrash(trashEntries.length);

        if (!confirmed) {
          console.log("❌ Vidage annulé par l'utilisateur");
          return false;
        }

        const result = await MurmureStorage.emptyTrash();

        if (result.success) {
          console.log("✅ Vidage corbeille réussi");
          onDataChanged?.();
          return true;
        } else {
          console.error("❌ Échec vidage corbeille:", result.error);
          return false;
        }
      } catch (error) {
        console.error("❌ Exception lors du vidage:", error);
        return false;
      }
    },
    [confirmEmptyTrash, onDataChanged]
  );

  // Partager une entrée (inchangé)
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

  // Charger une entrée (inchangé)
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

  // Créer une nouvelle entrée (inchangé)
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

  // Obtenir le nombre de jours jusqu'à suppression (inchangé)
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
