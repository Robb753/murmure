// components/ErrorBoundary.tsx - VERSION CORRIGÉE
import React, { Component, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Met à jour l'état pour afficher l'UI de fallback au prochain rendu
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Vous pouvez logger l'erreur ici
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Interface de fallback personnalisée
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Interface de fallback par défaut
      return (
        <View style={styles.container}>
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>
              Oups, une erreur s&apos;est produite
            </Text>
            <Text style={styles.errorMessage}>
              L&apos;application a rencontré un problème inattendu.
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={this.handleReset}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>

            {__DEV__ && this.state.error && (
              <View style={styles.debugInfo}>
                <Text style={styles.debugTitle}>Détails de l&apos;erreur :</Text>
                <Text style={styles.debugText}>{this.state.error.message}</Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f7f4",
    padding: 20,
  },
  errorCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c2c2c",
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#8b7355",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  debugInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    width: "100%",
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c2c2c",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "monospace",
  },
});

// Export par défaut pour faciliter l'import
export default ErrorBoundary;
