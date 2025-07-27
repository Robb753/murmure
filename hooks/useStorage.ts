import MurmureStorage, { MurmureEntry } from "@/app/lib/storage";
import { useState, useEffect, useRef, useCallback } from "react";
import { Alert, Platform, Share } from "react-native";

export const useStorage = () => {
  const [currentEntry, setCurrentEntry] = useState<MurmureEntry | null>(null);
  const [entries, setEntries] = useState<MurmureEntry[]>([]);
  const [trashEntries, setTrashEntries] = useState<MurmureEntry[]>([]);
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [previewEntry, setPreviewEntry] = useState<MurmureEntry | null>(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

  // Fonction pour ouvrir la prévisualisation
  const openPreview = useCallback((entry: MurmureEntry) => {
    console.log("👁️ Ouverture preview pour:", entry.id);
    setPreviewEntry(entry);
    setIsPreviewModalVisible(true);
  }, []);

  // Fonction pour fermer la prévisualisation
  const closePreview = useCallback(() => {
    console.log("👁️ Fermeture preview");
    setPreviewEntry(null);
    setIsPreviewModalVisible(false);
  }, []);

  // Sauvegarder l'entrée
  const saveCurrentEntry = useCallback(async () => {
    if (!currentEntry) return;

    try {
      const updatedEntry = { ...currentEntry, content: text };
      await MurmureStorage.saveEntry(updatedEntry);
      setCurrentEntry(updatedEntry);

      const allEntries = await MurmureStorage.loadActiveEntries();
      setEntries(
        allEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      );
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  }, [currentEntry, text]);

  // Charger données (entrée courante + historique + corbeille)
  const loadData = useCallback(async () => {
    try {
      // Nettoyer automatiquement la corbeille expirée
      await MurmureStorage.initializeAutoCleanup();

      const entry = await MurmureStorage.getTodayEntryOrCreate();
      const allEntries = await MurmureStorage.loadActiveEntries();
      const trashEntries = await MurmureStorage.loadTrashEntries();

      setCurrentEntry(entry);
      setText(entry.content);
      setWordCount(entry.wordCount);
      setEntries(
        allEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      );
      setTrashEntries(
        trashEntries.sort(
          (a, b) =>
            (b.deletedAt?.getTime() || 0) - (a.deletedAt?.getTime() || 0)
        )
      );

      await MurmureStorage.saveCurrentEntryId(entry.id);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  // Créer nouvelle session
  const createNewSession = useCallback(async () => {
    if (currentEntry && text.trim()) {
      await saveCurrentEntry();
    }

    const newEntry = await MurmureStorage.getTodayEntryOrCreate();
    setCurrentEntry(newEntry);
    setText("");

    loadData();
  }, [currentEntry, text, saveCurrentEntry, loadData]);

  // Charger une session depuis la sidebar
  const loadEntry = useCallback(
    async (entry: MurmureEntry) => {
      if (currentEntry && text.trim()) {
        await saveCurrentEntry();
      }

      setCurrentEntry(entry);
      setText(entry.content);
      await MurmureStorage.saveCurrentEntryId(entry.id);
    },
    [currentEntry, text, saveCurrentEntry]
  );

  // Déplacer une session vers la corbeille
  const moveEntryToTrash = useCallback(
    async (entry: MurmureEntry) => {
      console.log("🟡 ÉTAPE 2 - moveEntryToTrash DÉBUT pour:", entry.id);

      // Pour le web, utiliser la confirmation native
      const message = `Déplacer "${
        entry.previewText || "Session vide"
      }" vers la corbeille ?\n\nSuppression définitive dans 30 jours.`;

      let confirmed = false;

      if (Platform.OS === "web") {
        // Confirmation native du navigateur
        confirmed = window.confirm(message);
        console.log("🟡 ÉTAPE 2 - Confirmation web:", confirmed);
      } else {
        // Pour mobile, promisifier Alert
        confirmed = await new Promise<boolean>((resolve) => {
          Alert.alert("Déplacer vers la corbeille ?", message, [
            { text: "Annuler", style: "cancel", onPress: () => resolve(false) },
            {
              text: "Confirmer",
              style: "destructive",
              onPress: () => resolve(true),
            },
          ]);
        });
      }

      if (confirmed) {
        console.log("🟠 ÉTAPE 3 - Confirmation reçue, suppression...");

        try {
          await MurmureStorage.moveToTrash(entry.id);
          console.log("🟠 ÉTAPE 3 - Storage terminé");

          await loadData();
          console.log("🟠 ÉTAPE 3 - LoadData terminé");

          if (currentEntry?.id === entry.id) {
            await createNewSession();
            console.log("🟠 ÉTAPE 3 - NewSession terminé");
          }

          console.log("🟢 ÉTAPE 3 - SUCCÈS COMPLET");
        } catch (error) {
          console.error("🔴 ÉTAPE 3 - ERREUR:", error);
        }
      } else {
        console.log("🟡 ÉTAPE 2 - Suppression annulée");
      }
    },
    [currentEntry, loadData, createNewSession]
  );

  // Restaurer depuis la corbeille
  const restoreFromTrash = useCallback(
    async (entry: MurmureEntry) => {
      await MurmureStorage.restoreFromTrash(entry.id);
      await loadData();
    },
    [loadData]
  );

  // Suppression définitive
  const deleteEntryPermanently = useCallback(
    async (entry: MurmureEntry) => {
      console.log("💀 deleteEntryPermanently appelé pour:", entry.id);

      const message = `Supprimer définitivement ?\n\n"${
        entry.previewText || "Session vide"
      }"\n\n⚠️ Cette action est irréversible !`;

      let confirmed = false;

      if (typeof window !== "undefined" && window.confirm) {
        confirmed = window.confirm(message);
      } else {
        confirmed = await new Promise<boolean>((resolve) => {
          Alert.alert("Suppression définitive ?", message, [
            { text: "Annuler", style: "cancel", onPress: () => resolve(false) },
            {
              text: "Supprimer",
              style: "destructive",
              onPress: () => resolve(true),
            },
          ]);
        });
      }

      if (confirmed) {
        try {
          console.log("💀 Confirmation reçue, suppression...");
          await MurmureStorage.deleteEntryPermanently(entry.id);
          console.log("💀 Storage supprimé");
          await loadData();
          console.log("💀 Données rechargées");
        } catch (error) {
          console.error("🔴 Erreur suppression définitive:", error);
        }
      }
    },
    [loadData]
  );

  // Vider la corbeille
  const emptyTrash = useCallback(async () => {
    console.log("🧹 emptyTrash appelé, nombre d'entrées:", trashEntries.length);

    if (trashEntries.length === 0) {
      console.log("🧹 Corbeille déjà vide");
      return;
    }

    const message = `Vider la corbeille ?\n\n${trashEntries.length} session${
      trashEntries.length > 1 ? "s" : ""
    } ser${trashEntries.length > 1 ? "ont" : ""} définitivement supprimée${
      trashEntries.length > 1 ? "s" : ""
    }.\n\n⚠️ Cette action est irréversible !`;

    let confirmed = false;

    if (typeof window !== "undefined" && window.confirm) {
      confirmed = window.confirm(message);
    } else {
      confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert("Vider la corbeille ?", message, [
          { text: "Annuler", style: "cancel", onPress: () => resolve(false) },
          { text: "Vider", style: "destructive", onPress: () => resolve(true) },
        ]);
      });
    }

    if (confirmed) {
      try {
        console.log("🧹 Confirmation reçue, vidage...");
        await MurmureStorage.emptyTrash();
        console.log("🧹 Storage vidé");
        await loadData();
        console.log("🧹 Données rechargées");
      } catch (error) {
        console.error("🔴 Erreur vidage corbeille:", error);
      }
    }
  }, [trashEntries.length, loadData]);

  // Partager une session
  const shareEntry = useCallback(async (entry: MurmureEntry) => {
    try {
      await Share.share({
        message: `${entry.content}\n\n— Écrit avec Murmure 🌙`,
        title: `Session du ${entry.date}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }, []);

  // Auto-save effect avec debounce amélioré
  useEffect(() => {
    // Nettoyer le timeout précédent
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Sauvegarder seulement si le contenu a changé
    if (currentEntry && text !== currentEntry.content && text.trim() !== "") {
      saveTimeoutRef.current = setTimeout(() => {
        saveCurrentEntry();
      }, 800);
    }

    // Compteur de mots
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, currentEntry?.content]);

  return {
    // État
    currentEntry,
    entries,
    trashEntries,
    text,
    wordCount,

    // Preview
    previewEntry,
    isPreviewModalVisible,
    openPreview,
    closePreview,

    // Actions principales
    setText,
    loadData,
    saveCurrentEntry,
    createNewSession,
    loadEntry,
    shareEntry,

    // Actions corbeille
    moveEntryToTrash,
    restoreFromTrash,
    deleteEntryPermanently,
    emptyTrash,

    // Utilitaires
    getDaysUntilDeletion: MurmureStorage.getDaysUntilDeletion,
  };
};
