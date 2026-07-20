/**
 * useDataFreshness Hook
 * Provides access to data freshness and quality status
 */

import { useMemo } from 'react';
import { DataFreshnessService, DataFreshness, type DataQualityStatus } from '@shared/services';

/**
 * Hook to get data quality status
 */
export function useDataFreshness(): DataQualityStatus {
  return useMemo(() => {
    try {
      const service = new DataFreshnessService();
      return service.getDataQualityStatus();
    } catch {
      return {
        freshness: DataFreshness.Unknown,
        lastSyncTime: null,
        lastSyncHoursAgo: null,
        isValid: false,
        qualityStatus: null,
      };
    }
  }, []);
}

/**
 * Hook to check if data is fresh
 */
export function useIsDataFresh(): boolean {
  const freshness = useDataFreshness();
  return freshness.freshness === DataFreshness.Fresh;
}

/**
 * Hook to check if data is stale
 */
export function useIsDataStale(): boolean {
  const freshness = useDataFreshness();
  return freshness.freshness === DataFreshness.Stale;
}

/**
 * Hook to get formatted last sync time
 */
export function useLastSyncTime(): string {
  return useMemo(() => {
    try {
      const service = new DataFreshnessService();
      return service.getLastSyncTimeFormatted();
    } catch {
      return 'Unknown';
    }
  }, []);
}

/**
 * Hook to get stale data warning message
 */
export function useStaleDataMessage(): string | null {
  return useMemo(() => {
    try {
      const service = new DataFreshnessService();
      return service.getStaleMessage();
    } catch {
      return null;
    }
  }, []);
}
