// components/HighlightedText.tsx
import React from "react";
import { Text, TextStyle, StyleProp } from "react-native";

interface HighlightedTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
  highlightStyle?: TextStyle;
  numberOfLines?: number;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  style,
  highlightStyle = { fontWeight: "600", backgroundColor: "#ffeb3b40" },
  numberOfLines,
}) => {
  // Analyser le texte et identifier les parties à surligner (marquées par **)
  const parseHighlights = (text: string) => {
    const parts = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Ajouter le texte avant le match
      if (match.index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, match.index),
          highlighted: false,
        });
      }

      // Ajouter le texte surligné
      parts.push({
        text: match[1], // Le contenu entre les **
        highlighted: true,
      });

      lastIndex = regex.lastIndex;
    }

    // Ajouter le reste du texte
    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        highlighted: false,
      });
    }

    return parts;
  };

  const parts = parseHighlights(text);

  // Si aucun surlignage n'est nécessaire
  if (parts.length === 0 || (parts.length === 1 && !parts[0].highlighted)) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text.replace(/\*\*/g, "")} {/* Supprimer les marqueurs ** */}
      </Text>
    );
  }

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((part, index) => (
        <Text
          key={index}
          style={part.highlighted ? [style, highlightStyle] : style}
        >
          {part.text}
        </Text>
      ))}
    </Text>
  );
};
