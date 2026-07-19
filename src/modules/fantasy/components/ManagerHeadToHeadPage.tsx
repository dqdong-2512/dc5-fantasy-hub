/**
 * Manager Head-to-Head Workspace Page
 * Main orchestration component for head-to-head analysis
 * Integrates all comparison sections into a cohesive workspace
 */

import React, { useMemo } from 'react';
import { Box, Alert, Typography, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { ThemeTokens } from '@shared/theme/tokens';
import { ManagerHeadToHeadService } from '../services/ManagerHeadToHeadService';
import { GameweekCenterService } from '../services/GameweekCenterService';
import {
  ManagerHeadToHeadHero,
  OverallComparisonGrid,
  GameweekComparisonGrid,
  SquadComparisonSection,
  DifferentialAnalysisSection,
  CaptainShowdown,
  TransferImpact,
  BenchImpact,
  KeyPointDifferencesSection,
  PlayerContributionComparisonTable,
  OpponentSwitcherDropdown,
  ManagerHeadToHeadGameweekSelector,
} from './head-to-head-workspace';
import type { ManagerHeadToHeadComparison, PlayerComparisonRow } from '@domain/models';
import type { LeagueStandingEntry, FantasySquadPick } from '../types';
import { GameweekStatus } from '@domain/models';

export interface ManagerHeadToHeadPageProps {
  leagueId: number;
  currentManagerId: number;
  opponentManagerId: number;
  standings: LeagueStandingEntry[];
  currentManagerName: string;
  opponentManagerName: string;
  currentSquad: FantasySquadPick[];
  opponentSquad: FantasySquadPick[];
}

export const ManagerHeadToHeadPage: React.FC<ManagerHeadToHeadPageProps> = ({
  leagueId,
  currentManagerId,
  opponentManagerId,
  standings,
  currentManagerName,
  opponentManagerName,
  currentSquad,
  opponentSquad,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const service = useMemo(() => new ManagerHeadToHeadService(), []);
  const gameweekService = useMemo(() => new GameweekCenterService(), []);

  // Get gameweek from query parameter or use latest
  const selectedGameweek = useMemo(() => {
    const gw = searchParams.get('gw');
    if (gw) {
      const gwNum = parseInt(gw, 10);
      if (!isNaN(gwNum)) {
        return gwNum;
      }
    }

    // Fall back to latest available gameweek
    const available = service.getAvailableGameweeks();
    return available.length > 0 ? available[available.length - 1] : null;
  }, [searchParams, service]);

  // Update URL if gameweek parameter missing
  React.useEffect(() => {
    if (selectedGameweek && !searchParams.get('gw')) {
      setSearchParams({ gw: String(selectedGameweek) });
    }
  }, [selectedGameweek, searchParams, setSearchParams]);

  // Get gameweek data and status
  const gameweekData = useMemo(() => {
    if (!selectedGameweek) {
      return null;
    }
    return gameweekService.getGameweekCenterData(selectedGameweek, currentManagerId);
  }, [selectedGameweek, gameweekService, currentManagerId]);

  // Derive data status
  const dataStatus = useMemo((): 'live' | 'final' | 'snapshot' | 'upcoming' => {
    if (!gameweekData) {
      return 'upcoming';
    }

    if (gameweekData.status === GameweekStatus.Finished) {
      return 'final';
    }
    if (gameweekData.status === GameweekStatus.InProgress) {
      return 'live';
    }
    return 'upcoming';
  }, [gameweekData]);

  // Build head-to-head comparison
  const comparison: ManagerHeadToHeadComparison | null = useMemo(() => {
    if (!selectedGameweek) {
      return null;
    }

    return service.buildHeadToHeadComparison(
      leagueId,
      currentManagerId,
      opponentManagerId,
      selectedGameweek,
      standings,
      currentSquad,
      opponentSquad,
      dataStatus
    );
  }, [
    selectedGameweek,
    leagueId,
    currentManagerId,
    opponentManagerId,
    standings,
    currentSquad,
    opponentSquad,
    dataStatus,
    service,
  ]);

  // Build squad comparison data
  const squadComparisonData = useMemo(() => {
    if (!comparison) return null;

    // Get shared player names from player contribution comparison
    const playerComparisonRows = service.buildPlayerContributionComparison(
      comparison.currentManagerSnapshot,
      comparison.opponentManagerSnapshot,
      currentSquad,
      opponentSquad,
      comparison.differentialAnalysis
    );

    const shared = playerComparisonRows.filter((row) => row.isShared).map((row) => row.playerName);

    const currentDiffs = playerComparisonRows
      .filter((row) => row.currentManagerContribution > 0 && !row.isShared)
      .map((row) => row.playerName);

    const opponentDiffs = playerComparisonRows
      .filter((row) => row.opponentManagerContribution > 0 && !row.isShared)
      .map((row) => row.playerName);

    return { shared, currentDiffs, opponentDiffs };
  }, [comparison, currentSquad, opponentSquad, service]);

  // Build player contribution comparison table
  const playerComparisonRows: PlayerComparisonRow[] = useMemo(() => {
    if (!comparison) return [];

    return service.buildPlayerContributionComparison(
      comparison.currentManagerSnapshot,
      comparison.opponentManagerSnapshot,
      currentSquad,
      opponentSquad,
      comparison.differentialAnalysis
    );
  }, [comparison, currentSquad, opponentSquad, service]);

  // Handle invalid gameweek
  if (!selectedGameweek) {
    return (
      <Box sx={{ p: ThemeTokens.spacing.md }}>
        <Alert severity="warning">
          Comparison data is not available for the selected gameweek.
        </Alert>
      </Box>
    );
  }

  // Handle missing comparison data
  if (!comparison) {
    return (
      <Box sx={{ p: ThemeTokens.spacing.md, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Handle missing squad comparison data
  if (!squadComparisonData) {
    return (
      <Box sx={{ p: ThemeTokens.spacing.md }}>
        <Alert severity="info">Squad comparison data unavailable.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: ThemeTokens.spacing.lg }}>
      {/* Header with Selectors */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: ThemeTokens.spacing.md,
          borderBottom: '1px solid #e0e0e0',
          flexWrap: 'wrap',
          gap: ThemeTokens.spacing.md,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          Head-to-Head
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: ThemeTokens.spacing.md,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <OpponentSwitcherDropdown
            leagueId={leagueId}
            currentManagerId={currentManagerId}
            selectedOpponentId={opponentManagerId}
            standings={standings}
          />

          <ManagerHeadToHeadGameweekSelector
            selectedGameweek={selectedGameweek}
            dataStatus={dataStatus}
            onGameweekChange={(gw) => setSearchParams({ gw: String(gw) })}
          />
        </Box>
      </Box>

      {/* Head-to-Head Hero */}
      <ManagerHeadToHeadHero
        comparison={comparison}
        currentManagerName={currentManagerName}
        opponentManagerName={opponentManagerName}
      />

      {/* Overall and Gameweek Comparison Side-by-Side */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: ThemeTokens.spacing.lg,
        }}
      >
        <OverallComparisonGrid comparison={comparison.overallComparison} />
        <GameweekComparisonGrid comparison={comparison.gameweekComparison} />
      </Box>

      {/* Squad Comparison */}
      <SquadComparisonSection
        sharedPlayers={squadComparisonData.shared}
        currentDifferentials={squadComparisonData.currentDiffs}
        opponentDifferentials={squadComparisonData.opponentDiffs}
      />

      {/* Differential Analysis */}
      <DifferentialAnalysisSection analysis={comparison.differentialAnalysis} />

      {/* Captain and Transfer Analysis Side-by-Side */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: ThemeTokens.spacing.lg,
        }}
      >
        <CaptainShowdown comparison={comparison.captainComparison} />
        <TransferImpact comparison={comparison.transferComparison} />
      </Box>

      {/* Bench Impact */}
      <BenchImpact comparison={comparison.benchComparison} />

      {/* Key Point Differences */}
      <KeyPointDifferencesSection comparison={comparison} />

      {/* Player Contribution Comparison Table */}
      <PlayerContributionComparisonTable rows={playerComparisonRows} />
    </Box>
  );
};
