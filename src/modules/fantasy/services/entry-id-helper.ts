/**
 * Entry ID Configuration Helper
 * Centralized utilities for managing and validating entry IDs
 */

import { EntryStorage } from '@shared/services/entry-storage';

export class EntryIdHelper {
  /**
   * Validate entry ID format
   */
  static isValidEntryId(value: unknown): value is number {
    if (typeof value !== 'number' && typeof value !== 'string') return false;
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    return Number.isInteger(num) && num > 0 && num < 100000000;
  }

  /**
   * Parse entry ID from string (e.g., from user input)
   */
  static parseEntryId(input: string): number | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const num = parseInt(trimmed, 10);
    return this.isValidEntryId(num) ? num : null;
  }

  /**
   * Get current connected entry ID
   */
  static getConnectedEntryId(): number | null {
    return EntryStorage.getConnectedEntryId();
  }

  /**
   * Connect to an entry ID (with validation)
   */
  static connectEntry(entryId: unknown): boolean {
    if (!this.isValidEntryId(entryId)) {
      return false;
    }

    const numId = typeof entryId === 'string' ? parseInt(entryId, 10) : entryId;
    EntryStorage.setConnectedEntryId(numId);
    return true;
  }

  /**
   * Disconnect from entry ID
   */
  static disconnectEntry(): void {
    EntryStorage.clearConnectedEntryId();
  }

  /**
   * Check if entry ID is configured
   */
  static isEntryConfigured(): boolean {
    return this.getConnectedEntryId() !== null;
  }

  /**
   * Get validation error message for entry ID
   */
  static getValidationError(value: string): string | null {
    const trimmed = value.trim();

    if (!trimmed) {
      return 'Entry ID is required';
    }

    const num = parseInt(trimmed, 10);

    if (isNaN(num)) {
      return 'Entry ID must be a number';
    }

    if (num <= 0) {
      return 'Entry ID must be greater than 0';
    }

    if (num >= 100000000) {
      return 'Entry ID is too large';
    }

    return null;
  }
}
