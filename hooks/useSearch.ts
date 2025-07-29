// hooks/useSearch.ts - Version finale corrigée
import { useState, useMemo, useCallback } from "react";
import { MurmureEntry } from "@/app/lib/storage";

export interface SearchResult {
  entry: MurmureEntry;
  matchScore: number;
  matchedFields: string[];
  highlightedPreview?: string;
}

export interface SearchOptions {
  searchInContent: boolean;
  searchInPreview: boolean;
  searchInDate: boolean;
  caseSensitive: boolean;
  minScore: number;
  minQueryLength: number; // ✅ Longueur minimale pour déclencher la recherche
  searchWholeWordsOnly: boolean; // ✅ Recherche par mots complets
}

export const useSearch = (entries: MurmureEntry[], options: SearchOptions) => {
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Fonction pour valider si la requête est recherchable
  const isValidSearchQuery = useCallback(
    (query: string): boolean => {
      const trimmed = query.trim();

      // Longueur minimale
      if (trimmed.length < options.minQueryLength) {
        return false;
      }

      // Si on cherche par mots complets uniquement
      if (options.searchWholeWordsOnly) {
        // Vérifier qu'on a au moins un mot de 3+ caractères
        const words = trimmed.split(/\s+/).filter((word) => word.length >= 3);
        return words.length > 0;
      }

      return true;
    },
    [options.minQueryLength, options.searchWholeWordsOnly]
  );

  const normalizeText = useCallback(
    (text: string, caseSensitive: boolean = false): string => {
      let normalized = text.trim();
      if (!caseSensitive) normalized = normalized.toLowerCase();
      return normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    },
    []
  );

  const calculateMatchScore = useCallback(
    (text: string, query: string, caseSensitive: boolean = false): number => {
      if (!query.trim()) return 0;

      const normalizedText = normalizeText(text, caseSensitive);
      const normalizedQuery = normalizeText(query, caseSensitive);

      // ✅ Recherche par mots complets si activée
      if (options.searchWholeWordsOnly) {
        const queryWords = normalizedQuery
          .split(/\s+/)
          .filter((word) => word.length >= 3);
        const textWords = normalizedText.split(/\s+/);

        let matchingWords = 0;
        let exactMatches = 0;

        queryWords.forEach((queryWord) => {
          // Correspondance exacte de mot (score max)
          if (textWords.includes(queryWord)) {
            exactMatches++;
            matchingWords++;
          }
          // Correspondance partielle au début d'un mot (score moyen)
          else if (
            textWords.some((textWord) => textWord.startsWith(queryWord))
          ) {
            matchingWords += 0.7;
          }
          // Correspondance partielle dans un mot (score faible)
          else if (textWords.some((textWord) => textWord.includes(queryWord))) {
            matchingWords += 0.3;
          }
        });

        if (queryWords.length === 0) return 0;

        // Bonus pour les correspondances exactes
        const exactBonus = (exactMatches / queryWords.length) * 0.5;
        const baseScore = matchingWords / queryWords.length;

        return Math.min(1, baseScore + exactBonus);
      }

      // ✅ Recherche classique pour les requêtes courtes acceptées
      if (normalizedText.includes(normalizedQuery)) {
        const exactMatch = normalizedText === normalizedQuery ? 1 : 0.8;
        const startsWith = normalizedText.startsWith(normalizedQuery)
          ? 0.9
          : 0.7;
        return normalizedText === normalizedQuery ? exactMatch : startsWith;
      }

      const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);
      const textWords = normalizedText.split(/\s+/);

      const matchingWords = queryWords.filter((queryWord) =>
        textWords.some(
          (textWord) =>
            textWord.includes(queryWord) || queryWord.includes(textWord)
        )
      ).length;

      return queryWords.length > 0 ? matchingWords / queryWords.length : 0;
    },
    [normalizeText, options.searchWholeWordsOnly]
  );

  const highlightMatches = useCallback(
    (text: string, query: string, caseSensitive: boolean = false): string => {
      if (!query.trim()) return text;

      const normalizedQuery = normalizeText(query, caseSensitive);

      // ✅ Pour la recherche par mots complets, surligner les mots entiers
      if (options.searchWholeWordsOnly) {
        const queryWords = normalizedQuery
          .split(/\s+/)
          .filter((word) => word.length >= 3);
        let highlighted = text;

        queryWords.forEach((word) => {
          // Correspondance de mots complets avec limites de mots
          const regex = new RegExp(
            `\\b(${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`,
            caseSensitive ? "g" : "gi"
          );
          highlighted = highlighted.replace(regex, "**$1**");
        });

        return highlighted;
      }

      // ✅ Surlignage classique pour les autres cas
      const queryWords = normalizedQuery
        .split(/\s+/)
        .filter((word) => word.length > 1);
      let highlighted = text;

      queryWords.forEach((word) => {
        const regex = new RegExp(
          `(${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
          caseSensitive ? "g" : "gi"
        );
        highlighted = highlighted.replace(regex, "**$1**");
      });

      return highlighted;
    },
    [normalizeText, options.searchWholeWordsOnly]
  );

  // ✅ Fonction de recherche avec validation de requête
  const performSearch = useCallback(
    (query: string, entriesList: MurmureEntry[]): SearchResult[] => {
      // ✅ Vérifier si la requête est valide pour la recherche
      if (!isValidSearchQuery(query)) {
        return [];
      }

      return entriesList
        .map((entry) => {
          let totalScore = 0;
          let matchCount = 0;
          const matchedFields: string[] = [];
          let highlightedPreview = entry.previewText;

          if (options.searchInContent && entry.content) {
            const score = calculateMatchScore(
              entry.content,
              query,
              options.caseSensitive
            );
            if (score > 0) {
              totalScore += score * 2;
              matchCount++;
              matchedFields.push("contenu");
              const contentPreview =
                entry.content.length > 100
                  ? entry.content.substring(0, 100) + "..."
                  : entry.content;
              highlightedPreview = highlightMatches(
                contentPreview,
                query,
                options.caseSensitive
              );
            }
          }

          if (options.searchInPreview && entry.previewText) {
            const score = calculateMatchScore(
              entry.previewText,
              query,
              options.caseSensitive
            );
            if (score > 0) {
              totalScore += score;
              matchCount++;
              matchedFields.push("aperçu");
              if (!matchedFields.includes("contenu")) {
                highlightedPreview = highlightMatches(
                  entry.previewText,
                  query,
                  options.caseSensitive
                );
              }
            }
          }

          if (options.searchInDate) {
            const dateString = `${
              entry.date
            } ${entry.createdAt.toLocaleDateString("fr-FR")}`;
            const score = calculateMatchScore(
              dateString,
              query,
              options.caseSensitive
            );
            if (score > 0) {
              totalScore += score * 0.5;
              matchCount++;
              matchedFields.push("date");
            }
          }

          const finalScore = matchCount > 0 ? totalScore / matchCount : 0;

          return {
            entry,
            matchScore: finalScore,
            matchedFields,
            highlightedPreview: highlightedPreview || entry.previewText,
          };
        })
        .filter((result) => result.matchScore >= options.minScore)
        .sort((a, b) => b.matchScore - a.matchScore);
    },
    [calculateMatchScore, highlightMatches, options, isValidSearchQuery]
  );

  // ✅ Résultats mémorisés avec validation
  const searchResults = useMemo(() => {
    return performSearch(searchQuery, entries);
  }, [searchQuery, entries, performSearch]);

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // ✅ Statistiques avec validation de requête - dépendances corrigées
  const searchStats = useMemo(() => {
    const isQueryValid = isValidSearchQuery(searchQuery);
    const isActive = searchQuery.trim().length > 0;

    return {
      totalResults: searchResults.length,
      hasResults: searchResults.length > 0,
      isActive,
      isValidQuery: isQueryValid,
      queryTooShort:
        isActive &&
        !isQueryValid &&
        searchQuery.trim().length < options.minQueryLength,
      needsWholeWords:
        isActive && !isQueryValid && options.searchWholeWordsOnly,
      averageScore:
        searchResults.length > 0
          ? searchResults.reduce((sum, result) => sum + result.matchScore, 0) /
            searchResults.length
          : 0,
    };
  }, [
    searchResults,
    searchQuery,
    isValidSearchQuery,
    options.minQueryLength,
    options.searchWholeWordsOnly,
  ]);

  const isSearching =
    searchQuery.trim().length > 0 &&
    searchResults.length === 0 &&
    searchStats.isValidQuery;

  return {
    searchQuery,
    searchResults,
    isSearching,
    searchStats,
    updateSearchQuery,
    clearSearch,
    highlightMatches: useCallback(
      (text: string) =>
        highlightMatches(text, searchQuery, options.caseSensitive),
      [searchQuery, options.caseSensitive, highlightMatches]
    ),
  };
};
