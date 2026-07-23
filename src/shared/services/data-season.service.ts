/**
 * Data Season Service
 * Single source of truth for season/competition configuration
 * Resolves season information from synchronized dataset metadata
 *
 * This service ensures that:
 * - Season is consistently represented across the application
 * - Season transitions are handled gracefully
 * - Season information is never hard-coded in components
 */

import { getDataFiles } from '@repositories/data-loader';
import { appConfig } from '@config/appConfig';
import type { Season } from '@config/types';

export interface SeasonMetadata {
  season: Season;
  seasonLabel: string; // e.g., "2025/26"
  competition: 'fpl' | 'ucl';
  competitionName: string;
  syncedAt: string | null;
  isStale: boolean;
}

/**
 * Data Season Service
 * Provides consistent access to season information across the application
 */
export class DataSeasonService {
  private static instance: DataSeasonService | null = null;
  private metadata: SeasonMetadata | null = null;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DataSeasonService {
    if (!DataSeasonService.instance) {
      DataSeasonService.instance = new DataSeasonService();
    }
    return DataSeasonService.instance;
  }

  /**
   * Refresh metadata from current dataset
   * Call this if db.json is reloaded
   */
  refreshMetadata(): void {
    this.metadata = null;
  }

  /**
   * Get current season metadata
   * Resolves from db.json metadata if available
   */
  getSeasonMetadata(): SeasonMetadata {
    // Return cached value if available
    if (this.metadata) {
      return this.metadata;
    }

    try {
      const dataFiles = getDataFiles();
      const db = (dataFiles as any).__db__ || {};
      const meta = db.meta || {};

      // Resolve season from metadata or use configured active season
      const season = (meta.season || appConfig.activeSeason) as Season;
      const seasonLabel = this.formatSeasonLabel(season);
      const syncedAt = meta.syncedAt || null;

      // Check if data is stale (if last synced > 24 hours ago during active season)
      const isStale = this.isDataStale(syncedAt);

      this.metadata = {
        season,
        seasonLabel,
        competition: 'fpl',
        competitionName: 'Fantasy Premier League',
        syncedAt,
        isStale,
      };

      return this.metadata;
    } catch {
      // Fallback to configured active season
      const season = appConfig.activeSeason;
      return {
        season,
        seasonLabel: this.formatSeasonLabel(season),
        competition: 'fpl',
        competitionName: 'Fantasy Premier League',
        syncedAt: null,
        isStale: true,
      };
    }
  }

  /**
   * Get current season (e.g., "2025-2026")
   */
  getSeason(): Season {
    return this.getSeasonMetadata().season;
  }

  /**
   * Get formatted season label (e.g., "2025/26")
   */
  getSeasonLabel(): string {
    return this.getSeasonMetadata().seasonLabel;
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): string | null {
    return this.getSeasonMetadata().syncedAt;
  }

  /**
   * Check if data is considered stale
   */
  isStale(): boolean {
    return this.getSeasonMetadata().isStale;
  }

  /**
   * Format season string for display
   * Converts "2025-2026" → "2025/26"
   */
  private formatSeasonLabel(season: Season): string {
    // Handle both formats: "2025-2026" and "2025/26"
    if (season.includes('-')) {
      const [start, end] = season.split('-');
      const endShort = end.substring(2); // "2026" → "26"
      return `${start}/${endShort}`;
    }
    return season;
  }

  /**
   * Determine if data is stale
   * During active season: stale if older than 24 hours
   * Off-season: stale if older than 7 days
   */
  private isDataStale(syncedAt: string | null): boolean {
    if (!syncedAt) {
      return true; // Unknown sync time = stale
    }

    const now = new Date();
    const lastSync = new Date(syncedAt);
    const diffMs = now.getTime() - lastSync.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // Conservative: consider stale if > 24 hours
    // In production, adjust based on sync schedule
    return diffHours > 24;
  }
}

/**
 * Get current season for use in hooks/components
 */
export function getCurrentSeason(): Season {
  return DataSeasonService.getInstance().getSeason();
}

/**
 * Get formatted season label (e.g., "2025/26")
 */
export function getCurrentSeasonLabel(): string {
  return DataSeasonService.getInstance().getSeasonLabel();
}

/**
 * Get season metadata
 */
export function getSeasonMetadata(): SeasonMetadata {
  return DataSeasonService.getInstance().getSeasonMetadata();
}
