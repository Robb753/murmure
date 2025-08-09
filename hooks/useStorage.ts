// hooks/useStorage.ts - Version avec débounce optimisé
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

// ✅ NOUVEAU: Configuration du débounce
const SAVE_DEBOUNCE_DELAY = 3000; // 1 seconde (plus réactif que 2 secondes)
const MAX_TEXT_LENGTH = 100000; // 100k caractères maximum

// ✅ NOUVEAU: Fonction débounce optimisée
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
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

  // ✅ NOUVEAU: État pour indicateur de sauvegarde
  const [isSaving, setIsSaving] = useState(false);

  // Refs pour éviter les sauvegardes inutiles
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

  // Chargement des données (inchangé)
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

  // ✅ AMÉLIORATION: Sauvegarde avec indicateur visuel
  const saveCurrentEntry = useCallback(async (): Promise<StorageResult> => {
    // ✅ CORRECTION 1: Vérification stricte de currentEntry
    if (!state.currentEntry || !state.currentEntry.id) {
      return { success: false, error: "Aucune entrée courante valide" };
    }

    // ✅ CORRECTION 2: Assertion de type pour éviter les erreurs null
    const currentEntry = state.currentEntry; // Variable locale non-null

    try {
      setIsSaving(true);
      console.log("🔍 DEBUG: setIsSaving(true) appelé");

      // ✅ NOUVEAU: Délai minimum pour que l'utilisateur voie l'indicateur
      const savePromise = (async () => {
        // Éviter les sauvegardes d'entrées vides
        if (state.text.trim() === "" && currentEntry.content.trim() === "") {
          console.log("📝 Éviter la sauvegarde d'une entrée vide");
          return { success: true };
        }

        // ✅ CORRECTION 3: Créer l'entrée mise à jour avec tous les champs requis
        const updatedEntry: MurmureEntry = {
          id: currentEntry.id, // ✅ Non-null garanti
          date: currentEntry.date,
          filename: currentEntry.filename,
          content: state.text, // ✅ Nouveau contenu
          previewText: currentEntry.previewText,
          createdAt: currentEntry.createdAt,
          updatedAt: new Date(), // ✅ Mise à jour du timestamp
          wordCount: currentEntry.wordCount,
          deletedAt: currentEntry.deletedAt,
          isInTrash: currentEntry.isInTrash || false,
        };

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
              currentEntry: result.data!, // ✅ Non-null garanti par la condition
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
      })();

      // ✅ ATTENDRE AU MINIMUM 500ms pour que l'indicateur soit visible
      const [result] = await Promise.all([
        savePromise,
        new Promise((resolve) => setTimeout(resolve, 500)), // Délai minimum
      ]);

      console.log("🔍 DEBUG: Sauvegarde terminée");
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
      console.log("🔍 DEBUG: setIsSaving(false) appelé");
    }
  }, [state.currentEntry, state.text, sortEntriesByDate, withErrorHandling]);

  // ✅ NOUVEAU: Sauvegarde automatique avec débounce
  const debouncedSave = useDebounce(
    useCallback(() => {
      if (
        state.currentEntry &&
        state.text !== state.currentEntry.content &&
        state.text.trim() !== "" &&
        state.text !== lastSavedContentRef.current
      ) {
        console.log("💾 Sauvegarde automatique déclenchée (debounced)");
        saveCurrentEntry().catch((error) => {
          console.warn("⚠️ Erreur sauvegarde automatique:", error);
        });
      }
    }, [state.currentEntry, state.text, saveCurrentEntry]),
    SAVE_DEBOUNCE_DELAY
  );

  // Créer vraiment une nouvelle session (inchangé)
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

  // Actions sur les entrées (inchangées)
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

  // ✅ AMÉLIORATION: setText avec validation de taille
  const setText = useCallback(
    (newText: string) => {
      // ✅ Validation de la taille du texte
      if (newText.length > MAX_TEXT_LENGTH) {
        console.warn(
          `⚠️ Texte trop long: ${newText.length} caractères (max: ${MAX_TEXT_LENGTH})`
        );
        // Tronquer le texte au lieu de rejeter complètement
        newText = newText.substring(0, MAX_TEXT_LENGTH);
      }

      const processedText = processTextIncremental(
        newText,
        previousTextRef.current
      );

      setState((prev) => ({ ...prev, text: processedText }));
      previousTextRef.current = processedText;

      // ✅ Déclencher la sauvegarde automatique avec débounce
      debouncedSave();
    },
    [processTextIncremental, debouncedSave]
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

  // ✅ SUPPRESSION: Plus besoin de l'ancien effet useEffect avec setTimeout
  // La sauvegarde automatique est maintenant gérée par le débounce dans setText

  // Nettoyage à la désactivation (simplifié)
  useEffect(() => {
    return () => {
      // Le débounce se nettoie automatiquement
      console.log("🧹 Nettoyage useStorage");
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

    // ✅ NOUVEAU: Indicateur de sauvegarde
    isSaving,

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

    // Actions corbeille SANS confirmations (confirmations gérées dans l'UI)
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
