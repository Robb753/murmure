import { useCallback, useMemo } from "react";
import { Alert, Platform } from "react-native";
import { StorageResult, StorageErrorCode } from "@/app/lib/storage";

export interface ErrorHandlerOptions {
  showUserNotification?: boolean;
  logToConsole?: boolean;
  criticalErrorsOnly?: boolean;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    showUserNotification = true,
    logToConsole = true,
    criticalErrorsOnly = false,
  } = options;

  // Types d'erreurs critiques qui nécessitent une notification utilisateur
  // Utiliser useMemo pour éviter la recréation à chaque render
  const criticalErrorCodes = useMemo(
    () => [
      StorageErrorCode.QUOTA_EXCEEDED,
      StorageErrorCode.STORAGE_UNAVAILABLE,
    ],
    []
  );

  // Notification utilisateur cross-platform
  const notifyUser = useCallback(
    (title: string, message: string, critical: boolean = false) => {
      if (Platform.OS === "web") {
        if (critical) {
          window.alert(`${title}: ${message}`);
        } else {
          console.warn(`${title}: ${message}`);
        }
      } else {
        Alert.alert(title, message, [{ text: "OK" }]);
      }
    },
    []
  );

  // Gestionnaire d'erreur pour StorageResult
  const handleStorageResult = useCallback(
    <T>(result: StorageResult<T>, operation: string): T | null => {
      if (result.success && result.data !== undefined) {
        return result.data;
      }

      // Gestion de l'erreur
      const errorMessage = result.error || `Erreur ${operation}`;

      if (logToConsole) {
        console.error(`❌ ${errorMessage}`, {
          operation,
          errorCode: result.errorCode,
          timestamp: new Date().toISOString(),
        });
      }

      // Notification utilisateur pour erreurs critiques
      const isCritical =
        result.errorCode && criticalErrorCodes.includes(result.errorCode);

      if (showUserNotification && (!criticalErrorsOnly || isCritical)) {
        notifyUser("Erreur", errorMessage, isCritical);
      }

      return null;
    },
    [
      showUserNotification,
      logToConsole,
      criticalErrorsOnly,
      criticalErrorCodes,
      notifyUser,
    ]
  );

  // Wrapper pour les opérations async avec gestion d'erreur
  const withErrorHandling = useCallback(
    <T>(
      operation: () => Promise<StorageResult<T>>,
      operationName: string
    ): Promise<T | null> => {
      return operation()
        .then((result) => handleStorageResult(result, operationName))
        .catch((error) => {
          const errorMessage =
            error instanceof Error ? error.message : "Erreur inconnue";

          if (logToConsole) {
            console.error(`❌ Exception ${operationName}:`, error);
          }

          if (showUserNotification) {
            notifyUser(
              "Erreur inattendue",
              `${operationName}: ${errorMessage}`,
              true
            );
          }

          return null;
        });
    },
    [handleStorageResult, logToConsole, showUserNotification, notifyUser]
  );

  // Messages d'erreur personnalisés par code
  const getErrorMessage = useCallback(
    (errorCode?: StorageErrorCode): string => {
      switch (errorCode) {
        case StorageErrorCode.QUOTA_EXCEEDED:
          return "Espace de stockage insuffisant. Veuillez libérer de l'espace.";
        case StorageErrorCode.STORAGE_UNAVAILABLE:
          return "Stockage non disponible. Veuillez réessayer plus tard.";
        case StorageErrorCode.INVALID_DATA:
          return "Données invalides. L'opération ne peut pas être effectuée.";
        case StorageErrorCode.ENTRY_NOT_FOUND:
          return "L'élément demandé n'a pas été trouvé.";
        case StorageErrorCode.SERIALIZATION_ERROR:
          return "Erreur de format des données. Redémarrage recommandé.";
        case StorageErrorCode.NETWORK_ERROR:
          return "Erreur de connexion. Vérifiez votre connexion internet.";
        default:
          return "Une erreur inattendue s'est produite.";
      }
    },
    []
  );

  return {
    handleStorageResult,
    withErrorHandling,
    notifyUser,
    getErrorMessage,
  };
};
