/**
 * useEnrichedManagerPicks Hook
 * Fetches manager picks and enriches them with real-time player performance data
 * Stores picks metadata separately for access
 */

import { useState, useCallback, useEffect } from 'react';
import { FantasyGameRepository } from '@repositories/fantasy';
import { PlayerRepository } from '@repositories/players';
import { PickEnrichmentService } from '../services/pick-enrichment.service';
import type { ManagerPickWithPlayerData } from './useManagerPicks';
import type { PickEnrichmentResult, EnrichedPick } from '../services/pick-enrichment.service';

export interface UseEnrichedManagerPicksState {
  // Enriched picks with player points
  enrichedPicks: PickEnrichmentResult | null;
  starters: (ManagerPickWithPlayerData & {
    playerEventPoints: number;
    playerEffectivePoints: number;
  })[];
  bench: (ManagerPickWithPlayerData & {
    playerEventPoints: number;
    playerEffectivePoints: number;
  })[];
  captain:
    | (ManagerPickWithPlayerData & {
        playerEventPoints: number;
        playerEffectivePoints: number;
      })
    | undefined;
  viceCaptain:
    | (ManagerPickWithPlayerData & {
        playerEventPoints: number;
        playerEffectivePoints: number;
      })
    | undefined;

  // Summary
  totalPoints: number;
  captainPoints: number;
  benchPoints: number;

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

interface PicksMetadata {
  transfersMade: number;
  transfersCost: number;
  bankValue: number;
  teamValue: number;
  activeChip: string | null;
}

export function useEnrichedManagerPicks(
  entryId: number | null,
  gameweekId: number | null
): UseEnrichedManagerPicksState {
  const [enrichedResult, setEnrichedResult] = useState<PickEnrichmentResult | null>(null);
  const [metadata, setMetadata] = useState<PicksMetadata>({
    transfersMade: 0,
    transfersCost: 0,
    bankValue: 0,
    teamValue: 0,
    activeChip: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fantasyRepo = new FantasyGameRepository();
  const playerRepo = new PlayerRepository();
  const enrichmentService = new PickEnrichmentService();

  // Fetch and enrich picks
  useEffect(() => {
    if (!entryId || !gameweekId) {
      setEnrichedResult(null);
      return;
    }

    const loadEnrichedPicks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get raw picks
        const picksData = await fantasyRepo.getEntryPicks(entryId, gameweekId);

        // Store metadata
        setMetadata({
          transfersMade: picksData.transfersMade,
          transfersCost: picksData.transfersCost,
          bankValue: picksData.bankValue,
          teamValue: picksData.teamValue,
          activeChip: picksData.activeChip ?? null,
        });

        // Enrich with event live data
        const enriched = await enrichmentService.enrichPicks(picksData, gameweekId);

        // Enrich picks with player data
        const enrichedWithPlayers = {
          ...enriched,
          picks: enriched.picks.map((pick: EnrichedPick) => ({
            ...pick,
            player: playerRepo.getById(pick.element),
            playerName: playerRepo.getById(pick.element)?.displayName,
          })),
          starters: enriched.starters.map((pick: EnrichedPick) => ({
            ...pick,
            player: playerRepo.getById(pick.element),
            playerName: playerRepo.getById(pick.element)?.displayName,
          })),
          bench: enriched.bench.map((pick: EnrichedPick) => ({
            ...pick,
            player: playerRepo.getById(pick.element),
            playerName: playerRepo.getById(pick.element)?.displayName,
          })),
          captain: enriched.captain
            ? {
                ...enriched.captain,
                player: playerRepo.getById(enriched.captain.element),
                playerName: playerRepo.getById(enriched.captain.element)?.displayName,
              }
            : undefined,
          viceCaptain: enriched.viceCaptain
            ? {
                ...enriched.viceCaptain,
                player: playerRepo.getById(enriched.viceCaptain.element),
                playerName: playerRepo.getById(enriched.viceCaptain.element)?.displayName,
              }
            : undefined,
        };

        setEnrichedResult(
          enrichedWithPlayers as PickEnrichmentResult & {
            picks: any[];
            starters: any[];
            bench: any[];
            captain: any;
            viceCaptain: any;
          }
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load enriched picks');
        setEnrichedResult(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadEnrichedPicks();
  }, [entryId, gameweekId]);

  const refresh = useCallback(async () => {
    if (!entryId || !gameweekId) return;

    try {
      setIsLoading(true);
      const picksData = await fantasyRepo.getEntryPicks(entryId, gameweekId);

      setMetadata({
        transfersMade: picksData.transfersMade,
        transfersCost: picksData.transfersCost,
        bankValue: picksData.bankValue,
        teamValue: picksData.teamValue,
        activeChip: picksData.activeChip ?? null,
      });

      const enriched = await enrichmentService.enrichPicks(picksData, gameweekId);

      const enrichedWithPlayers = {
        ...enriched,
        picks: enriched.picks.map((pick: EnrichedPick) => ({
          ...pick,
          player: playerRepo.getById(pick.element),
          playerName: playerRepo.getById(pick.element)?.displayName,
        })),
        starters: enriched.starters.map((pick: EnrichedPick) => ({
          ...pick,
          player: playerRepo.getById(pick.element),
          playerName: playerRepo.getById(pick.element)?.displayName,
        })),
        bench: enriched.bench.map((pick: EnrichedPick) => ({
          ...pick,
          player: playerRepo.getById(pick.element),
          playerName: playerRepo.getById(pick.element)?.displayName,
        })),
        captain: enriched.captain
          ? {
              ...enriched.captain,
              player: playerRepo.getById(enriched.captain.element),
              playerName: playerRepo.getById(enriched.captain.element)?.displayName,
            }
          : undefined,
        viceCaptain: enriched.viceCaptain
          ? {
              ...enriched.viceCaptain,
              player: playerRepo.getById(enriched.viceCaptain.element),
              playerName: playerRepo.getById(enriched.viceCaptain.element)?.displayName,
            }
          : undefined,
      };

      setEnrichedResult(
        enrichedWithPlayers as PickEnrichmentResult & {
          picks: any[];
          starters: any[];
          bench: any[];
          captain: any;
          viceCaptain: any;
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh enriched picks');
    } finally {
      setIsLoading(false);
    }
  }, [entryId, gameweekId]);

  return {
    enrichedPicks: enrichedResult,
    starters: enrichedResult?.starters ?? [],
    bench: enrichedResult?.bench ?? [],
    captain: enrichedResult?.captain,
    viceCaptain: enrichedResult?.viceCaptain,
    totalPoints: enrichedResult?.totalPoints ?? 0,
    captainPoints: enrichedResult?.captainPoints ?? 0,
    benchPoints: enrichedResult?.benchPoints ?? 0,
    transfersMade: metadata.transfersMade,
    transfersCost: metadata.transfersCost,
    bankValue: metadata.bankValue,
    teamValue: metadata.teamValue,
    activeChip: metadata.activeChip,
    isLoading,
    error,
    refresh,
  };
}
