import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TournamentCenterData } from '../models/tournament-engine.models';
import { TournamentEngineService } from '../services/TournamentEngineService';

export interface UseTournamentEngineOptions {
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}

export interface UseTournamentEngineResult {
  data: TournamentCenterData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useTournamentEngine(
  service: TournamentEngineService,
  options?: UseTournamentEngineOptions
): UseTournamentEngineResult {
  const serviceRef = useRef<TournamentEngineService>(service);
  const dataRef = useRef<TournamentCenterData | null>(null);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  const [data, setData] = useState<TournamentCenterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    serviceRef.current = service;
  }, [service]);

  const refresh = useCallback((): Promise<void> => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    if (dataRef.current) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    const refreshPromise = serviceRef.current
      .getTournamentCenterData(true)
      .then((snapshot) => {
        dataRef.current = snapshot;
        setData(snapshot);
        setError(null);
        setLastUpdated(new Date());
      })
      .catch((refreshError: unknown) => {
        setError(
          refreshError instanceof Error ? refreshError.message : 'Failed to load tournament data'
        );
      })
      .finally(() => {
        refreshPromiseRef.current = null;
        setIsLoading(false);
        setIsRefreshing(false);
      });

    refreshPromiseRef.current = refreshPromise;
    return refreshPromise;
  }, []);

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
