/**
 * useLiveGameweek Hook
 * Provides live gameweek performance for a manager
 *
 * Combines:
 * - Official history (when gameweek finished)
 * - Live calculated performance (when gameweek active)
 * - Clear status indication (upcoming/live/finished)
 */

import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { LiveGameweekEngine, type LiveGameweekPerformance } from '@shared/services';
import type { FantasyGameweekHistory } from '@domain/models';

export interface UseLiveGameweekState {
  performance: LiveGameweekPerformance | null;
  isLoading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and maintain live gameweek performance
 *
 * @param entryId - FPL entry ID (manager ID)
 * @param gameweekId - Gameweek/event ID to load
 * @param officialHistory - Official gameweek history record (when available)
 * @returns Live performance state with refresh capability
 */
export const useLiveGameweek = (
  entryId: number | null,
  gameweekId: number | null,
  officialHistory?: FantasyGameweekHistory
): UseLiveGameweekState => {
  const [performance, setPerformance] = useState<LiveGameweekPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const engineRef = useRef(new LiveGameweekEngine());

  const loadPerformance = useCallback(async () => {
    if (!entryId || !gameweekId) {
      setPerformance(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await engineRef.current.calculateLivePerformance(
        entryId,
        gameweekId,
        officialHistory
      );

      setPerformance(result);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load live performance';
      setError(errorMessage);
      console.error('Live performance error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [entryId, gameweekId, officialHistory]);

  // Initial load
  useEffect(() => {
    loadPerformance();
  }, [loadPerformance]);

  return {
    performance,
    isLoading,
    error,
    lastRefresh,
    refresh: loadPerformance,
  };
};

/**
 * Hook to calculate differential impact between two managers
 *
 * @param myPerformance - Connected manager's live performance
 * @param opponentPerformance - Opponent manager's live performance
 * @returns Differential impact calculation
 */
export const useDifferentialImpact = (
  myPerformance: LiveGameweekPerformance | null,
  opponentPerformance: LiveGameweekPerformance | null
) => {
  return useMemo(() => {
    if (!myPerformance || !opponentPerformance) {
      return null;
    }

    try {
      const engine = new LiveGameweekEngine();
      return engine.calculateDifferentialImpact(myPerformance, opponentPerformance);
    } catch (err) {
      console.error('Differential impact calculation error:', err);
      return null;
    }
  }, [myPerformance, opponentPerformance]);
};
