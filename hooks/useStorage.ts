// hooks/useStorage.ts - Version mise à jour
import MurmureStorage, { MurmureEntry, StorageResult } from "@/app/lib/storage";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useErrorHandler } from "./useErrorHandler";
import { useEntryActions } from "./useEntryActions";
import { useTextProcessor } from "./useTextProcessor";

// Types existants
interface StorageState {
  currentEntry: MurmureEntry | null;
  entries: MurmureEntry[];
  trashEntries: MurmureEntry[];
  text: string;
  wordCount: number;
  isLoading: boolean;
  error: string | null;
}

// Nouvelles options pour le traitement du texte
interface TextOptions {
  autoLowercase: boolean;
  preserveAcronyms: boolean;
  preserveStartOfSentence: boolean;
  preserveProperNouns: boolean;
}

export const useStorage = () => {
  // État principal
  const [state, setState] = useState<StorageState>({
    currentEntry: null,
    entries: [],
    trashEntries: [],
    text: "",
    wordCount: 0,
    isLoading: false,
    error: null,
  });

  // Options de traitement du texte (configurables)
  const [textOptions, setTextOptions] = useState<TextOptions>({
    autoLowercase: true, // Activé par défaut pour l'écriture libre
    preserveAcronyms: true,
    preserveStartOfSentence: false, // Désactivé pour une écriture vraiment libre
    preserveProperNouns: false, // Désactivé pour une écriture vraiment libre
  });

  // États séparés pour la prévisualisation
  const [previewEntry, setPreviewEntry] = useState<MurmureEntry | null>(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>("");
  const previousTextRef = useRef<string>("");

  // Hooks utilitaires
  const { withErrorHandling } = useErrorHandler({
    showUserNotification: true,
    logToConsole: true,
    criticalErrorsOnly: false,
  });

  // Hook de traitement du texte
  const { processText, processTextIncremental, getProcessingStats } =
    useTextProcessor(textOptions);

  // Fonctions utilitaires mémorisées
  const sortEntriesByDate = useCallback(
    (entries: MurmureEntry[]) =>
      entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    []
  );

  const sortTrashByDeletion = useCallback(
    (entries: MurmureEntry[]) =>
      entries.sort(
        (a, b) => (b.deletedAt?.getTime() || 0) - (a.deletedAt?.getTime() || 0)
      ),
    []
  );

  // Chargement de données simplifié
  const loadData = useCallback(async (): Promise<StorageResult> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Nettoyage automatique
      await MurmureStorage.initializeAutoCleanup();

      // Chargement parallèle des données
      const [entry, allEntries, trashEntries] = await Promise.all([
        withErrorHandling(
          () => MurmureStorage.getTodayEntryOrCreate(),
          "création entrée du jour"
        ),
        withErrorHandling(
          () => MurmureStorage.loadActiveEntries(),
          "chargement entrées"
        ),
        withErrorHandling(
          () => MurmureStorage.loadTrashEntries(),
          "chargement corbeille"
        ),
      ]);

      if (entry && allEntries && trashEntries) {
        // Traiter le contenu existant si nécessaire
        const processedContent = processText(entry.content);

        setState((prev) => ({
          ...prev,
          currentEntry: entry,
          text: processedContent,
          wordCount: entry.wordCount,
          entries: sortEntriesByDate(allEntries),
          trashEntries: sortTrashByDeletion(trashEntries),
          isLoading: false,
          error: null,
        }));

        lastSavedContentRef.current = processedContent;
        previousTextRef.current = processedContent;

        // Si le contenu a été modifié par le traitement, sauvegarder
        if (processedContent !== entry.content) {
          const updatedEntry = { ...entry, content: processedContent };
          MurmureStorage.saveEntry(updatedEntry);
        }

        MurmureStorage.saveCurrentEntryId(entry.id);

        return { success: true };
      }

      return { success: false, error: "Échec du chargement des données" };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur de chargement";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [withErrorHandling, sortEntriesByDate, sortTrashByDeletion, processText]);

  // Callback pour rechargement des données
  const handleDataChanged = useCallback(() => {
    loadData();
  }, [loadData]);

  // Callback pour changement d'entrée courante
  const handleCurrentEntryChanged = useCallback(
    (entry: MurmureEntry | null) => {
      const processedContent = entry ? processText(entry.content) : "";

      setState((prev) => ({
        ...prev,
        currentEntry: entry,
        text: processedContent,
        error: null,
      }));

      if (entry) {
        lastSavedContentRef.current = processedContent;
        previousTextRef.current = processedContent;
      }
    },
    [processText]
  );

  // Hook d'actions sur les entrées
  const entryActions = useEntryActions({
    onDataChanged: handleDataChanged,
    onCurrentEntryChanged: handleCurrentEntryChanged,
  });

  // Sauvegarder avec la nouvelle API
  const saveCurrentEntry = useCallback(async (): Promise<StorageResult> => {
    if (!state.currentEntry) {
      return { success: false, error: "Aucune entrée courante" };
    }

    try {
      const updatedEntry = { ...state.currentEntry, content: state.text };

      // Éviter les sauvegardes inutiles
      if (lastSavedContentRef.current === state.text) {
        return { success: true };
      }

      const result = await MurmureStorage.saveEntry(updatedEntry);

      if (result.success && result.data) {
        lastSavedContentRef.current = state.text;

        // Rechargement optimisé des entrées
        const entriesData = await withErrorHandling(
          () => MurmureStorage.loadActiveEntries(),
          "rechargement entrées"
        );

        if (entriesData) {
          setState((prev) => ({
            ...prev,
            currentEntry: result.data!,
            entries: sortEntriesByDate(entriesData),
            error: null,
          }));
        }

        return { success: true };
      }

      return {
        success: false,
        error: result.error,
        errorCode: result.errorCode,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      return { success: false, error: errorMessage };
    }
  }, [state.currentEntry, state.text, sortEntriesByDate, withErrorHandling]);

  // Actions simplifiées utilisant les hooks utilitaires
  const createNewSession = useCallback(async (): Promise<StorageResult> => {
    const newEntry = await entryActions.createNewEntry(
      state.currentEntry,
      state.text,
      saveCurrentEntry
    );

    return newEntry
      ? { success: true }
      : { success: false, error: "Impossible de créer une nouvelle session" };
  }, [entryActions, state.currentEntry, state.text, saveCurrentEntry]);

  const loadEntry = useCallback(
    async (entry: MurmureEntry): Promise<StorageResult> => {
      const success = await entryActions.loadEntry(
        entry,
        state.currentEntry,
        state.text,
        saveCurrentEntry
      );

      return success
        ? { success: true }
        : { success: false, error: "Erreur chargement entrée" };
    },
    [entryActions, state.currentEntry, state.text, saveCurrentEntry]
  );

  // Actions de corbeille simplifiées
  const moveEntryToTrash = useCallback(
    async (entry: MurmureEntry): Promise<StorageResult> => {
      const success = await entryActions.moveToTrash(entry);

      // Si c'est l'entrée courante, créer une nouvelle session
      if (success && state.currentEntry?.id === entry.id) {
        await createNewSession();
      }

      return success
        ? { success: true }
        : { success: false, error: "Opération annulée ou échouée" };
    },
    [entryActions, state.currentEntry?.id, createNewSession]
  );

  const restoreFromTrash = useCallback(
    async (entry: MurmureEntry): Promise<StorageResult> => {
      const success = await entryActions.restoreFromTrash(entry);
      return success
        ? { success: true }
        : { success: false, error: "Opération annulée ou échouée" };
    },
    [entryActions]
  );

  const deleteEntryPermanently = useCallback(
    async (entry: MurmureEntry): Promise<StorageResult> => {
      const success = await entryActions.deletePermanently(entry);
      return success
        ? { success: true }
        : { success: false, error: "Opération annulée ou échouée" };
    },
    [entryActions]
  );

  const emptyTrash = useCallback(async (): Promise<StorageResult> => {
    if (state.trashEntries.length === 0) {
      return { success: false, error: "Corbeille déjà vide" };
    }

    const success = await entryActions.emptyTrash(state.trashEntries);
    return success
      ? { success: true }
      : { success: false, error: "Opération annulée ou échouée" };
  }, [entryActions, state.trashEntries]);

  const shareEntry = useCallback(
    async (entry: MurmureEntry): Promise<StorageResult> => {
      const success = await entryActions.shareEntry(entry);
      return success
        ? { success: true }
        : { success: false, error: "Erreur partage" };
    },
    [entryActions]
  );

  // Fonctions de prévisualisation (inchangées)
  const openPreview = useCallback((entry: MurmureEntry) => {
    setPreviewEntry(entry);
    setIsPreviewModalVisible(true);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewEntry(null);
    setIsPreviewModalVisible(false);
  }, []);

  // ✅ Fonction pour mettre à jour le texte AVEC traitement des majuscules
  const setText = useCallback(
    (newText: string) => {
      // Traitement intelligent du texte avec optimisation pour les gros textes
      const processedText = processTextIncremental(
        newText,
        previousTextRef.current
      );

      setState((prev) => ({ ...prev, text: processedText }));
      previousTextRef.current = processedText;
    },
    [processTextIncremental]
  );

  // Fonction pour basculer les options de traitement du texte
  const toggleTextOption = useCallback((option: keyof TextOptions) => {
    setTextOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  }, []);

  // Fonction pour appliquer le traitement au texte courant
  const applyTextProcessing = useCallback(() => {
    if (state.text) {
      const processedText = processText(state.text);
      setState((prev) => ({ ...prev, text: processedText }));
      previousTextRef.current = processedText;
    }
  }, [state.text, processText]);

  // Fonction pour obtenir les statistiques de traitement
  const getTextStats = useCallback(() => {
    return getProcessingStats(state.text);
  }, [state.text, getProcessingStats]);

  // Effet pour le compteur de mots (optimisé)
  const wordCount = useMemo(() => {
    if (!state.text.trim()) return 0;
    return state.text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }, [state.text]);

  // Mise à jour du compteur de mots
  useEffect(() => {
    setState((prev) => ({ ...prev, wordCount }));
  }, [wordCount]);

  // Effet pour la sauvegarde automatique
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (
      state.currentEntry &&
      state.text !== state.currentEntry.content &&
      state.text.trim() !== "" &&
      state.text !== lastSavedContentRef.current
    ) {
      saveTimeoutRef.current = setTimeout(() => {
        saveCurrentEntry().catch(console.warn);
      }, 800);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.text, state.currentEntry, saveCurrentEntry]);

  // Nettoyage à la désactivation
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // État principal
    currentEntry: state.currentEntry,
    entries: state.entries,
    trashEntries: state.trashEntries,
    text: state.text,
    wordCount: state.wordCount,
    isLoading: state.isLoading,
    error: state.error,

    // Prévisualisation
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

    // ✅ Nouvelles fonctions pour le traitement du texte
    textOptions,
    toggleTextOption,
    applyTextProcessing,
    getTextStats,

    // Utilitaires
    getDaysUntilDeletion: entryActions.getDaysUntilDeletion,
  };
};
