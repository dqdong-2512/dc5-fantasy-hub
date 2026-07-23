/**
 * Transfer Repository
 * Provides access to detected player transfers and squad changes
 */

import { getDataFiles } from '../data-loader';

export interface PlayerTransfer {
  playerId: number;
  playerName: string;
  fromTeamId: number | null;
  toTeamId: number;
  detectedAt: string;
}

export class TransferRepository {
  private cache: PlayerTransfer[] = [];
  private isCacheLoaded = false;

  /**
   * Get all detected transfers (newest first)
   */
  getAll(): PlayerTransfer[] {
    if (this.isCacheLoaded) {
      return this.cache;
    }

    try {
      const data = getDataFiles() as any;

      // Transfers are stored in the root db.json structure
      if (data.transfers && Array.isArray(data.transfers)) {
        // Sort by detectedAt descending (newest first)
        this.cache = data.transfers.sort(
          (a: PlayerTransfer, b: PlayerTransfer) =>
            new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
        );
      } else {
        this.cache = [];
      }

      this.isCacheLoaded = true;
      return this.cache;
    } catch (error) {
      console.error('Error loading transfers:', error);
      this.isCacheLoaded = true;
      this.cache = [];
      return this.cache;
    }
  }

  /**
   * Get latest N transfers
   */
  getLatest(limit: number = 5): PlayerTransfer[] {
    return this.getAll().slice(0, limit);
  }

  /**
   * Get transfers for a specific player
   */
  getByPlayer(playerId: number): PlayerTransfer[] {
    return this.getAll().filter((t) => t.playerId === playerId);
  }

  /**
   * Get transfers for a specific team (either from or to)
   */
  getByTeam(teamId: number): PlayerTransfer[] {
    return this.getAll().filter((t) => t.fromTeamId === teamId || t.toTeamId === teamId);
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache = [];
    this.isCacheLoaded = false;
  }
}
