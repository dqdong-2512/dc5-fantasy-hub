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
  PlayerRiskFlag,
  TeamFixtureRun,
  TeamInsightSummary,
  TransferCandidate,
} from '../types/decision-hub';

interface AnalyticsDecisionContextValue extends AnalyticsDecisionSnapshot {
  isLoading: boolean;
  error: string | null;
  captainCandidates: CaptainCandidate[];
  managerCaptainCandidates: CaptainCandidate[];
  transferCandidates: TransferCandidate[];
  fixtureRuns: TeamFixtureRun[];
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

  const managerRecords = useMemo(
    () => analytics.filter((record) => managerPlayerIds.includes(record.playerId)),
    [analytics, managerPlayerIds]
  );

  const captainCandidates = useMemo(
    () => decisionService.getCaptainCandidates(analytics, false),
    [analytics, decisionService]
  );

  const managerCaptainCandidates = useMemo(
    () => decisionService.getCaptainCandidates(analytics, true),
    [analytics, decisionService]
  );

  const transferCandidates = useMemo(
    () => decisionService.getTransferCandidates(analytics, managerPlayerIds, managerBankInMillions),
    [analytics, decisionService, managerPlayerIds, managerBankInMillions]
  );

  const fixtureRuns = useMemo(() => decisionService.getFixtureRuns(), [decisionService]);

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
    isPreSeason: bootstrapRepository.isPreSeason(),
    connectedEntryId,
    managerPlayerIds,
    managerBankInMillions,
    isLoading,
    error,
    captainCandidates,
    managerCaptainCandidates,
    transferCandidates,
    fixtureRuns,
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
