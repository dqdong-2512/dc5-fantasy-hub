import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Player } from '@domain/models';
import {
  getBootstrapRepository,
  getPlayerRepository,
  getTeamRepository,
} from '@repositories/index';
import { FantasyGameRepository } from '@repositories/fantasy';
import { EntryStorage } from '@shared/services/entry-storage';
import { PlayerAnalyticsService } from '../services/player-analytics.service';
import { DecisionHubService } from '../services/decision-hub.service';
import type {
  AnalyticsDecisionSnapshot,
  CaptainCandidate,
  DifferentialPick,
  PlayerFormProfile,
  PlayerRiskFlag,
  TeamFixtureRun,
  TeamInsightSummary,
  TransferCandidate,
  ValueIndexRecord,
} from '../types/decision-hub';

interface AnalyticsDecisionContextValue extends AnalyticsDecisionSnapshot {
  isLoading: boolean;
  error: string | null;
  captainCandidates: CaptainCandidate[];
  managerCaptainCandidates: CaptainCandidate[];
  transferRecommendations: TransferCandidate[];
  topBuyCandidates: TransferCandidate[];
  topSellCandidates: TransferCandidate[];
  topWatchlistCandidates: TransferCandidate[];
  fixtureRuns: TeamFixtureRun[];
  fixtureSwings: TeamFixtureRun[];
  differentialPicks: DifferentialPick[];
  valueIndex: ValueIndexRecord[];
  risingPlayers: PlayerFormProfile[];
  fallingPlayers: PlayerFormProfile[];
  injuryWatch: Array<{
    playerId: number;
    playerName: string;
    status: string;
    club: string;
  }>;
  latestTransferSignals: Array<{
    playerId: number;
    playerName: string;
    direction: 'in' | 'out' | 'neutral';
    score: number;
  }>;
  managerRecords: ReturnType<PlayerAnalyticsService['buildAllAnalytics']>;
  teamSummary: TeamInsightSummary;
  teamRiskFlags: PlayerRiskFlag[];
  refresh: () => Promise<void>;
}

const AnalyticsDecisionContext = createContext<AnalyticsDecisionContextValue | null>(null);

export function AnalyticsDecisionProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const playerRepository = useMemo(() => getPlayerRepository(), []);
  const teamRepository = useMemo(() => getTeamRepository(), []);
  const bootstrapRepository = useMemo(() => getBootstrapRepository(), []);
  const fantasyRepository = useMemo(() => new FantasyGameRepository(), []);
  const decisionService = useMemo(() => new DecisionHubService(), []);

  const [players, setPlayers] = useState<Player[]>([]);
  const [managerPlayerIds, setManagerPlayerIds] = useState<number[]>([]);
  const [managerBankInMillions, setManagerBankInMillions] = useState<number | null>(null);
  const [connectedEntryId, setConnectedEntryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const allPlayers = playerRepository.getAll();
      setPlayers(allPlayers);

      const entryId = EntryStorage.getConnectedEntryId();
      setConnectedEntryId(entryId);

      if (!entryId) {
        setManagerPlayerIds([]);
        setManagerBankInMillions(null);
        return;
      }

      const currentGameweek = bootstrapRepository.getCurrentGameweek();
      if (!currentGameweek) {
        setManagerPlayerIds([]);
        setManagerBankInMillions(null);
        return;
      }

      const picks = await fantasyRepository.getEntryPicks(entryId, currentGameweek.id);
      setManagerPlayerIds(picks.picks.map((pick) => pick.element));
      setManagerBankInMillions(picks.bankValue / 10);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load analytics context');
      setManagerPlayerIds([]);
      setManagerBankInMillions(null);
    } finally {
      setIsLoading(false);
    }
  }, [bootstrapRepository, fantasyRepository, playerRepository]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const analyticsService = useMemo(
    () => new PlayerAnalyticsService(managerPlayerIds),
    [managerPlayerIds]
  );

  const analytics = useMemo(
    () => analyticsService.buildAllAnalytics(players),
    [analyticsService, players]
  );

  const formProfiles = useMemo(
    () => decisionService.buildPlayerFormProfiles(players),
    [decisionService, players]
  );

  const managerRecords = useMemo(
    () => analytics.filter((record) => managerPlayerIds.includes(record.playerId)),
    [analytics, managerPlayerIds]
  );

  const captainCandidates = useMemo(
    () => decisionService.getCaptainCandidates(analytics, formProfiles, false),
    [analytics, decisionService, formProfiles]
  );

  const managerCaptainCandidates = useMemo(
    () => decisionService.getCaptainCandidates(analytics, formProfiles, true),
    [analytics, decisionService, formProfiles]
  );

  const transferRecommendations = useMemo(
    () =>
      decisionService.buildTransferRecommendations(
        analytics,
        formProfiles,
        managerPlayerIds,
        managerBankInMillions
      ),
    [analytics, decisionService, formProfiles, managerPlayerIds, managerBankInMillions]
  );

  const topBuyCandidates = useMemo(
    () => transferRecommendations.filter((candidate) => candidate.action === 'buy').slice(0, 12),
    [transferRecommendations]
  );

  const topSellCandidates = useMemo(
    () => transferRecommendations.filter((candidate) => candidate.action === 'sell').slice(0, 12),
    [transferRecommendations]
  );

  const topWatchlistCandidates = useMemo(
    () =>
      transferRecommendations.filter((candidate) => candidate.action === 'watchlist').slice(0, 12),
    [transferRecommendations]
  );

  const fixtureRuns = useMemo(() => decisionService.getFixtureRuns(), [decisionService]);

  const fixtureSwings = useMemo(
    () => [...fixtureRuns].sort((a, b) => Math.abs(b.swing) - Math.abs(a.swing)).slice(0, 8),
    [fixtureRuns]
  );

  const differentialPicks = useMemo(
    () => decisionService.getDifferentialPicks(analytics, formProfiles),
    [analytics, decisionService, formProfiles]
  );

  const valueIndex = useMemo(
    () => decisionService.getValueIndex(analytics, formProfiles),
    [analytics, decisionService, formProfiles]
  );

  const risingPlayers = useMemo(
    () =>
      [...formProfiles]
        .filter((profile) => profile.trend === 'rising')
        .sort((a, b) => b.last5.averagePoints - a.last5.averagePoints)
        .slice(0, 12),
    [formProfiles]
  );

  const fallingPlayers = useMemo(
    () =>
      [...formProfiles]
        .filter((profile) => profile.trend === 'falling')
        .sort((a, b) => a.last5.averagePoints - b.last5.averagePoints)
        .slice(0, 12),
    [formProfiles]
  );

  const injuryWatch = useMemo(
    () =>
      players
        .filter((player) => typeof player.status === 'string' && player.status !== 'a')
        .slice(0, 12)
        .map((player) => ({
          playerId: player.id,
          playerName: player.displayName,
          status: player.status || 'unknown',
          club: player.club,
        })),
    [players]
  );

  const latestTransferSignals = useMemo(
    () =>
      analytics
        .map((record) => {
          let direction: 'in' | 'out' | 'neutral' = 'neutral';
          let score = 0;

          if (record.formScore >= 7 && record.ownership <= 25) {
            direction = 'in';
            score = record.formScore * 10;
          } else if (record.formScore <= 4 && record.ownership >= 18) {
            direction = 'out';
            score = (5 - record.formScore) * 12;
          }

          return {
            playerId: record.playerId,
            playerName: record.playerName,
            direction,
            score: Number(score.toFixed(1)),
          };
        })
        .filter((signal) => signal.direction !== 'neutral')
        .sort((a, b) => b.score - a.score)
        .slice(0, 12),
    [analytics]
  );

  const teamSummary = useMemo(
    () => decisionService.getTeamInsightSummary(managerRecords),
    [decisionService, managerRecords]
  );

  const teamRiskFlags = useMemo(
    () => decisionService.getRiskFlags(players, managerRecords),
    [decisionService, players, managerRecords]
  );

  const value: AnalyticsDecisionContextValue = {
    players,
    teams: teamRepository.getAll(),
    analytics,
    formProfiles,
    isPreSeason: bootstrapRepository.isPreSeason(),
    connectedEntryId,
    managerPlayerIds,
    managerBankInMillions,
    isLoading,
    error,
    captainCandidates,
    managerCaptainCandidates,
    transferRecommendations,
    topBuyCandidates,
    topSellCandidates,
    topWatchlistCandidates,
    fixtureRuns,
    fixtureSwings,
    differentialPicks,
    valueIndex,
    risingPlayers,
    fallingPlayers,
    injuryWatch,
    latestTransferSignals,
    managerRecords,
    teamSummary,
    teamRiskFlags,
    refresh: loadData,
  };

  return (
    <AnalyticsDecisionContext.Provider value={value}>{children}</AnalyticsDecisionContext.Provider>
  );
}

export function useAnalyticsDecision(): AnalyticsDecisionContextValue {
  const context = useContext(AnalyticsDecisionContext);
  if (!context) {
    throw new Error('useAnalyticsDecision must be used inside AnalyticsDecisionProvider');
  }
  return context;
}
