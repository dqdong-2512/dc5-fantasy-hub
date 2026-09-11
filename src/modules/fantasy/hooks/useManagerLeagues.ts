/**
 * useManagerLeagues Hook
 * Fetches and manages league information for a connected manager
 * Handles loading, pagination, and error states
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { FantasyGameRepository } from '@repositories/fantasy';
import type { FantasyLeagueStanding } from '@domain/models';
import { FplClient } from '@shared/services/fpl-client';

export interface UseManagerLeaguesState {
  // League data
  leagues: Array<{ id: number; name: string; rank: number | null }> | null;
  currentLeagueId: number | null;

  // Standings
  standings: FantasyLeagueStanding[] | null;
  leagueName: string | null;
  managerRankInLeague: number | null;

  // Pagination
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;

  // Loading/Error states
  isLoadingStandings: boolean;
  error: string | null;
  dataStatus: 'LIVE' | 'STALE' | 'ERROR' | null;
  lastUpdated: string | null;

  // Actions
  selectLeague: (leagueId: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  refreshStandings: () => Promise<void>;
}

export function useManagerLeagues(
  entryId: number | null,
  joinedLeagueIds: number[] | null,
  gameweekId?: number | null,
  joinedLeagueMetadata?: Array<{ id: number; name: string; rank: number | null }>
): UseManagerLeaguesState {
  const [leagues, setLeagues] = useState<Array<{
    id: number;
    name: string;
    rank: number | null;
  }> | null>(null);
  const [currentLeagueId, setCurrentLeagueId] = useState<number | null>(null);
  const [standings, setStandings] = useState<FantasyLeagueStanding[] | null>(null);
  const [leagueName, setLeagueName] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageSize, setPageSize] = useState(0);
  const [isLoadingStandings, setIsLoadingStandings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<'LIVE' | 'STALE' | 'ERROR' | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const repository = useMemo(() => new FantasyGameRepository(), []);
  const fplClient = useMemo(() => new FplClient(), []);

  const applyLiveStandings = useCallback(
    async (leagueId: number, fallback: FantasyLeagueStanding[]) => {
      if (!gameweekId) return fallback;
      try {
        const response = await fplClient.getLiveLeague(leagueId, gameweekId);
        setDataStatus(response.dataStatus);
        setLastUpdated(response.lastUpdated);
        if (!response.data) return fallback;
        return response.data.members.map((member) => ({
          rank: member.liveRank,
          prevRank: member.previousRank,
          entryId: member.entryId,
          entryName: member.teamName,
          playerName: member.managerName,
          teamName: member.teamName,
          points: member.liveTotalPoints,
          eventPoints: member.liveGameweekPoints,
          totalPoints: member.liveTotalPoints,
          lastRank: member.rank ?? undefined,
          transfersMade: member.transfersMade,
          transferCost: member.transferCost,
          activeChip: member.activeChip,
        }));
      } catch {
        setDataStatus('STALE');
        return fallback;
      }
    },
    [fplClient, gameweekId]
  );

  // Initialize leagues when entry loads
  useEffect(() => {
    if (!joinedLeagueIds || joinedLeagueIds.length === 0) {
      // Don't clear state if no IDs - keep valid data visible
      return;
    }

    // For now, create placeholder league entries
    // In production, fetch actual league data
    const placeholderLeagues = joinedLeagueIds.map((id) => ({
      id,
      name: joinedLeagueMetadata?.find((league) => league.id === id)?.name ?? `League ${id}`,
      rank: joinedLeagueMetadata?.find((league) => league.id === id)?.rank ?? null,
    }));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeagues(placeholderLeagues);

    // Select first league by default
    if (placeholderLeagues.length > 0) {
      setCurrentLeagueId(placeholderLeagues[0].id);
    }
  }, [joinedLeagueIds, joinedLeagueMetadata]);

  useEffect(() => {
    if (!entryId || !joinedLeagueIds?.length) return;
    let active = true;

    repository
      .getEntryLeagues(entryId)
      .then((resolvedLeagues) => {
        if (!active) return;
        const names = new Map(resolvedLeagues.map((item) => [item.id, item.name]));
        setLeagues(
          (previous) =>
            previous?.map((item) => ({ ...item, name: names.get(item.id) ?? item.name })) ?? null
        );
      })
      .catch(() => {
        // Keep the ID placeholder when a secondary league is temporarily unavailable.
      });

    return () => {
      active = false;
    };
  }, [entryId, joinedLeagueIds, repository]);

  // Fetch standings when league is selected
  useEffect(() => {
    if (!currentLeagueId) return;
    let active = true;

    const loadStandings = async () => {
      try {
        setIsLoadingStandings(true);
        setError(null);
        const data = await repository.getLeagueStandings(currentLeagueId, pageNumber);
        const resolvedStandings = await applyLiveStandings(currentLeagueId, data.standings);
        if (!active) return;
        setStandings(resolvedStandings);
        setLeagueName(data.leagueName);
        setLeagues(
          (previous) =>
            previous?.map((league) =>
              league.id === currentLeagueId
                ? { ...league, name: data.leagueName || league.name }
                : league
            ) ?? null
        );
        setHasNextPage(data.hasNext);
        setPageSize(data.pageSize);

        // Find manager's rank in league
        const managerRank = resolvedStandings.find((s) => s.entryId === entryId)?.rank ?? null;
        if (managerRank !== null) {
          // Update league rank in leagues list
          setLeagues(
            (prev) =>
              prev?.map((l) => (l.id === currentLeagueId ? { ...l, rank: managerRank } : l)) ?? null
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load standings');
        setStandings(null);
      } finally {
        setIsLoadingStandings(false);
      }
    };

    loadStandings();
    return () => {
      active = false;
    };
  }, [applyLiveStandings, currentLeagueId, pageNumber, entryId, repository]);

  const selectLeague = useCallback(async (leagueId: number) => {
    setCurrentLeagueId(leagueId);
    setPageNumber(1);
    setStandings(null);
    setLeagueName(leagues?.find((league) => league.id === leagueId)?.name ?? null);
  }, [leagues]);

  const nextPage = useCallback(async () => {
    if (hasNextPage) {
      setPageNumber((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(async () => {
    if (pageNumber > 1) {
      setPageNumber((prev) => prev - 1);
    }
  }, [pageNumber]);

  const refreshStandings = useCallback(async () => {
    if (!currentLeagueId) return;

    try {
      setIsLoadingStandings(true);
      const data = await repository.getLeagueStandings(currentLeagueId, pageNumber);
      setStandings(await applyLiveStandings(currentLeagueId, data.standings));
      setLeagueName(data.leagueName);
      setHasNextPage(data.hasNext);
      setPageSize(data.pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh standings');
    } finally {
      setIsLoadingStandings(false);
    }
  }, [applyLiveStandings, currentLeagueId, pageNumber, repository]);

  return {
    leagues,
    currentLeagueId,
    standings,
    leagueName,
    managerRankInLeague:
      standings?.find((s) => s.entryId === entryId)?.rank ??
      leagues?.find((item) => item.id === currentLeagueId)?.rank ??
      null,
    pageNumber,
    pageSize,
    hasNextPage,
    isLoadingStandings,
    error,
    dataStatus,
    lastUpdated,
    selectLeague,
    nextPage,
    previousPage,
    refreshStandings,
  };
}
