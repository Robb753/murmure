import React from "react";
import { TouchableOpacity, Text, Platform, Linking } from "react-native";

interface BuyMeACoffeeButtonProps {
  style?: any;
  textStyle?: any;
  showText?: boolean;
  size?: "small" | "medium" | "large";
}

export const BuyMeACoffeeButton: React.FC<BuyMeACoffeeButtonProps> = ({
  style = {},
  textStyle = {},
  showText = true,
  size = "medium",
}) => {
  const handlePress = () => {
    const url = "https://www.buymeacoffee.com/murmureapp";

    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      Linking.openURL(url);
    }
  };

  const sizeStyles = {
    small: { paddingHorizontal: 12, paddingVertical: 8, fontSize: 14 },
    medium: { paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
    large: { paddingHorizontal: 20, paddingVertical: 16, fontSize: 18 },
  };

  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: "#FFDD00",
          borderRadius: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
        style,
      ]}
      onPress={handlePress}
      accessible
      accessibilityRole="button"
      accessibilityLabel="Soutenir le développement avec Buy me a coffee"
    >
      <Text
        style={[
          {
            color: "#000000",
            fontWeight: "600",
            fontSize: currentSize.fontSize,
          },
          textStyle,
        ]}
      >
        ☕ {showText ? "Buy me a coffee" : ""}
      </Text>
    </TouchableOpacity>
  );
};
