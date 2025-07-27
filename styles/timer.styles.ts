import { StyleSheet, Platform } from "react-native";

export const timerStyles = StyleSheet.create({
  timerSection: {
    alignItems: "center",
    gap: 8,
  },

  durationButtons: {
    flexDirection: "row",
    gap: 4,
  },

  durationButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  durationButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },

  timerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 120,
  },

  timerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  timerIcon: {
    fontSize: 12,
  },

  timerText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});
