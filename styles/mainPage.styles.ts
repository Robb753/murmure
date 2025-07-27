import { StyleSheet } from "react-native";

export const mainPageStyles = StyleSheet.create({
  mainArea: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },

  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },

  headerButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },

  // Zone d'écriture
  writingContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  paperSheet: {
    width: "100%",
    maxWidth: 1150,
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },

  textInput: {
    flex: 1,
    width: "100%",
    textAlign: "center",
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },

  footerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },

  footerCenter: {
    flex: 2,
    alignItems: "center",
  },

  footerRight: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
  },

  footerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 35,
    alignItems: "center",
  },

  footerButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },

  fontNameDisplay: {
    fontSize: 11,
    fontWeight: "400",
    marginLeft: 4,
  },

  wordCount: {
    fontSize: 16,
  },

  runningIndicator: {
    fontSize: 16,
    fontWeight: "500",
  },
});
