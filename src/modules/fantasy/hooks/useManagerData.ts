/**
 * useManagerData Hook
 * Presents manager data in a consumption-friendly format
 * Combines entry, history, and gameweek context
 */

import { useMemo } from 'react';
import type { UseFantasyGameState } from './useFantasyGame';
import { ManagerContextService, type ManagerContext, type ManagerStats } from '../services';

export interface UseManagerDataState {
  // Raw states
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Manager context
  context: ManagerContext | null;
  stats: ManagerStats;

  // Display values
  displayValues: {
    managerName: string;
    teamName: string;
    totalPoints: string;
    overallRank: string;
    gameweekPoints: string;
    gameweekRank: string;
    statusLabel: string;
  };

  // Gameweek state
  displayGameweek: number | null;
  isGameweekActive: boolean;
}

export function useManagerData(gameState: UseFantasyGameState): UseManagerDataState {
  // Build manager context
  const context = useMemo(
    () =>
      ManagerContextService.buildContext(
        gameState.entry,
        gameState.history,
        gameState.displayGameweek ?? 1,
        gameState.isCurrentGameweekActive
      ),
    [
      gameState.entry,
      gameState.history,
      gameState.displayGameweek,
      gameState.isCurrentGameweekActive,
    ]
  );

  // Calculate stats
  const stats = useMemo(
    () => ManagerContextService.calculateStats(gameState.history),
    [gameState.history]
  );

  // Format display values
  const displayValues = useMemo(() => {
    const formatted = ManagerContextService.formatManagerDisplay(context);
    return {
      managerName: formatted.displayName,
      teamName: formatted.teamName,
      totalPoints: formatted.pointsDisplay,
      overallRank: formatted.rankDisplay,
      gameweekPoints: context?.gameweekPoints ? `${context.gameweekPoints}` : '—',
      gameweekRank: context?.gameweekRank ? `#${context.gameweekRank.toLocaleString()}` : '—',
      statusLabel: formatted.statusLabel,
    };
  }, [context]);

  return {
    isConnected: gameState.isConnected,
    isLoading: gameState.isLoading,
    error: gameState.error,
    context,
    stats,
    displayValues,
    displayGameweek: gameState.displayGameweek,
    isGameweekActive: gameState.isCurrentGameweekActive,
  };
}
