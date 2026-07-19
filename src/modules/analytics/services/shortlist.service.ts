/**
 * Shortlist Service
 * Manages player shortlist persistence using localStorage
 * Stores player IDs only, not full objects
 */

import type { ShortlistEntry } from '@domain/models';
import { PlayerRepository } from '@repositories/players';
import type { Player } from '@domain/models';

const SHORTLIST_STORAGE_KEY = 'fpl_player_shortlist';

export class ShortlistService {
  private playerRepository: PlayerRepository;

  constructor() {
    this.playerRepository = new PlayerRepository();
  }

  /**
   * Get all shortlisted player IDs
   */
  getShortlistedPlayerIds(): number[] {
    try {
      const stored = localStorage.getItem(SHORTLIST_STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return [];
      }

      // Return only valid entries
      return parsed
        .filter((entry: any) => typeof entry.playerId === 'number' && entry.playerId > 0)
        .map((entry: any) => entry.playerId);
    } catch (error) {
      console.error('Error loading shortlist from localStorage:', error);
      return [];
    }
  }

  /**
   * Get full player objects for shortlisted IDs
   */
  getShortlistedPlayers(): Player[] {
    const playerIds = this.getShortlistedPlayerIds();
    const players: Player[] = [];

    for (const id of playerIds) {
      try {
        const player = this.playerRepository.getById(id);
        if (player) {
          players.push(player);
        }
      } catch (error) {
        // Skip players that no longer exist
        console.warn(`Player ${id} not found in repository`);
      }
    }

    return players;
  }

  /**
   * Add player to shortlist
   */
  addToShortlist(playerId: number): void {
    const current = this.getShortlistedPlayerIds();

    // Don't add duplicates
    if (current.includes(playerId)) {
      return;
    }

    const entries: ShortlistEntry[] = [
      ...current.map((id) => ({ playerId: id, addedAt: 0 })),
      { playerId, addedAt: Date.now() },
    ];

    this.saveToStorage(entries);
  }

  /**
   * Remove player from shortlist
   */
  removeFromShortlist(playerId: number): void {
    const current = this.getShortlistedPlayerIds();
    const filtered = current.filter((id) => id !== playerId);

    const entries: ShortlistEntry[] = filtered.map((id) => ({
      playerId: id,
      addedAt: 0,
    }));

    this.saveToStorage(entries);
  }

  /**
   * Check if player is shortlisted
   */
  isShortlisted(playerId: number): boolean {
    return this.getShortlistedPlayerIds().includes(playerId);
  }

  /**
   * Clear entire shortlist
   */
  clearShortlist(): void {
    try {
      localStorage.removeItem(SHORTLIST_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing shortlist:', error);
    }
  }

  /**
   * Save entries to storage
   */
  private saveToStorage(entries: ShortlistEntry[]): void {
    try {
      localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving shortlist to localStorage:', error);
    }
  }
}
