/**
 * Entry Storage Service
 * Manages persistence of connected FPL Entry ID
 * Uses browser localStorage for simple, persistent storage
 */

const ENTRY_ID_STORAGE_KEY = 'fpl:connected_entry_id';

export class EntryStorage {
  static getConnectedEntryId(): number | null {
    try {
      const stored = localStorage.getItem(ENTRY_ID_STORAGE_KEY);
      if (!stored) return null;
      const parsed = parseInt(stored, 10);
      return isNaN(parsed) ? null : parsed;
    } catch {
      return null;
    }
  }

  static setConnectedEntryId(entryId: number): void {
    try {
      localStorage.setItem(ENTRY_ID_STORAGE_KEY, entryId.toString());
    } catch {
      console.error('Failed to persist Entry ID');
    }
  }

  static clearConnectedEntryId(): void {
    try {
      localStorage.removeItem(ENTRY_ID_STORAGE_KEY);
    } catch {
      console.error('Failed to clear Entry ID');
    }
  }
}
