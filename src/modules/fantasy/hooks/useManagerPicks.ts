/**
 * useManagerPicks Hook
 * Fetches and manages gameweek picks for a connected manager
 * Handles loading, caching, and error states
 */

import { useState, useCallback, useEffect } from 'react';
import { FantasyGameRepository } from '@repositories/fantasy';
import { PlayerRepository } from '@repositories/players';
import type { FantasyGameweekPicks, FantasyPick, Player } from '@domain/models';

export interface ManagerPickWithPlayerData extends FantasyPick {
  player?: Player | null;
  playerName?: string;
}

export interface UseManagerPicksState {
  picks: ManagerPickWithPlayerData[] | null;
  starters: ManagerPickWithPlayerData[];
  bench: ManagerPickWithPlayerData[];
  captain: ManagerPickWithPlayerData | undefined;
  viceCaptain: ManagerPickWithPlayerData | undefined;

  // Metadata
  transfersMade: number;
  transfersCost: number;
  bankValue: number;
  teamValue: number;
  activeChip: string | null;

  // Loading/Error states
  isLoading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
}

export function useManagerPicks(
  entryId: number | null,
  gameweekId: number | null
): UseManagerPicksState {
  const [picks, setPicks] = useState<FantasyGameweekPicks | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = new FantasyGameRepository();
  const playerRepository = new PlayerRepository();

  // Fetch picks when entryId or gameweekId changes
  useEffect(() => {
    if (!entryId || !gameweekId) {
      setPicks(null);
      return;
    }

    const loadPicks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const picksData = await repository.getEntryPicks(entryId, gameweekId);
        setPicks(picksData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load picks');
        setPicks(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPicks();
  }, [entryId, gameweekId, repository]);

  // Enrich picks with player data
  const enrichedPicks: ManagerPickWithPlayerData[] | null = picks
    ? picks.picks.map((pick) => {
        const player = playerRepository.getById(pick.element);
        return {
          ...pick,
          player,
          playerName: player?.displayName,
        } as ManagerPickWithPlayerData;
      })
    : null;

  // Separate starters and bench
  const starters = enrichedPicks?.filter((p) => p.position <= 11) ?? [];
  const bench = enrichedPicks?.filter((p) => p.position > 11) ?? [];

  // Find captain and vice captain
  const captain = enrichedPicks?.find((p) => p.isCaptain);
  const viceCaptain = enrichedPicks?.find((p) => p.isViceCaptain);

  const refresh = useCallback(async () => {
    if (!entryId || !gameweekId) return;

    try {
      setIsLoading(true);
      const picksData = await repository.getEntryPicks(entryId, gameweekId);
      setPicks(picksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh picks');
    } finally {
      setIsLoading(false);
    }
  }, [entryId, gameweekId, repository]);

  return {
    picks: enrichedPicks,
    starters,
    bench,
    captain,
    viceCaptain,
    transfersMade: picks?.transfersMade ?? 0,
    transfersCost: picks?.transfersCost ?? 0,
    bankValue: picks?.bankValue ?? 0,
    teamValue: picks?.teamValue ?? 0,
    activeChip: picks?.activeChip ?? null,
    isLoading,
    error,
    refresh,
  };
}
