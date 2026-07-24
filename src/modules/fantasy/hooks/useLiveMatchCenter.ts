import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LiveDataService,
  type ClubLivePanel,
  type LiveMatchCenterSnapshot,
  type PlayerLivePanel,
} from '../services';

interface UseLiveMatchCenterOptions {
  gameweekId?: number;
  connectedEntryId?: number | null;
  connectedLeagueId?: number | null;
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}

export interface UseLiveMatchCenterState {
  snapshot: LiveMatchCenterSnapshot | null;
  selectedClubPanel: ClubLivePanel | null;
  selectedPlayerPanel: PlayerLivePanel | null;
  selectedClubId: number | null;
  selectedPlayerId: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  selectClub: (clubId: number | null) => void;
  selectPlayer: (playerId: number | null) => void;
}

export function useLiveMatchCenter(options: UseLiveMatchCenterOptions): UseLiveMatchCenterState {
  const serviceRef = useRef(new LiveDataService());

  const [snapshot, setSnapshot] = useState<LiveMatchCenterSnapshot | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [selectedClubPanel, setSelectedClubPanel] = useState<ClubLivePanel | null>(null);
  const [selectedPlayerPanel, setSelectedPlayerPanel] = useState<PlayerLivePanel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (snapshot) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setError(null);
      const data = await serviceRef.current.getLiveMatchCenterSnapshot({
        gameweekId: options.gameweekId,
        connectedEntryId: options.connectedEntryId ?? null,
        connectedLeagueId: options.connectedLeagueId ?? null,
        forceRefresh: true,
      });

      setSnapshot(data);

      if (selectedClubId !== null) {
        setSelectedClubPanel(serviceRef.current.getClubLivePanel(selectedClubId));
      }
      if (selectedPlayerId !== null) {
        setSelectedPlayerPanel(serviceRef.current.getPlayerLivePanel(selectedPlayerId));
      }
    } catch (refreshError) {
      setError(
        refreshError instanceof Error ? refreshError.message : 'Failed to refresh live data'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    options.connectedEntryId,
    options.connectedLeagueId,
    options.gameweekId,
    selectedClubId,
    selectedPlayerId,
    snapshot,
  ]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [refresh]);

  useEffect(() => {
    const service = serviceRef.current;
    const pollKey = `live-match-center-${options.connectedEntryId ?? 'public'}`;

    if (!options.autoRefresh) {
      service.stopRefresh(pollKey);
      return;
    }

    const intervalMs = options.refreshIntervalMs ?? 30000;
    service.startBackgroundPolling(pollKey, intervalMs, async () => {
      try {
        const data = await service.getLiveMatchCenterSnapshot({
          gameweekId: options.gameweekId,
          connectedEntryId: options.connectedEntryId ?? null,
          connectedLeagueId: options.connectedLeagueId ?? null,
          forceRefresh: true,
        });

        setSnapshot(data);

        if (selectedClubId !== null) {
          setSelectedClubPanel(service.getClubLivePanel(selectedClubId));
        }
        if (selectedPlayerId !== null) {
          setSelectedPlayerPanel(service.getPlayerLivePanel(selectedPlayerId));
        }
      } catch {
        // Keep last successful snapshot if polling fails.
      }
    });

    return () => {
      service.stopRefresh(pollKey);
    };
  }, [
    options.autoRefresh,
    options.connectedEntryId,
    options.connectedLeagueId,
    options.gameweekId,
    options.refreshIntervalMs,
    selectedClubId,
    selectedPlayerId,
  ]);

  const selectClub = useCallback((clubId: number | null): void => {
    setSelectedClubId(clubId);
    if (clubId === null) {
      setSelectedClubPanel(null);
      return;
    }
    setSelectedClubPanel(serviceRef.current.getClubLivePanel(clubId));
  }, []);

  const selectPlayer = useCallback((playerId: number | null): void => {
    setSelectedPlayerId(playerId);
    if (playerId === null) {
      setSelectedPlayerPanel(null);
      return;
    }
    setSelectedPlayerPanel(serviceRef.current.getPlayerLivePanel(playerId));
  }, []);

  return useMemo(
    () => ({
      snapshot,
      selectedClubPanel,
      selectedPlayerPanel,
      selectedClubId,
      selectedPlayerId,
      isLoading,
      isRefreshing,
      error,
      refresh,
      selectClub,
      selectPlayer,
    }),
    [
      snapshot,
      selectedClubPanel,
      selectedPlayerPanel,
      selectedClubId,
      selectedPlayerId,
      isLoading,
      isRefreshing,
      error,
      refresh,
      selectClub,
      selectPlayer,
    ]
  );
}
