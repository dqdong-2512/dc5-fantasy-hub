import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TournamentCenterData } from '../models/tournament.models';
import { TournamentService } from '../services/TournamentService';

export interface UseTournamentCenterOptions {
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}

export interface UseTournamentCenterResult {
  data: TournamentCenterData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useTournamentCenter(
  options?: UseTournamentCenterOptions
): UseTournamentCenterResult {
  const serviceRef = useRef(new TournamentService());
  const [data, setData] = useState<TournamentCenterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (data) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const snapshot = await serviceRef.current.getTournamentCenterData(true);
      setData(snapshot);
      setError(null);
      setLastUpdated(new Date());
    } catch (refreshError) {
      setError(
        refreshError instanceof Error ? refreshError.message : 'Failed to load ASEAN Cup 2026 data'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [data]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [refresh]);

  useEffect(() => {
    if (options?.autoRefresh === false) {
      return;
    }

    const intervalMs = options?.refreshIntervalMs ?? 30000;
    const timerId = window.setInterval(() => {
      void refresh();
    }, intervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [options?.autoRefresh, options?.refreshIntervalMs, refresh]);

  return useMemo(
    () => ({ data, isLoading, isRefreshing, error, lastUpdated, refresh }),
    [data, isLoading, isRefreshing, error, lastUpdated, refresh]
  );
}
