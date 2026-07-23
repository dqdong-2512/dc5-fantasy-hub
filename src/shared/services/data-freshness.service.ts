/**
 * Data Freshness Service
 * Monitors global FPL data freshness and staleness
 *
 * Provides:
 * - Last sync time from db.json metadata
 * - Staleness check based on sync time
 * - Data availability status
 * - Sync policy (when data should be considered fresh/stale)
 */

import { getDataFiles } from '@repositories/data-loader';
import { getSeasonMetadata } from './data-season.service';

export enum DataFreshness {
  Fresh = 'FRESH',
  Stale = 'STALE',
  Unknown = 'UNKNOWN',
  NoData = 'NO_DATA',
}

export interface DataQualityStatus {
  freshness: DataFreshness;
  lastSyncTime: string | null;
  lastSyncHoursAgo: number | null;
  isValid: boolean;
  qualityStatus: string | null;
}

/**
 * Data Freshness Service
 * Inspects dataset metadata to determine freshness
 */
export class DataFreshnessService {
  /**
   * Get current data quality status
   */
  getDataQualityStatus(): DataQualityStatus {
    try {
      const dataFiles = getDataFiles();
      const meta = dataFiles.meta || {};

      const syncedAt = meta.syncedAt || null;
      const qualityStatus = meta.dataQualityStatus || null;

      // Calculate freshness
      let freshness = DataFreshness.Unknown;
      let hoursAgo: number | null = null;

      if (syncedAt) {
        const now = new Date();
        const lastSync = new Date(syncedAt);
        const diffMs = now.getTime() - lastSync.getTime();
        hoursAgo = diffMs / (1000 * 60 * 60);

        // Policy: data is fresh if synced within last 24 hours
        // Adjust this threshold as needed based on your sync schedule
        freshness = hoursAgo <= 24 ? DataFreshness.Fresh : DataFreshness.Stale;
      } else {
        // If no sync timestamp but we have valid data, treat as fresh
        // (likely using local fallback imports)
        const hasData =
          dataFiles.teams && Array.isArray(dataFiles.teams) && dataFiles.teams.length > 0;
        if (hasData) {
          freshness = DataFreshness.Fresh;
        }
      }

      const isValid = qualityStatus === 'PASS' || freshness === DataFreshness.Fresh;

      return {
        freshness,
        lastSyncTime: syncedAt,
        lastSyncHoursAgo: hoursAgo,
        isValid,
        qualityStatus,
      };
    } catch {
      return {
        freshness: DataFreshness.Unknown,
        lastSyncTime: null,
        lastSyncHoursAgo: null,
        isValid: false,
        qualityStatus: null,
      };
    }
  }

  /**
   * Check if data is fresh
   */
  isFresh(): boolean {
    const status = this.getDataQualityStatus();
    return status.freshness === DataFreshness.Fresh;
  }

  /**
   * Check if data is stale
   */
  isStale(): boolean {
    const status = this.getDataQualityStatus();
    return status.freshness === DataFreshness.Stale;
  }

  /**
   * Get last sync time formatted for display
   * Example: "20 Jul 2026, 14:30"
   */
  getLastSyncTimeFormatted(): string {
    const status = this.getDataQualityStatus();
    if (!status.lastSyncTime) {
      return 'Never';
    }

    try {
      const date = new Date(status.lastSyncTime);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return 'Unknown';
    }
  }

  /**
   * Get human-readable staleness message
   * Example: "Updated 2 hours ago" or "Last updated: 20 Jul, 14:30"
   */
  getStaleMessage(): string | null {
    const status = this.getDataQualityStatus();

    if (status.freshness === DataFreshness.Fresh) {
      // Data is fresh, no warning needed
      return null;
    }

    if (!status.lastSyncHoursAgo) {
      return 'Data freshness unknown';
    }

    if (status.lastSyncHoursAgo < 1) {
      return 'Data updated minutes ago';
    }

    if (status.lastSyncHoursAgo < 24) {
      const hours = Math.round(status.lastSyncHoursAgo);
      return `Data updated ${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    const days = Math.round(status.lastSyncHoursAgo / 24);
    return `Data may be outdated (${days} day${days === 1 ? '' : 's'} old)`;
  }

  /**
   * Get data counts for status display
   */
  getDataCounts(): {
    players: number;
    teams: number;
    gameweeks: number;
    fixtures: number;
  } {
    try {
      const dataFiles = getDataFiles();
      const db = (dataFiles as any).__db__ || {};

      return {
        players: Array.isArray(db.players) ? db.players.length : 0,
        teams: Array.isArray(db.teams) ? db.teams.length : 0,
        gameweeks: Array.isArray(db.gameweeks) ? db.gameweeks.length : 0,
        fixtures: Array.isArray(db.fixtures) ? db.fixtures.length : 0,
      };
    } catch {
      return {
        players: 0,
        teams: 0,
        gameweeks: 0,
        fixtures: 0,
      };
    }
  }

  /**
   * Get comprehensive freshness summary
   */
  getSummary(): string {
    const meta = getSeasonMetadata();
    const quality = this.getDataQualityStatus();
    const counts = this.getDataCounts();

    return `${meta.seasonLabel} • ${counts.players} players • Last synced: ${quality.lastSyncTime ? new Date(quality.lastSyncTime).toLocaleDateString() : 'unknown'}`;
  }
}

/**
 * Get data quality status for use in components
 */
export function getDataQualityStatus(): DataQualityStatus {
  return new DataFreshnessService().getDataQualityStatus();
}
