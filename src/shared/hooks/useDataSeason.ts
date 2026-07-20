/**
 * useDataSeason Hook
 * Provides access to current season and competition metadata
 */

import { useMemo } from 'react';
import { getCurrentSeasonLabel, getSeasonMetadata, type SeasonMetadata } from '@shared/services';

/**
 * Hook to get current season metadata
 */
export function useDataSeason(): SeasonMetadata {
  return useMemo(() => {
    try {
      return getSeasonMetadata();
    } catch {
      return {
        season: '2025-2026',
        seasonLabel: '2025/26',
        competition: 'fpl',
        competitionName: 'Fantasy Premier League',
        syncedAt: null,
        isStale: true,
      };
    }
  }, []);
}

/**
 * Hook to get current season label (e.g., "2025/26")
 */
export function useSeasonLabel(): string {
  return useMemo(() => {
    try {
      return getCurrentSeasonLabel();
    } catch {
      return '2025/26';
    }
  }, []);
}
