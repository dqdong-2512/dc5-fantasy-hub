/**
 * useDataSeason Hook
 * Provides access to current season and competition metadata
 */

import { useMemo } from 'react';
import { getActiveSeasonMetadata } from '@config/appConfig';
import { getCurrentSeasonLabel, getSeasonMetadata, type SeasonMetadata } from '@shared/services';

/**
 * Hook to get current season metadata
 */
export function useDataSeason(): SeasonMetadata {
  return useMemo(() => {
    try {
      return getSeasonMetadata();
    } catch {
      const activeSeasonMetadata = getActiveSeasonMetadata();
      return {
        season: activeSeasonMetadata?.id || '2026-2027',
        seasonLabel: activeSeasonMetadata?.label || '2026/27',
        competition: 'fpl',
        competitionName: 'Fantasy Premier League',
        syncedAt: null,
        isStale: true,
      };
    }
  }, []);
}

/**
 * Hook to get current season label (e.g., "2025/26" or "2026/27")
 */
export function useSeasonLabel(): string {
  return useMemo(() => {
    try {
      return getCurrentSeasonLabel();
    } catch {
      const activeSeasonMetadata = getActiveSeasonMetadata();
      return activeSeasonMetadata?.label || '2026/27';
    }
  }, []);
}
