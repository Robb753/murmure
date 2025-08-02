// hooks/useStorage.ts - Version corrigée SANS confirmations
import MurmureStorage, { MurmureEntry, StorageResult } from "@/app/lib/storage";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useErrorHandler } from "./useErrorHandler";
import { useEntryActions } from "./useEntryActions";
import { useTextProcessor } from "./useTextProcessor";

interface StorageState {
  currentEntry: MurmureEntry | null;
  entries: MurmureEntry[];
  trashEntries: MurmureEntry[];
  text: string;
  wordCount: number;
  isLoading: boolean;
  error: string | null;
}

interface TextOptions {
  autoLowercase: boolean;
  preserveAcronyms: boolean;
  preserveStartOfSentence: boolean;
  preserveProperNouns: boolean;
}

export const useStorage = () => {
  // États principaux
  const [state, setState] = useState<StorageState>({
    currentEntry: null,
    entries: [],
    trashEntries: [],
    text: "",
    wordCount: 0,
    isLoading: false,
    error: null,
  });

  const [textOptions, setTextOptions] = useState<TextOptions>({
    autoLowercase: true,
    preserveAcronyms: true,
    preserveStartOfSentence: false,
    preserveProperNouns: false,
  });

  const [previewEntry, setPreviewEntry] = useState<MurmureEntry | null>(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

  // Refs pour éviter les sauvegardes inutiles
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>("");
  const previousTextRef = useRef<string>("");
  const isFirstLoadRef = useRef(true);

  // Hooks utilitaires
  const { withErrorHandling } = useErrorHandler({
    showUserNotification: true,
    logToConsole: true,
    criticalErrorsOnly: false,
  });

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

  // Chargement des données
  const loadData = useCallback(async (): Promise<StorageResult> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log("🔄 Chargement des données...");

      // Nettoyage automatique
      await MurmureStorage.initializeAutoCleanup();

      // Chargement des entrées existantes
      const [allEntries, trashEntries] = await Promise.all([
        withErrorHandling(
          () => MurmureStorage.loadActiveEntries(),
          "chargement entrées"
        ),
        withErrorHandling(
          () => MurmureStorage.loadTrashEntries(),
          "chargement corbeille"
        ),
      ]);

      if (!allEntries || !trashEntries) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Erreur de chargement des données",
        }));
        return { success: false, error: "Erreur de chargement des données" };
      }

      console.log(
        `📊 Entrées trouvées: ${allEntries.length} actives, ${trashEntries.length} supprimées`
      );

      let currentEntry: MurmureEntry | null = null;
      let textContent = "";

      // Première fois: créer une entrée de bienvenue si aucune entrée
      if (isFirstLoadRef.current && allEntries.length === 0) {
        console.log(
          "🆕 Première utilisation - création de l'entrée de bienvenue"
        );
        const firstEntryResult = await withErrorHandling(
          () => MurmureStorage.getOrCreateFirstEntry(),
          "création première entrée"
        );

        if (firstEntryResult) {
          currentEntry = firstEntryResult;
          textContent = processText(firstEntryResult.content);

          // Recharger les entrées pour inclure la nouvelle
          const updatedEntries = await withErrorHandling(
            () => MurmureStorage.loadActiveEntries(),
            "rechargement entrées"
          );
          if (updatedEntries) {
            allEntries.push(...updatedEntries);
          }
        }
      }
      // Chargement normal: essayer de récupérer l'entrée courante
      else if (allEntries.length > 0) {
        const currentEntryResult = await withErrorHandling(
          () => MurmureStorage.getCurrentEntryOrNull(),
          "chargement entrée courante"
        );

        if (currentEntryResult) {
          currentEntry = currentEntryResult;
          textContent = currentEntry ? processText(currentEntry.content) : "";
        } else {
          // Pas d'entrée courante définie, prendre la plus récente
          currentEntry = allEntries[0] || null;
          textContent = currentEntry ? processText(currentEntry.content) : "";
        }
      }

      setState((prev) => ({
        ...prev,
        currentEntry,
        text: textContent,
        wordCount: currentEntry?.wordCount || 0,
        entries: sortEntriesByDate(allEntries),
        trashEntries: sortTrashByDeletion(trashEntries),
        isLoading: false,
        error: null,
      }));

      // Sauvegarder les références pour éviter les boucles
      lastSavedContentRef.current = textContent;
      previousTextRef.current = textContent;

      // Sauvegarder l'ID de l'entrée courante si elle existe
      if (currentEntry) {
        MurmureStorage.saveCurrentEntryId(currentEntry.id);
      }

      isFirstLoadRef.current = false;
      console.log("✅ Chargement terminé");

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur de chargement";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      console.error("❌ Erreur lors du chargement:", error);
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

  // Sauvegarder seulement si il y a du contenu
  const saveCurrentEntry = useCallback(async (): Promise<StorageResult> => {
    if (!state.currentEntry) {
      return { success: false, error: "Aucune entrée courante" };
    }

    try {
      // Éviter les sauvegardes d'entrées vides
      if (
        state.text.trim() === "" &&
        state.currentEntry.content.trim() === ""
      ) {
        console.log("📝 Éviter la sauvegarde d'une entrée vide");
        return { success: true };
      }

      const updatedEntry = { ...state.currentEntry, content: state.text };

      // Éviter les sauvegardes inutiles
      if (lastSavedContentRef.current === state.text) {
        return { success: true };
      }

      console.log("💾 Sauvegarde de l'entrée:", updatedEntry.id);
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

  // Créer vraiment une nouvelle session
  const createNewSession = useCallback(async (): Promise<StorageResult> => {
    console.log("🆕 Création d'une nouvelle session...");

    try {
      // Sauvegarder l'entrée courante si elle a du contenu
      if (state.currentEntry && state.text.trim()) {
        console.log("💾 Sauvegarde de la session actuelle avant création");
        await saveCurrentEntry();
      }

      // Créer une nouvelle entrée
      const newEntryResult = await withErrorHandling(
        () => MurmureStorage.startNewSession(),
        "création nouvelle session"
      );

      if (newEntryResult) {
        console.log("✅ Nouvelle session créée:", newEntryResult.id);

        // Mettre à jour l'état avec la nouvelle entrée
        setState((prev) => ({
          ...prev,
          currentEntry: newEntryResult,
          text: "",
          wordCount: 0,
          error: null,
        }));

        // Réinitialiser les références
        lastSavedContentRef.current = "";
        previousTextRef.current = "";

        return { success: true };
      }

      return {
        success: false,
        error: "Impossible de créer une nouvelle session",
      };
    } catch (error) {
      console.error("❌ Erreur création session:", error);
      return { success: false, error: "Erreur lors de la création" };
    }
  }, [state.currentEntry, state.text, saveCurrentEntry, withErrorHandling]);

  // ✅ ACTIONS CORRIGÉES - SANS CONFIRMATIONS (gérées dans l'UI)

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

  // ✅ CORRECTION: Suppression SANS confirmation
  const moveEntryToTrash = useCallback(
    async (entry: MurmureEntry): Promise<StorageResult> => {
      console.log("🗑️ Suppression de l'entrée:", entry.id);

      const success = await entryActions.moveToTrash(entry);

      if (success) {
        // Si c'est l'entrée courante, créer une nouvelle session
        if (state.currentEntry?.id === entry.id) {
          console.log(
            "🔄 Entrée courante supprimée, création d'une nouvelle session"
          );
          await createNewSession();
        } else {
          // Sinon juste recharger les données
          await handleDataChanged();
        }
      }

      return success
        ? { success: true }
        : { success: false, error: "Opération échouée" };
    },
    [entryActions, state.currentEntry?.id, createNewSession, handleDataChanged]
  );

  // ✅ CORRECTION: Restauration SANS confirmation
  const restoreFromTrash = useCallback(
    async (entry: MurmureEntry): Promise<StorageResult> => {
      console.log("♻️ Restauration de l'entrée:", entry.id);

      const success = await entryActions.restoreFromTrash(entry);
      return success
        ? { success: true }
        : { success: false, error: "Opération échouée" };
    },
    [entryActions]
  );

  // ✅ CORRECTION: Suppression définitive SANS confirmation
  const deleteEntryPermanently = useCallback(
    async (entry: MurmureEntry): Promise<StorageResult> => {
      console.log("💀 Suppression définitive de l'entrée:", entry.id);

      const success = await entryActions.deletePermanently(entry);
      return success
        ? { success: true }
        : { success: false, error: "Opération échouée" };
    },
    [entryActions]
  );

  // ✅ CORRECTION: Vidage corbeille SANS confirmation
  const emptyTrash = useCallback(async (): Promise<StorageResult> => {
    if (state.trashEntries.length === 0) {
      return { success: false, error: "Corbeille déjà vide" };
    }

    console.log(
      "🧹 Vidage de la corbeille:",
      state.trashEntries.length,
      "entrées"
    );

    const success = await entryActions.emptyTrash(state.trashEntries);
    return success
      ? { success: true }
      : { success: false, error: "Opération échouée" };
  }, [entryActions, state.trashEntries]);

  // Partage d'entrée (sans confirmation)
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

  // Fonction pour mettre à jour le texte avec traitement
  const setText = useCallback(
    (newText: string) => {
      const processedText = processTextIncremental(
        newText,
        previousTextRef.current
      );

      setState((prev) => ({ ...prev, text: processedText }));
      previousTextRef.current = processedText;
    },
    [processTextIncremental]
  );

  // Fonctions de traitement du texte (inchangées)
  const toggleTextOption = useCallback((option: keyof TextOptions) => {
    setTextOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  }, []);

  const applyTextProcessing = useCallback(() => {
    if (state.text) {
      const processedText = processText(state.text);
      setState((prev) => ({ ...prev, text: processedText }));
      previousTextRef.current = processedText;
    }
  }, [state.text, processText]);

  const getTextStats = useCallback(() => {
    return getProcessingStats(state.text);
  }, [state.text, getProcessingStats]);

  // Compteur de mots optimisé
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

    // Sauvegarder seulement si :
    // 1. Il y a une entrée courante
    // 2. Le texte a changé par rapport à l'entrée
    // 3. Le texte n'est pas vide
    // 4. Le texte est différent de la dernière sauvegarde
    if (
      state.currentEntry &&
      state.text !== state.currentEntry.content &&
      state.text.trim() !== "" &&
      state.text !== lastSavedContentRef.current
    ) {
      console.log("⏰ Programmation de la sauvegarde automatique");
      saveTimeoutRef.current = setTimeout(() => {
        console.log("💾 Sauvegarde automatique déclenchée");
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

    // ✅ Actions corbeille SANS confirmations (confirmations gérées dans l'UI)
    moveEntryToTrash,
    restoreFromTrash,
    deleteEntryPermanently,
    emptyTrash,

    // Fonctions de traitement du texte
    textOptions,
    toggleTextOption,
    applyTextProcessing,
    getTextStats,

    // Utilitaires
    getDaysUntilDeletion: entryActions.getDaysUntilDeletion,
  };
};
