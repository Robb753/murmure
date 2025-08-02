import { StyleSheet, Platform } from "react-native";

export const timerStyles = StyleSheet.create({
  timerSection: {
    alignItems: "center",
    gap: 6,
  },

  durationButtons: {
    flexDirection: "row",
    gap: 3,
  },

  durationButton: {
    paddingHorizontal: 6, // ✅ RÉDUIT: était 8
    paddingVertical: 3, // ✅ RÉDUIT: était 4
    borderRadius: 6, // ✅ RÉDUIT: était 8
  },

  durationButtonText: {
    fontSize: Platform.OS === "web" ? 11 : 12, // ✅ RÉDUIT: était 12/14
    fontWeight: "500",
  },

  timerButton: {
    paddingHorizontal: 12, // ✅ RÉDUIT: était 16
    paddingVertical: 6, // ✅ RÉDUIT: était 8
    borderRadius: 10, // ✅ RÉDUIT: était 12
    minWidth: 100, // ✅ RÉDUIT: était 120
  },

  timerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4, // ✅ RÉDUIT: était 6
  },

  timerIcon: {
    fontSize: Platform.OS === "web" ? 11 : 12, // ✅ RÉDUIT: était 12/16
  },

  timerText: {
    fontSize: Platform.OS === "web" ? 13 : 15, // ✅ RÉDUIT: était 16
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
});
