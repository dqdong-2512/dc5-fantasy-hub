/**
 * useGameweekState Hook
 * Provides access to current gameweek state and resolution
 */

import { useMemo } from 'react';
import { GameweekStateService, type GameweekState } from '@shared/services';

/**
 * Hook to get current gameweek state
 */
export function useGameweekState(): GameweekState {
  return useMemo(() => {
    try {
      const service = new GameweekStateService();
      return service.getGameweekState();
    } catch {
      return {
        status: 'PRE_SEASON' as any,
        currentGameweek: null,
        nextGameweek: null,
        lastFinishedGameweek: null,
        allGameweeks: [],
        totalGameweeks: 0,
      };
    }
  }, []);
}

/**
 * Hook to get current gameweek
 */
export function useCurrentGameweek() {
  const state = useGameweekState();
  return state.currentGameweek;
}

/**
 * Hook to get next gameweek
 */
export function useNextGameweek() {
  const state = useGameweekState();
  return state.nextGameweek;
}
