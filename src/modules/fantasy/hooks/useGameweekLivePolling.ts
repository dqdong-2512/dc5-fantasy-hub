/**
 * useGameweekLivePolling Hook
 * Manages automatic polling of live gameweek data
 * Intelligently polls only when gameweek is live, stops when finished
 */

import { useEffect, useCallback, useRef } from 'react';

export interface UseGameweekLivePollingOptions {
  isLive: boolean;
  isFinished: boolean;
  refreshInterval?: number; // milliseconds, default 30000 (30 seconds)
  onRefresh: () => Promise<void>;
}

/**
 * Hook to manage automatic polling of live gameweek data
 * Respects gameweek status - only polls when live, stops when finished
 *
 * @param options - Configuration for polling behavior
 * @returns Polling control functions
 */
export const useGameweekLivePolling = ({
  isLive,
  isFinished,
  refreshInterval = 30000,
  onRefresh,
}: UseGameweekLivePollingOptions): {
  enableAutoRefresh: () => void;
  disableAutoRefresh: () => void;
  isAutoRefreshEnabled: boolean;
} => {
  const intervalRef = useRef<number | null>(null);
  const autoRefreshRef = useRef(true);
  const lastRefreshRef = useRef<number>(0);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      return; // Already polling
    }

    intervalRef.current = window.setInterval(() => {
      if (!autoRefreshRef.current || !isLive || isFinished) {
        return;
      }

      // Debounce rapid refresh calls
      const now = Date.now();
      if (now - lastRefreshRef.current < 5000) {
        return;
      }

      lastRefreshRef.current = now;
      onRefresh().catch((err) => {
        console.error('Live polling error:', err);
      });
    }, refreshInterval);
  }, [isLive, isFinished, onRefresh, refreshInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start/stop polling based on gameweek status
  useEffect(() => {
    if (isLive && !isFinished && autoRefreshRef.current) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isLive, isFinished, startPolling, stopPolling]);

  return {
    enableAutoRefresh: () => {
      autoRefreshRef.current = true;
      if (isLive && !isFinished) {
        startPolling();
      }
    },
    disableAutoRefresh: () => {
      autoRefreshRef.current = false;
      stopPolling();
    },
    // eslint-disable-next-line react-hooks/refs
    isAutoRefreshEnabled: autoRefreshRef.current,
  };
};
