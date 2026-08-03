/**
 * Fantasy Game Overview Page (Enhanced Dashboard)
 * Main entry point for Fantasy Premier League game management
 * Integrates all planning tools into one cohesive dashboard:
 * - Team summary and current gameweek stats
 * - Planning status (Transfer, Gameweek, Season plans)
 * - Next actions derived from application state
 * - League snapshots with navigation
 * - Gameweek context and deadlines
 * - Quick actions for major features
 */

import React, { useMemo } from 'react';
import { Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import {
  MyTeamSummary,
  CurrentGameweekSummary,
  QuickActions,
  PlanningStatusPanel,
  NextActionsPanel,
  LeagueSnapshot,
  GameweekContext,
} from '../widgets';
import { FplConnectionGate } from '../components';
import { FantasyDashboardService, FantasyGameDataAdapter } from '../services';
import { useGameweekHubState } from '../context';
import { getBootstrapRepository } from '@repositories/index';

export const FantasyGameOverview: React.FC = () => {
  const gameState = useGameweekHubState();
  const navigate = useNavigate();
  const bootstrapRepository = useMemo(() => getBootstrapRepository(), []);

  // Initialize dashboard service (must be unconditional)
  const dashboardService = useMemo(() => new FantasyDashboardService(), []);
  const dashboardData = useMemo(
    () => dashboardService.buildDashboardViewModel(gameState.entry),
    [dashboardService, gameState.entry]
  );

  // Prepare manager and gameweek data
  // Use real data if connected, otherwise use fixtures
  const managerData = useMemo(() => {
    if (gameState.isConnected && gameState.entry) {
      return FantasyGameDataAdapter.entryToManagerFixture(gameState.entry);
    }
    return null;
  }, [gameState.isConnected, gameState.entry]);

  const gameweekData = useMemo(() => {
    if (gameState.history && gameState.history.length > 0) {
      return FantasyGameDataAdapter.getLatestGameweekFromHistory(gameState.history);
    }
    const current = bootstrapRepository.getCurrentGameweek();
    return current ? FantasyGameDataAdapter.gameweekToFixture(current) : null;
  }, [gameState.history, bootstrapRepository]);

  // Show not-connected state if user hasn't connected (conditional rendering)
  if (!gameState.isConnected) {
    return (
      <PageContainer>
        <FplConnectionGate
          title="Connect your FPL team"
          description="Connect inline to unlock My Team, League, transfers, and personalized gameweek insights."
        />
        <Alert severity="info" sx={{ mt: ThemeTokens.spacing.sm }}>
          Your Entry ID identifies your FPL team. You can find it in your FPL URL when viewing your
          team.
        </Alert>
      </PageContainer>
    );
  }

  // Navigation handlers
  const handleViewTeam = (): void => {
    navigate('/premier-league/gameweek/my-team');
  };

  const handleViewGameweek = (): void => {
    const gameweekNum = gameState.isConnected
      ? gameState.displayGameweek
      : bootstrapRepository.getCurrentGameweek()?.id;
    if (!gameweekNum) return;
    navigate(`/premier-league/gameweek/gameweeks/${gameweekNum}`);
  };

  const handleViewLeagues = (): void => {
    navigate('/premier-league/gameweek/league');
  };

  const handleLeagueClick = (leagueId: number): void => {
    navigate(`/premier-league/gameweek/league/${leagueId}`);
  };

  const handleTransferPlanClick = (): void => {
    navigate('/premier-league/gameweek/transfers');
  };

  const handleGameweekPlanClick = (): void => {
    const gw = dashboardData.gameweek.nextGameweekId ?? dashboardData.gameweek.currentGameweekId;
    navigate(`/premier-league/gameweek/planner?gw=${gw}`);
  };

  const handleSeasonPlanClick = (): void => {
    navigate('/premier-league/gameweek/season-planner');
  };

  const handleGameweekCenterClick = (): void => {
    navigate(`/premier-league/gameweek/gameweeks/${dashboardData.gameweek.currentGameweekId}`);
  };

  return (
    <PageContainer
      sx={{
        paddingTop: { xs: ThemeTokens.spacing.lg, md: ThemeTokens.spacing.xl },
        paddingBottom: ThemeTokens.spacing.xxl,
      }}
    >
        {/* SECTION 1: Gameweek Overview & Team Summary (2-col layout on desktop) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr', lg: '1fr 1fr' },
            gap: ThemeTokens.spacing.xl,
            marginBottom: ThemeTokens.spacing.xl,
            alignItems: 'stretch',
          }}
        >
          {managerData && (
            <Box sx={{ height: { xs: 'auto', lg: '100%' }, minHeight: 0 }}>
              <MyTeamSummary manager={managerData} onViewTeam={handleViewTeam} />
            </Box>
          )}
          {gameweekData && (
            <Box sx={{ height: { xs: 'auto', lg: '100%' }, minHeight: 0 }}>
              <CurrentGameweekSummary gameweek={gameweekData} onViewGameweek={handleViewGameweek} />
            </Box>
          )}
        </Box>

        {/* SECTION 2: Planning Status & Next Actions (2-col layout on desktop) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr', lg: '1fr 1fr' },
            gap: ThemeTokens.spacing.xl,
            marginBottom: ThemeTokens.spacing.xl,
            alignItems: 'stretch',
            '& > *': {
              height: '100%',
              minHeight: { xs: 'auto', lg: 300 },
            },
          }}
        >
          <PlanningStatusPanel
            transferStatus={dashboardData.transferStatus}
            gameweekStatus={dashboardData.gameweekStatus}
            seasonStatus={dashboardData.seasonStatus}
            onTransferClick={handleTransferPlanClick}
            onGameweekClick={handleGameweekPlanClick}
            onSeasonClick={handleSeasonPlanClick}
          />

          <NextActionsPanel
            actions={dashboardData.nextActions}
            onTransferClick={handleTransferPlanClick}
            onGameweekClick={handleGameweekPlanClick}
            onSeasonClick={handleSeasonPlanClick}
            onGameweekCenterClick={handleGameweekCenterClick}
          />
        </Box>

        {/* SECTION 3: League Snapshot & Gameweek Context (2-col layout on desktop) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr', lg: '1fr 1fr' },
            gap: ThemeTokens.spacing.xl,
            marginBottom: ThemeTokens.spacing.xl,
            alignItems: 'stretch',
            '& > *': {
              height: '100%',
              minHeight: { xs: 'auto', lg: 300 },
            },
          }}
        >
          <LeagueSnapshot leagues={dashboardData.leagues} onLeagueClick={handleLeagueClick} />

          <GameweekContext
            gameweek={dashboardData.gameweek}
            onViewGameweek={handleGameweekCenterClick}
          />
        </Box>

        {/* SECTION 4: Quick Actions */}
        <Box sx={{ marginBottom: ThemeTokens.spacing.xl }}>
          <QuickActions onViewTeam={handleViewTeam} onViewLeagues={handleViewLeagues} />
        </Box>
    </PageContainer>
  );
};
