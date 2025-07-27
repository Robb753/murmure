import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";

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

class MurmureStorage {
  private static readonly ENTRIES_KEY = "murmure_entries";
  private static readonly CURRENT_ENTRY_KEY = "murmure_current_entry";
  public static readonly TRASH_RETENTION_DAYS = 30;

  // Créer une nouvelle entrée (inspiré du HumanEntry de Freewrite)
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

  // Sauvegarder toutes les entrées
  static async saveEntries(entries: MurmureEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.ENTRIES_KEY, JSON.stringify(entries));
      console.log("✅ Entries saved successfully");
    } catch (error) {
      console.error("❌ Error saving entries:", error);
    }
  }

  // Charger toutes les entrées
  static async loadEntries(): Promise<MurmureEntry[]> {
    try {
      const stored = await AsyncStorage.getItem(this.ENTRIES_KEY);
      if (stored) {
        const entries = JSON.parse(stored);
        // Convertir les dates string en Date objects
        return entries.map((entry: any) => ({
          ...entry,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
          deletedAt: entry.deletedAt ? new Date(entry.deletedAt) : undefined,
          isInTrash: entry.isInTrash || false,
        }));
      }
      return [];
    } catch (error) {
      console.error("❌ Error loading entries:", error);
      return [];
    }
  }

  // Charger seulement les entrées actives (pas dans la corbeille)
  static async loadActiveEntries(): Promise<MurmureEntry[]> {
    const allEntries = await this.loadEntries();
    return allEntries.filter((entry) => !entry.isInTrash);
  }

  // Charger seulement les entrées dans la corbeille
  static async loadTrashEntries(): Promise<MurmureEntry[]> {
    const allEntries = await this.loadEntries();
    return allEntries.filter((entry) => entry.isInTrash);
  }

  // Sauvegarder une entrée spécifique
  static async saveEntry(entry: MurmureEntry): Promise<void> {
    try {
      const entries = await this.loadEntries();
      const existingIndex = entries.findIndex((e) => e.id === entry.id);

      // Mettre à jour le preview et le compteur de mots
      const updatedEntry = {
        ...entry,
        previewText: this.generatePreview(entry.content),
        wordCount: this.countWords(entry.content),
        updatedAt: new Date(),
      };

      if (existingIndex >= 0) {
        entries[existingIndex] = updatedEntry;
      } else {
        entries.unshift(updatedEntry); // Ajouter au début
      }

      await this.saveEntries(entries);
      console.log(`✅ Entry saved: ${entry.filename}`);
    } catch (error) {
      console.error("❌ Error saving entry:", error);
    }
  }

  // Déplacer une entrée vers la corbeille (suppression douce)
  static async moveToTrash(entryId: string): Promise<void> {
    try {
      const entries = await this.loadEntries();
      const entryIndex = entries.findIndex((e) => e.id === entryId);

      if (entryIndex >= 0) {
        entries[entryIndex] = {
          ...entries[entryIndex],
          isInTrash: true,
          deletedAt: new Date(),
        };

        await this.saveEntries(entries);
        console.log(`🗑️ Entry moved to trash: ${entryId}`);
      }
    } catch (error) {
      console.error("❌ Error moving entry to trash:", error);
    }
  }

  // Restaurer une entrée depuis la corbeille
  static async restoreFromTrash(entryId: string): Promise<void> {
    try {
      const entries = await this.loadEntries();
      const entryIndex = entries.findIndex((e) => e.id === entryId);

      if (entryIndex >= 0) {
        entries[entryIndex] = {
          ...entries[entryIndex],
          isInTrash: false,
          deletedAt: undefined,
        };

        await this.saveEntries(entries);
        console.log(`♻️ Entry restored from trash: ${entryId}`);
      }
    } catch (error) {
      console.error("❌ Error restoring entry from trash:", error);
    }
  }

  // Supprimer définitivement une entrée
  static async deleteEntryPermanently(entryId: string): Promise<void> {
    try {
      const entries = await this.loadEntries();
      const filtered = entries.filter((e) => e.id !== entryId);
      await this.saveEntries(filtered);
      console.log(`💀 Entry permanently deleted: ${entryId}`);
    } catch (error) {
      console.error("❌ Error permanently deleting entry:", error);
    }
  }

  // Vider la corbeille (suppression définitive de tout)
  static async emptyTrash(): Promise<void> {
    try {
      const entries = await this.loadEntries();
      const activeEntries = entries.filter((e) => !e.isInTrash);
      await this.saveEntries(activeEntries);
      console.log(`🧹 Trash emptied`);
    } catch (error) {
      console.error("❌ Error emptying trash:", error);
    }
  }

  // Nettoyer automatiquement les entrées de la corbeille après 30 jours
  static async cleanupExpiredTrashEntries(): Promise<void> {
    try {
      const entries = await this.loadEntries();
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
        await this.saveEntries(filteredEntries);
        console.log(
          `🧹 Auto-cleaned ${cleanedCount} expired entries from trash`
        );
      }
    } catch (error) {
      console.error("❌ Error cleaning up expired trash entries:", error);
    }
  }

  // Obtenir le nombre de jours restants avant suppression définitive
  static getDaysUntilDeletion = (entry: MurmureEntry): number | null => {
    if (!entry.isInTrash || !entry.deletedAt) return null;

    const now = new Date();
    const daysSinceDeleted = Math.floor(
      (now.getTime() - entry.deletedAt.getTime()) / (24 * 60 * 60 * 1000)
    );

    return Math.max(0, MurmureStorage.TRASH_RETENTION_DAYS - daysSinceDeleted);
  };

  // Sauvegarder l'ID de l'entrée courante
  static async saveCurrentEntryId(entryId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CURRENT_ENTRY_KEY, entryId);
    } catch (error) {
      console.error("❌ Error saving current entry ID:", error);
    }
  }

  // Charger l'ID de l'entrée courante
  static async loadCurrentEntryId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.CURRENT_ENTRY_KEY);
    } catch (error) {
      console.error("❌ Error loading current entry ID:", error);
      return null;
    }
  }

  // Générer un aperçu du contenu (comme dans Freewrite)
  private static generatePreview(content: string): string {
    const cleaned = content.replace(/\n/g, " ").trim();

    if (cleaned.length === 0) return "";
    return cleaned.length > 50 ? cleaned.substring(0, 50) + "..." : cleaned;
  }

  // Compter les mots (comme dans Freewrite)
  private static countWords(content: string): number {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length;
  }

  // Obtenir une entrée vide pour aujourd'hui ou créer une nouvelle
  static async getTodayEntryOrCreate(): Promise<MurmureEntry> {
    const entries = await this.loadActiveEntries(); // Seulement les entrées actives
    const today = format(new Date(), "MMM d");

    // Chercher une entrée vide d'aujourd'hui
    const todayEmptyEntry = entries.find(
      (entry) => entry.date === today && entry.content.trim() === ""
    );

    if (todayEmptyEntry) {
      return todayEmptyEntry;
    }

    // Créer une nouvelle entrée
    const newEntry = this.createNewEntry();

    // Si c'est la première entrée, ajouter le message de bienvenue
    if (entries.length === 0) {
      newEntry.content = this.getWelcomeMessage();
      newEntry.previewText = this.generatePreview(newEntry.content);
      newEntry.wordCount = this.countWords(newEntry.content);
    }

    await this.saveEntry(newEntry);
    return newEntry;
  }

  // Message de bienvenue adapté pour mobile
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

Prêt à murmurer tes premières pensées ? 
Appuie sur "Commencer à écrire" et laisse-toi aller...`;
  }

  // Export des données (pour partage futur)
  static async exportAllEntries(): Promise<string> {
    const entries = await this.loadActiveEntries(); // Seulement les entrées actives
    return JSON.stringify(entries, null, 2);
  }

  // Export des données de la corbeille
  static async exportTrashEntries(): Promise<string> {
    const entries = await this.loadTrashEntries();
    return JSON.stringify(entries, null, 2);
  }

  // Initialiser le nettoyage automatique (à appeler au démarrage)
  static async initializeAutoCleanup(): Promise<void> {
    await this.cleanupExpiredTrashEntries();
  }
}

export default MurmureStorage;
