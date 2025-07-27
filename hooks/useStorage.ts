import MurmureStorage, { MurmureEntry } from "@/app/lib/storage";
import { useState, useEffect, useRef, useCallback } from "react";
import { Alert, Share } from "react-native";

export const useStorage = () => {
  const [currentEntry, setCurrentEntry] = useState<MurmureEntry | null>(null);
  const [entries, setEntries] = useState<MurmureEntry[]>([]);
  const [text, setText] = useState("");
  const [wordCount, setWordCount] = useState(0);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sauvegarder l'entrée
  const saveCurrentEntry = useCallback(async () => {
    if (!currentEntry) return;

    try {
      const updatedEntry = { ...currentEntry, content: text };
      await MurmureStorage.saveEntry(updatedEntry);
      setCurrentEntry(updatedEntry);

      const allEntries = await MurmureStorage.loadEntries();
      setEntries(
        allEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      );
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  }, [currentEntry, text]);

  // Charger données (entrée courante + historique)
  const loadData = useCallback(async () => {
    try {
      const entry = await MurmureStorage.getTodayEntryOrCreate();
      const allEntries = await MurmureStorage.loadEntries();

      setCurrentEntry(entry);
      setText(entry.content);
      setWordCount(entry.wordCount);
      setEntries(
        allEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
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

  // Supprimer une session
  const deleteEntry = useCallback(
    (entry: MurmureEntry) => {
      Alert.alert(
        "Supprimer cette session ?",
        `${entry.wordCount} mots du ${entry.date}\n"${
          entry.previewText || "Session vide"
        }"\n\nCette action est irréversible.`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              await MurmureStorage.deleteEntry(entry.id);
              loadData();

              if (currentEntry?.id === entry.id) {
                createNewSession();
              }
            },
          },
        ]
      );
    },
    [currentEntry, loadData, createNewSession]
  );

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
    text,
    wordCount,

    // Actions
    setText,
    loadData,
    saveCurrentEntry,
    createNewSession,
    loadEntry,
    deleteEntry,
    shareEntry,
  };
};
