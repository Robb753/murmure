import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";
import { Platform, Alert } from "react-native";

// Types pour la gestion d'erreurs
export interface StorageResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: StorageErrorCode;
}

export enum StorageErrorCode {
  STORAGE_UNAVAILABLE = "STORAGE_UNAVAILABLE",
  QUOTA_EXCEEDED = "QUOTA_EXCEEDED",
  INVALID_DATA = "INVALID_DATA",
  ENTRY_NOT_FOUND = "ENTRY_NOT_FOUND",
  SERIALIZATION_ERROR = "SERIALIZATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface MurmureEntry {
  id: string;
  date: string;
  filename: string;
  content: string;
  previewText: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  deletedAt?: Date;
  isInTrash?: boolean;
}

// Interface pour les statistiques de stockage
export interface StorageStats {
  totalEntries: number;
  activeEntries: number;
  trashEntries: number;
  totalWords: number;
  storageUsed: number; // en Ko
}

class MurmureStorage {
  private static readonly ENTRIES_KEY = "murmure_entries";
  private static readonly CURRENT_ENTRY_KEY = "murmure_current_entry";
  private static readonly STORAGE_VERSION_KEY = "murmure_storage_version";
  public static readonly TRASH_RETENTION_DAYS = 30;
  private static readonly CURRENT_VERSION = "1.0.0";
  private static readonly MAX_ENTRIES = 1000; // Limite pour éviter les problèmes de performance

  // Gestionnaire d'erreurs centralisé
  private static handleError<T = void>(
    error: unknown,
    operation: string
  ): StorageResult<T> {
    let errorCode = StorageErrorCode.UNKNOWN_ERROR;
    let errorMessage = "Une erreur inconnue s'est produite";

    if (error instanceof Error) {
      errorMessage = error.message;

      // Analyse du type d'erreur
      if (
        error.message.includes("quota") ||
        error.message.includes("storage full") ||
        error.message.includes("insufficient storage")
      ) {
        errorCode = StorageErrorCode.QUOTA_EXCEEDED;
        errorMessage = "Espace de stockage insuffisant";
      } else if (
        error.message.includes("storage") ||
        error.message.includes("unavailable") ||
        error.message.includes("not available")
      ) {
        errorCode = StorageErrorCode.STORAGE_UNAVAILABLE;
        errorMessage = "Stockage non disponible";
      } else if (
        error.message.includes("JSON") ||
        error.message.includes("parse")
      ) {
        errorCode = StorageErrorCode.SERIALIZATION_ERROR;
        errorMessage = "Erreur de format des données";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorCode = StorageErrorCode.NETWORK_ERROR;
        errorMessage = "Erreur de connexion";
      } else if (
        error.message.includes("not found") ||
        error.message.includes("missing")
      ) {
        errorCode = StorageErrorCode.ENTRY_NOT_FOUND;
        errorMessage = "Entrée non trouvée";
      } else if (
        error.message.includes("invalid") ||
        error.message.includes("malformed")
      ) {
        errorCode = StorageErrorCode.INVALID_DATA;
        errorMessage = "Données invalides";
      }
    }

    const fullMessage = `Erreur ${operation}: ${errorMessage}`;
    console.error(`❌ ${fullMessage}`, error);

    // Notification utilisateur pour les erreurs critiques
    if (
      errorCode === StorageErrorCode.QUOTA_EXCEEDED ||
      errorCode === StorageErrorCode.STORAGE_UNAVAILABLE
    ) {
      this.notifyUser("Erreur critique", fullMessage);
    }

    return {
      success: false,
      error: fullMessage,
      errorCode,
    };
  }

  // Notification utilisateur cross-platform
  private static notifyUser(title: string, message: string): void {
    if (Platform.OS === "web") {
      // Utiliser une notification plus discrète sur le web
      console.warn(`${title}: ${message}`);
      // Optionnel: implémenter un toast ou notification custom
    } else {
      Alert.alert(title, message, [{ text: "OK" }]);
    }
  }

  // Validation des données
  private static validateEntry(entry: any): StorageResult<MurmureEntry> {
    if (!entry || typeof entry !== "object") {
      return this.handleError<MurmureEntry>(
        new Error("Entrée invalide"),
        "validation"
      );
    }

    const requiredFields = ["id", "date", "filename", "content", "createdAt"];
    for (const field of requiredFields) {
      if (!(field in entry)) {
        return this.handleError<MurmureEntry>(
          new Error(`Champ requis manquant: ${field}`),
          "validation"
        );
      }
    }

    try {
      // Normaliser les dates
      const normalizedEntry: MurmureEntry = {
        ...entry,
        createdAt: new Date(entry.createdAt),
        updatedAt: new Date(entry.updatedAt || entry.createdAt),
        deletedAt: entry.deletedAt ? new Date(entry.deletedAt) : undefined,
        isInTrash: entry.isInTrash || false,
        wordCount: entry.wordCount || 0,
        previewText: entry.previewText || "",
      };

      return { success: true, data: normalizedEntry };
    } catch (error) {
      return this.handleError<MurmureEntry>(error, "normalisation des données");
    }
  }

  // Vérifier la disponibilité du stockage
  private static async checkStorageAvailability(): Promise<StorageResult> {
    try {
      const testKey = "__storage_test__";
      const testValue = "test";

      await AsyncStorage.setItem(testKey, testValue);
      const retrievedValue = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);

      if (retrievedValue !== testValue) {
        return this.handleError(
          new Error("Stockage non fonctionnel"),
          "vérification stockage"
        );
      }

      return { success: true };
    } catch (error) {
      return this.handleError(error, "vérification stockage");
    }
  }

  // Migration des données si nécessaire
  private static async migrateIfNeeded(): Promise<StorageResult> {
    try {
      const currentVersion = await AsyncStorage.getItem(
        this.STORAGE_VERSION_KEY
      );

      if (!currentVersion) {
        // Première installation
        await AsyncStorage.setItem(
          this.STORAGE_VERSION_KEY,
          this.CURRENT_VERSION
        );
        console.log("✅ Stockage initialisé pour la première fois");
        return { success: true };
      }

      if (currentVersion !== this.CURRENT_VERSION) {
        console.log(
          `🔄 Migration de ${currentVersion} vers ${this.CURRENT_VERSION}`
        );
        // Ici, vous pouvez ajouter la logique de migration future
        await AsyncStorage.setItem(
          this.STORAGE_VERSION_KEY,
          this.CURRENT_VERSION
        );
      }

      return { success: true };
    } catch (error) {
      return this.handleError(error, "migration des données");
    }
  }

  // Créer une nouvelle entrée
  static createNewEntry(): MurmureEntry {
    const now = new Date();
    const id = `${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`;
    const dateString = format(now, "yyyy-MM-dd-HH-mm-ss");
    const displayDate = format(now, "MMM d");

    return {
      id,
      date: displayDate,
      filename: `[${id}]-[${dateString}].md`,
      content: "",
      previewText: "",
      createdAt: now,
      updatedAt: now,
      wordCount: 0,
      isInTrash: false,
    };
  }

  // Sauvegarder toutes les entrées avec validation
  static async saveEntries(
    entries: MurmureEntry[]
  ): Promise<StorageResult<MurmureEntry[]>> {
    const storageCheck = await this.checkStorageAvailability();
    if (!storageCheck.success) {
      return {
        success: false,
        error: storageCheck.error,
        errorCode: storageCheck.errorCode,
      };
    }

    try {
      // Validation et limitation du nombre d'entrées
      if (entries.length > this.MAX_ENTRIES) {
        console.warn(
          `⚠️ Nombre d'entrées dépassé (${entries.length}), limitation à ${this.MAX_ENTRIES}`
        );
        entries = entries.slice(0, this.MAX_ENTRIES);
      }

      // Validation de chaque entrée
      const validatedEntries: MurmureEntry[] = [];
      for (const entry of entries) {
        const validation = this.validateEntry(entry);
        if (validation.success && validation.data) {
          validatedEntries.push(validation.data);
        } else {
          console.warn(
            `⚠️ Entrée invalide ignorée: ${entry?.id || "ID manquant"}`
          );
        }
      }

      const serializedData = JSON.stringify(validatedEntries);

      // Vérifier la taille des données
      const sizeInKB = new Blob([serializedData]).size / 1024;
      if (sizeInKB > 5000) {
        // Limite à 5MB
        return this.handleError<MurmureEntry[]>(
          new Error(`Données trop volumineuses: ${sizeInKB.toFixed(2)}KB`),
          "sauvegarde"
        );
      }

      await AsyncStorage.setItem(this.ENTRIES_KEY, serializedData);
      console.log(
        `✅ ${validatedEntries.length} entrées sauvegardées (${sizeInKB.toFixed(
          2
        )}KB)`
      );

      return { success: true, data: validatedEntries };
    } catch (error) {
      return this.handleError<MurmureEntry[]>(error, "sauvegarde des entrées");
    }
  }

  // Charger toutes les entrées avec récupération d'erreur
  static async loadEntries(): Promise<StorageResult<MurmureEntry[]>> {
    const storageCheck = await this.checkStorageAvailability();
    if (!storageCheck.success) {
      return {
        success: false,
        error: storageCheck.error,
        errorCode: storageCheck.errorCode,
      };
    }

    try {
      // Migration si nécessaire
      const migrationResult = await this.migrateIfNeeded();
      if (!migrationResult.success) {
        return {
          success: false,
          error: migrationResult.error,
          errorCode: migrationResult.errorCode,
        };
      }

      const stored = await AsyncStorage.getItem(this.ENTRIES_KEY);

      if (!stored) {
        console.log("📭 Aucune entrée stockée, retour d'un tableau vide");
        return { success: true, data: [] };
      }

      const parsedEntries = JSON.parse(stored);

      if (!Array.isArray(parsedEntries)) {
        return this.handleError<MurmureEntry[]>(
          new Error("Format de données invalide (pas un tableau)"),
          "chargement"
        );
      }

      // Validation et normalisation de chaque entrée
      const validEntries: MurmureEntry[] = [];
      let invalidCount = 0;

      for (const entry of parsedEntries) {
        const validation = this.validateEntry(entry);
        if (validation.success && validation.data) {
          validEntries.push(validation.data);
        } else {
          invalidCount++;
          console.warn(`⚠️ Entrée corrompue ignorée:`, entry);
        }
      }

      if (invalidCount > 0) {
        console.warn(`⚠️ ${invalidCount} entrée(s) corrompue(s) ignorée(s)`);
        // Sauvegarder les entrées valides pour nettoyer les données corrompues
        await this.saveEntries(validEntries);
      }

      console.log(`✅ ${validEntries.length} entrées chargées avec succès`);
      return { success: true, data: validEntries };
    } catch (error) {
      // Tentative de récupération en cas d'erreur de parsing
      if (error instanceof SyntaxError) {
        console.warn("🔧 Tentative de récupération des données corrompues...");
        try {
          await AsyncStorage.removeItem(this.ENTRIES_KEY);
          console.log(
            "🧹 Données corrompues supprimées, redémarrage avec un état propre"
          );
          return { success: true, data: [] };
        } catch (cleanupError) {
          return this.handleError<MurmureEntry[]>(
            cleanupError,
            "nettoyage des données corrompues"
          );
        }
      }

      return this.handleError<MurmureEntry[]>(error, "chargement des entrées");
    }
  }

  // Charger seulement les entrées actives
  static async loadActiveEntries(): Promise<StorageResult<MurmureEntry[]>> {
    const result = await this.loadEntries();
    if (!result.success || !result.data) return result;

    const activeEntries = result.data.filter((entry) => !entry.isInTrash);
    return { success: true, data: activeEntries };
  }

  // Charger seulement les entrées dans la corbeille
  static async loadTrashEntries(): Promise<StorageResult<MurmureEntry[]>> {
    const result = await this.loadEntries();
    if (!result.success || !result.data) return result;

    const trashEntries = result.data.filter((entry) => entry.isInTrash);
    return { success: true, data: trashEntries };
  }

  // Sauvegarder une entrée spécifique
  static async saveEntry(
    entry: MurmureEntry
  ): Promise<StorageResult<MurmureEntry>> {
    try {
      const validation = this.validateEntry(entry);
      if (!validation.success || !validation.data) return validation;

      const validatedEntry = validation.data;
      const entriesResult = await this.loadEntries();
      if (!entriesResult.success || !entriesResult.data) {
        return {
          success: false,
          error: entriesResult.error,
          errorCode: entriesResult.errorCode,
        };
      }

      const entries = entriesResult.data;
      const existingIndex = entries.findIndex(
        (e) => e.id === validatedEntry.id
      );

      // Mettre à jour les métadonnées
      const updatedEntry: MurmureEntry = {
        ...validatedEntry,
        previewText: this.generatePreview(validatedEntry.content),
        wordCount: this.countWords(validatedEntry.content),
        updatedAt: new Date(),
      };

      if (existingIndex >= 0) {
        entries[existingIndex] = updatedEntry;
      } else {
        entries.unshift(updatedEntry); // Ajouter au début
      }

      const saveResult = await this.saveEntries(entries);
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error,
          errorCode: saveResult.errorCode,
        };
      }

      console.log(`✅ Entrée sauvegardée: ${updatedEntry.filename}`);
      return { success: true, data: updatedEntry };
    } catch (error) {
      return this.handleError<MurmureEntry>(error, "sauvegarde d'entrée");
    }
  }

  // Déplacer une entrée vers la corbeille
  static async moveToTrash(entryId: string): Promise<StorageResult> {
    if (!entryId || typeof entryId !== "string") {
      return this.handleError(
        new Error("ID d'entrée invalide"),
        "déplacement corbeille"
      );
    }

    try {
      const entriesResult = await this.loadEntries();
      if (!entriesResult.success || !entriesResult.data) {
        return {
          success: false,
          error: entriesResult.error,
          errorCode: entriesResult.errorCode,
        };
      }

      const entries = entriesResult.data;
      const entryIndex = entries.findIndex((e) => e.id === entryId);

      if (entryIndex < 0) {
        return this.handleError(
          new Error(`Entrée non trouvée: ${entryId}`),
          "déplacement corbeille"
        );
      }

      entries[entryIndex] = {
        ...entries[entryIndex],
        isInTrash: true,
        deletedAt: new Date(),
      };

      const saveResult = await this.saveEntries(entries);
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error,
          errorCode: saveResult.errorCode,
        };
      }

      console.log(`🗑️ Entrée déplacée vers la corbeille: ${entryId}`);
      return { success: true };
    } catch (error) {
      return this.handleError(error, "déplacement vers corbeille");
    }
  }

  // Restaurer une entrée depuis la corbeille
  static async restoreFromTrash(entryId: string): Promise<StorageResult> {
    if (!entryId || typeof entryId !== "string") {
      return this.handleError(
        new Error("ID d'entrée invalide"),
        "restauration"
      );
    }

    try {
      const entriesResult = await this.loadEntries();
      if (!entriesResult.success || !entriesResult.data) {
        return {
          success: false,
          error: entriesResult.error,
          errorCode: entriesResult.errorCode,
        };
      }

      const entries = entriesResult.data;
      const entryIndex = entries.findIndex((e) => e.id === entryId);

      if (entryIndex < 0) {
        return this.handleError(
          new Error(`Entrée non trouvée: ${entryId}`),
          "restauration"
        );
      }

      entries[entryIndex] = {
        ...entries[entryIndex],
        isInTrash: false,
        deletedAt: undefined,
      };

      const saveResult = await this.saveEntries(entries);
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error,
          errorCode: saveResult.errorCode,
        };
      }

      console.log(`♻️ Entrée restaurée: ${entryId}`);
      return { success: true };
    } catch (error) {
      return this.handleError(error, "restauration depuis corbeille");
    }
  }

  // Supprimer définitivement une entrée
  static async deleteEntryPermanently(entryId: string): Promise<StorageResult> {
    if (!entryId || typeof entryId !== "string") {
      return this.handleError(
        new Error("ID d'entrée invalide"),
        "suppression définitive"
      );
    }

    try {
      const entriesResult = await this.loadEntries();
      if (!entriesResult.success || !entriesResult.data) {
        return {
          success: false,
          error: entriesResult.error,
          errorCode: entriesResult.errorCode,
        };
      }

      const entries = entriesResult.data;
      const initialLength = entries.length;
      const filteredEntries = entries.filter((e) => e.id !== entryId);

      if (filteredEntries.length === initialLength) {
        return this.handleError(
          new Error(`Entrée non trouvée: ${entryId}`),
          "suppression définitive"
        );
      }

      const saveResult = await this.saveEntries(filteredEntries);
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error,
          errorCode: saveResult.errorCode,
        };
      }

      console.log(`💀 Entrée supprimée définitivement: ${entryId}`);
      return { success: true };
    } catch (error) {
      return this.handleError(error, "suppression définitive");
    }
  }

  // Vider la corbeille
  static async emptyTrash(): Promise<StorageResult> {
    try {
      const entriesResult = await this.loadEntries();
      if (!entriesResult.success || !entriesResult.data) {
        return {
          success: false,
          error: entriesResult.error,
          errorCode: entriesResult.errorCode,
        };
      }

      const entries = entriesResult.data;
      const activeEntries = entries.filter((e) => !e.isInTrash);
      const trashCount = entries.length - activeEntries.length;

      if (trashCount === 0) {
        console.log("🧹 Corbeille déjà vide");
        return { success: true };
      }

      const saveResult = await this.saveEntries(activeEntries);
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error,
          errorCode: saveResult.errorCode,
        };
      }

      console.log(`🧹 Corbeille vidée: ${trashCount} entrée(s) supprimée(s)`);
      return { success: true };
    } catch (error) {
      return this.handleError(error, "vidage corbeille");
    }
  }

  // Nettoyage automatique des entrées expirées
  static async cleanupExpiredTrashEntries(): Promise<StorageResult> {
    try {
      const entriesResult = await this.loadEntries();
      if (!entriesResult.success || !entriesResult.data) {
        return {
          success: false,
          error: entriesResult.error,
          errorCode: entriesResult.errorCode,
        };
      }

      const entries = entriesResult.data;
      const now = new Date();
      const retentionMs = this.TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

      let cleanedCount = 0;
      const filteredEntries = entries.filter((entry) => {
        if (entry.isInTrash && entry.deletedAt) {
          const daysSinceDeleted = now.getTime() - entry.deletedAt.getTime();
          if (daysSinceDeleted > retentionMs) {
            cleanedCount++;
            return false; // Supprimer définitivement
          }
        }
        return true; // Garder
      });

      if (cleanedCount > 0) {
        const saveResult = await this.saveEntries(filteredEntries);
        if (!saveResult.success) {
          return {
            success: false,
            error: saveResult.error,
            errorCode: saveResult.errorCode,
          };
        }

        console.log(
          `🧹 Nettoyage automatique: ${cleanedCount} entrée(s) expirée(s) supprimée(s)`
        );
      }

      return { success: true };
    } catch (error) {
      return this.handleError(error, "nettoyage automatique");
    }
  }

  // Obtenir les statistiques de stockage
  static async getStorageStats(): Promise<StorageResult<StorageStats>> {
    try {
      const entriesResult = await this.loadEntries();
      if (!entriesResult.success || !entriesResult.data) {
        return {
          success: false,
          error: entriesResult.error,
          errorCode: entriesResult.errorCode,
        };
      }

      const entries = entriesResult.data;
      const activeEntries = entries.filter((e) => !e.isInTrash);
      const trashEntries = entries.filter((e) => e.isInTrash);

      const totalWords = entries.reduce(
        (sum, entry) => sum + entry.wordCount,
        0
      );

      // Estimation de la taille de stockage
      const dataString = JSON.stringify(entries);
      const storageUsed = new Blob([dataString]).size / 1024; // en Ko

      const stats: StorageStats = {
        totalEntries: entries.length,
        activeEntries: activeEntries.length,
        trashEntries: trashEntries.length,
        totalWords,
        storageUsed: Math.round(storageUsed * 100) / 100,
      };

      return { success: true, data: stats };
    } catch (error) {
      return this.handleError<StorageStats>(error, "calcul des statistiques");
    }
  }

  // Fonctions utilitaires existantes avec gestion d'erreur

  // Obtenir le nombre de jours restants avant suppression définitive
  static getDaysUntilDeletion = (entry: MurmureEntry): number | null => {
    if (!entry.isInTrash || !entry.deletedAt) return null;

    try {
      const now = new Date();
      const daysSinceDeleted = Math.floor(
        (now.getTime() - entry.deletedAt.getTime()) / (24 * 60 * 60 * 1000)
      );

      return Math.max(
        0,
        MurmureStorage.TRASH_RETENTION_DAYS - daysSinceDeleted
      );
    } catch (error) {
      console.warn("Erreur calcul jours suppression:", error);
      return null;
    }
  };

  // Gestion des entrées courantes avec validation
  static async saveCurrentEntryId(entryId: string): Promise<StorageResult> {
    if (!entryId || typeof entryId !== "string") {
      return this.handleError(
        new Error("ID d'entrée invalide"),
        "sauvegarde ID courant"
      );
    }

    try {
      await AsyncStorage.setItem(this.CURRENT_ENTRY_KEY, entryId);
      return { success: true };
    } catch (error) {
      return this.handleError(error, "sauvegarde ID entrée courante");
    }
  }

  static async loadCurrentEntryId(): Promise<StorageResult<string | null>> {
    try {
      const entryId = await AsyncStorage.getItem(this.CURRENT_ENTRY_KEY);
      return { success: true, data: entryId };
    } catch (error) {
      return this.handleError<string | null>(
        error,
        "chargement ID entrée courante"
      );
    }
  }

  // Fonctions utilitaires privées
  private static generatePreview(content: string): string {
    try {
      const cleaned = content.replace(/\n/g, " ").trim();
      if (cleaned.length === 0) return "";
      return cleaned.length > 50 ? cleaned.substring(0, 50) + "..." : cleaned;
    } catch (error) {
      console.warn("Erreur génération preview:", error);
      return "";
    }
  }

  private static countWords(content: string): number {
    try {
      const words = content
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
      return words.length;
    } catch (error) {
      console.warn("Erreur comptage mots:", error);
      return 0;
    }
  }

  // Obtenir une entrée pour aujourd'hui ou créer une nouvelle
  static async getTodayEntryOrCreate(): Promise<StorageResult<MurmureEntry>> {
    try {
      const activeEntriesResult = await this.loadActiveEntries();
      if (!activeEntriesResult.success || !activeEntriesResult.data) {
        return {
          success: false,
          error: activeEntriesResult.error,
          errorCode: activeEntriesResult.errorCode,
        };
      }

      const entries = activeEntriesResult.data;
      const today = format(new Date(), "MMM d");

      // Chercher une entrée vide d'aujourd'hui
      const todayEmptyEntry = entries.find(
        (entry) => entry.date === today && entry.content.trim() === ""
      );

      if (todayEmptyEntry) {
        return { success: true, data: todayEmptyEntry };
      }

      // Créer une nouvelle entrée
      const newEntry = this.createNewEntry();

      // Si c'est la première entrée, ajouter le message de bienvenue
      if (entries.length === 0) {
        newEntry.content = this.getWelcomeMessage();
        newEntry.previewText = this.generatePreview(newEntry.content);
        newEntry.wordCount = this.countWords(newEntry.content);
      }

      const saveResult = await this.saveEntry(newEntry);
      if (!saveResult.success || !saveResult.data) {
        return {
          success: false,
          error: saveResult.error,
          errorCode: saveResult.errorCode,
        };
      }

      return { success: true, data: saveResult.data };
    } catch (error) {
      return this.handleError<MurmureEntry>(error, "création entrée du jour");
    }
  }

  // Message de bienvenue
  private static getWelcomeMessage(): string {
    return `Bienvenue dans Murmure 🌙

Ton espace d'écriture libre.

Murmure est inspiré de Freewrite - un outil pour l'écriture libre et spontanée.

Le principe est simple :
1. Lance le timer (15 min par défaut)
2. Écris sans t'arrêter
3. Ne corrige pas, laisse couler tes pensées
4. Explore tes idées sans filtre

L'écriture libre t'aide à :
• Clarifier tes pensées
• Débloquer ta créativité  
• Traiter tes émotions
• Prendre des décisions

Quelques prompts pour commencer :
• "Aujourd'hui je me sens..."
• "Mon plus grand défi en ce moment..."
• "Si je pouvais changer une chose..."
• "Ce qui m'excite le plus..."

Prêt à murmurer tes premières pensées ?`;
  }

  // Export et initialisation
  static async exportAllEntries(): Promise<StorageResult<string>> {
    const activeEntriesResult = await this.loadActiveEntries();
    if (!activeEntriesResult.success || !activeEntriesResult.data) {
      return {
        success: false,
        error: activeEntriesResult.error,
        errorCode: activeEntriesResult.errorCode,
      };
    }

    try {
      const exportData = JSON.stringify(activeEntriesResult.data, null, 2);
      return { success: true, data: exportData };
    } catch (error) {
      return this.handleError<string>(error, "export des entrées");
    }
  }

  static async exportTrashEntries(): Promise<StorageResult<string>> {
    const trashEntriesResult = await this.loadTrashEntries();
    if (!trashEntriesResult.success || !trashEntriesResult.data) {
      return {
        success: false,
        error: trashEntriesResult.error,
        errorCode: trashEntriesResult.errorCode,
      };
    }

    try {
      const exportData = JSON.stringify(trashEntriesResult.data, null, 2);
      return { success: true, data: exportData };
    } catch (error) {
      return this.handleError<string>(error, "export de la corbeille");
    }
  }

  // Initialisation avec nettoyage automatique
  static async initializeAutoCleanup(): Promise<StorageResult> {
    const cleanupResult = await this.cleanupExpiredTrashEntries();
    if (!cleanupResult.success) {
      console.warn("⚠️ Nettoyage automatique échoué:", cleanupResult.error);
      // Ne pas faire échouer l'initialisation pour un problème de nettoyage
    }
    return { success: true };
  }
}

export default MurmureStorage;
