/**
 * useLeagueDetail Hook
 * Manages league detail state including standings, opponent selection, and picks
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { FantasyGameRepository } from '@repositories/fantasy';
import type { FantasyLeagueStandings, FantasyGameweekPicks } from '@domain/models';

export interface LeagueDetailState {
  // League data
  leagueId: number;
  leagueName: string | null;
  gameweekId: number;

  // Standings
  standings: FantasyLeagueStandings | null;
  currentManagerEntry: any;
  selectedOpponentEntry: any | null;
  selectedOpponentPicks: FantasyGameweekPicks | null;

  // Pagination
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // Loading states
  isLoadingStandings: boolean;
  isLoadingOpponentPicks: boolean;
  standingsError: string | null;
  opponentError: string | null;

  // Actions
  selectOpponent: (opponentId: number) => Promise<void>;
  clearOpponent: () => void;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  refreshStandings: () => Promise<void>;
}

export function useLeagueDetail(
  leagueId: number,
  gameweekId: number,
  connectedEntryId: number | null
): LeagueDetailState {
  const [standings, setStandings] = useState<FantasyLeagueStandings | null>(null);
  const [currentManagerEntry, setCurrentManagerEntry] = useState<any>(null);
  const [selectedOpponentEntry, setSelectedOpponentEntry] = useState<any | null>(null);
  const [selectedOpponentPicks, setSelectedOpponentPicks] = useState<FantasyGameweekPicks | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(currentPage > 1);

  const [isLoadingStandings, setIsLoadingStandings] = useState(false);
  const [isLoadingOpponentPicks, setIsLoadingOpponentPicks] = useState(false);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [opponentError, setOpponentError] = useState<string | null>(null);

  // Memoize repository instance
  const repository = useMemo(() => new FantasyGameRepository(), []);

  // Load standings for current page
  useEffect(() => {
    if (!leagueId || !connectedEntryId) return;

    const loadStandings = async () => {
      try {
        setIsLoadingStandings(true);
        setStandingsError(null);

        const data = await repository.getLeagueStandings(leagueId, currentPage);
        setStandings(data);
        setHasNextPage(data.hasNext || false);
        setHasPreviousPage(currentPage > 1);

        // Find current manager in standings
        const currentEntry = data.standings?.find(
          (entry) => entry.entryId === connectedEntryId || entry.entryId === connectedEntryId
        );
        setCurrentManagerEntry(currentEntry || null);

        // Clear opponent if on new page
        setSelectedOpponentEntry(null);
        setSelectedOpponentPicks(null);
      } catch (err) {
        setStandingsError(err instanceof Error ? err.message : 'Failed to load standings');
      } finally {
        setIsLoadingStandings(false);
      }
    };

    loadStandings();
  }, [leagueId, connectedEntryId, currentPage]);

  // Load opponent picks when opponent is selected
  useEffect(() => {
    if (!selectedOpponentEntry || !gameweekId) return;

    const loadOpponentPicks = async () => {
      try {
        setIsLoadingOpponentPicks(true);
        setOpponentError(null);

        const opponentEntryId = selectedOpponentEntry.entryId || selectedOpponentEntry.managerId;
        const picks = await repository.getEntryPicks(opponentEntryId, gameweekId);
        setSelectedOpponentPicks(picks);
      } catch (err) {
        setOpponentError(err instanceof Error ? err.message : 'Failed to load opponent picks');
      } finally {
        setIsLoadingOpponentPicks(false);
      }
    };

    loadOpponentPicks();
  }, [selectedOpponentEntry, gameweekId]);

  const selectOpponent = useCallback(
    async (opponentId: number) => {
      const opponent = standings?.standings?.find(
        (entry) => entry.entryId === opponentId || entry.entryId === opponentId
      );

      if (opponent) {
        setSelectedOpponentEntry(opponent);
      }
    },
    [standings]
  );

  const clearOpponent = useCallback(() => {
    setSelectedOpponentEntry(null);
    setSelectedOpponentPicks(null);
    setOpponentError(null);
  }, []);

  const nextPage = useCallback(async () => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(async () => {
    if (hasPreviousPage) {
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
  }, [hasPreviousPage]);

  const refreshStandings = useCallback(async () => {
    setCurrentPage(1);
  }, []);

  return {
    leagueId,
    leagueName: standings?.leagueName || null,
    gameweekId,
    standings,
    currentManagerEntry,
    selectedOpponentEntry,
    selectedOpponentPicks,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    isLoadingStandings,
    isLoadingOpponentPicks,
    standingsError,
    opponentError,
    selectOpponent,
    clearOpponent,
    nextPage,
    previousPage,
    refreshStandings,
  };
}
