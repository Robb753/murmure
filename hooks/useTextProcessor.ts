// hooks/useTextProcessor.ts
import { useCallback, useMemo } from "react";

export interface TextProcessorOptions {
  autoLowercase: boolean;
  preserveAcronyms: boolean;
  preserveStartOfSentence: boolean;
  preserveProperNouns: boolean;
}

export const useTextProcessor = (options: TextProcessorOptions) => {
  const {
    autoLowercase = true,
    preserveAcronyms = true,
    preserveStartOfSentence = false, // Pour l'écriture libre, on supprime même en début de phrase
    preserveProperNouns = false, // Pour l'écriture libre, on supprime les noms propres
  } = options;

  // Liste des mots/patterns à préserver (extensible)
  const preservedPatterns = useMemo(
    () => [
      // URLs
      /https?:\/\/[^\s]+/gi,
      /www\.[^\s]+/gi,
      // Emails
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
      // Acronymes courants (2-4 lettres majuscules)
      /\b[A-Z]{2,4}\b/g,
      // Codes, références (lettres + chiffres)
      /\b[A-Z]+\d+|\d+[A-Z]+\b/g,
    ],
    []
  );

  // Fonction principale de traitement du texte
  const processText = useCallback(
    (text: string): string => {
      if (!autoLowercase) return text;

      // Sauvegarder les patterns à préserver
      const preservedMatches: { pattern: string; placeholder: string }[] = [];
      let processedText = text;

      if (preserveAcronyms) {
        preservedPatterns.forEach((pattern, index) => {
          const matches = text.match(pattern);
          if (matches) {
            matches.forEach((match, matchIndex) => {
              const placeholder = `__PRESERVED_${index}_${matchIndex}__`;
              preservedMatches.push({ pattern: match, placeholder });
              processedText = processedText.replace(match, placeholder);
            });
          }
        });
      }

      // Traitement intelligent des majuscules
      let result = "";
      for (let i = 0; i < processedText.length; i++) {
        const char = processedText[i];
        const prevChar = i > 0 ? processedText[i - 1] : "";
        const nextChar =
          i < processedText.length - 1 ? processedText[i + 1] : "";

        if (char >= "A" && char <= "Z") {
          let shouldKeepUppercase = false;

          // Préserver le début de phrase si activé
          if (preserveStartOfSentence && i > 0) {
            const beforeSentence = processedText.substring(0, i);
            if (/[.!?]\s*$/.test(beforeSentence.trim())) {
              shouldKeepUppercase = true;
            }
          }

          // Préserver les acronymes isolés (lettre seule avec espaces)
          if (preserveAcronyms && prevChar === " " && nextChar === " ") {
            shouldKeepUppercase = true;
          }

          // Préserver les débuts de mots qui ressemblent à des noms propres
          if (preserveProperNouns && (i === 0 || prevChar === " ")) {
            // Liste basique de noms propres courants (extensible)
            const nextWord = processedText.substring(i).split(/\s/)[0];
            const commonNames = [
              "Paris",
              "France",
              "Europe",
              "Amérique",
              "Asie",
              "Afrique",
              "Google",
              "Apple",
              "Microsoft",
              "Facebook",
              "Twitter",
              "JavaScript",
              "Python",
              "Java",
              "TypeScript",
            ];
            if (
              commonNames.some(
                (name) => nextWord.toLowerCase() === name.toLowerCase()
              )
            ) {
              shouldKeepUppercase = true;
            }
          }

          result += shouldKeepUppercase ? char : char.toLowerCase();
        } else {
          result += char;
        }
      }

      // Restaurer les patterns préservés
      preservedMatches.forEach(({ pattern, placeholder }) => {
        result = result.replace(placeholder, pattern);
      });

      return result;
    },
    [
      autoLowercase,
      preserveAcronyms,
      preserveStartOfSentence,
      preserveProperNouns,
      preservedPatterns,
    ]
  );

  // Fonction pour traiter le texte en temps réel (optimisée pour les gros textes)
  const processTextIncremental = useCallback(
    (newText: string, oldText: string): string => {
      // Si le texte n'a pas beaucoup changé, traiter seulement la différence
      if (
        newText.length - oldText.length === 1 &&
        newText.startsWith(oldText)
      ) {
        // Un seul caractère ajouté
        const addedChar = newText[newText.length - 1];
        if (addedChar >= "A" && addedChar <= "Z") {
          const processedChar = processText(addedChar);
          return oldText + processedChar;
        }
        return newText;
      }

      // Pour les changements plus importants, traitement complet
      return processText(newText);
    },
    [processText]
  );

  // Fonction pour obtenir des statistiques sur le traitement
  const getProcessingStats = useCallback(
    (originalText: string) => {
      const processedText = processText(originalText);
      const uppercaseCount = (originalText.match(/[A-Z]/g) || []).length;
      const preservedCount = (processedText.match(/[A-Z]/g) || []).length;

      return {
        originalLength: originalText.length,
        processedLength: processedText.length,
        uppercaseRemoved: uppercaseCount - preservedCount,
        uppercasePreserved: preservedCount,
        processingRate:
          uppercaseCount > 0
            ? ((uppercaseCount - preservedCount) / uppercaseCount) * 100
            : 0,
      };
    },
    [processText]
  );

  return {
    processText,
    processTextIncremental,
    getProcessingStats,
  };
};
