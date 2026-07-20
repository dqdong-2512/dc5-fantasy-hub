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
import { Box, Typography, Button, Alert } from '@mui/material';
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
import { FantasyDashboardService, FantasyGameDataAdapter } from '../services';
import { useFantasyGame } from '../hooks';
import { fantasyGameFixtures } from '../fixtures';

export const FantasyGameOverview: React.FC = () => {
  const gameState = useFantasyGame();
  const navigate = useNavigate();
  const fixtures = useMemo(() => fantasyGameFixtures, []);

  // Show not-connected state if user hasn't connected
  if (!gameState.isConnected) {
    return (
      <PageContainer>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            py: 8,
            gap: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Not Connected
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 500 }}>
            To access your Fantasy Premier League team, you need to connect with your entry ID.
          </Typography>
          <Alert severity="info" sx={{ maxWidth: 500 }}>
            Your entry ID is a unique number that identifies your FPL team. You can find it in your
            FPL account or in the browser URL when viewing your team on fantasy.premierleague.com
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/premier-league/fantasy-game')}
            color="primary"
            size="large"
          >
            Go to Connection Form
          </Button>
        </Box>
      </PageContainer>
    );
  }

  // Initialize dashboard service
  const dashboardService = useMemo(() => new FantasyDashboardService(), []);
  const dashboardData = useMemo(
    () => dashboardService.buildDashboardViewModel(),
    [dashboardService]
  );

  // Prepare manager and gameweek data
  // Use real data if connected, otherwise use fixtures
  const managerData = useMemo(() => {
    if (gameState.isConnected && gameState.entry) {
      return FantasyGameDataAdapter.entryToManagerFixture(gameState.entry);
    }
    return fixtures.manager;
  }, [gameState.isConnected, gameState.entry, fixtures.manager]);

  const gameweekData = useMemo(() => {
    if (gameState.isConnected && gameState.history && gameState.history.length > 0) {
      return FantasyGameDataAdapter.getLatestGameweekFromHistory(gameState.history);
    }
    return fixtures.currentGameweek;
  }, [gameState.isConnected, gameState.history, fixtures.currentGameweek]);

  // Navigation handlers
  const handleViewTeam = (): void => {
    navigate('/premier-league/fantasy-game/team');
  };

  const handleViewGameweek = (): void => {
    const gameweekNum = gameState.isConnected
      ? gameState.displayGameweek
      : fantasyGameFixtures.currentGameweek.gameweek;
    navigate(`/premier-league/fantasy-game/gameweeks/${gameweekNum}`);
  };

  const handleViewLeagues = (): void => {
    navigate('/premier-league/fantasy-game/leagues');
  };

  const handleLeagueClick = (leagueId: number): void => {
    navigate(`/premier-league/fantasy-game/leagues/${leagueId}`);
  };

  const handleTransferPlanClick = (): void => {
    navigate('/premier-league/fantasy-game/transfer-planner');
  };

  const handleGameweekPlanClick = (): void => {
    const gw = dashboardData.gameweek.nextGameweekId ?? dashboardData.gameweek.currentGameweekId;
    navigate(`/premier-league/fantasy-game/gameweek-planner?gw=${gw}`);
  };

  const handleSeasonPlanClick = (): void => {
    navigate('/premier-league/fantasy-game/season-planner');
  };

  const handleGameweekCenterClick = (): void => {
    navigate(`/premier-league/fantasy-game/gameweeks/${dashboardData.gameweek.currentGameweekId}`);
  };

  const handleDisconnect = (): void => {
    gameState.disconnectEntry();
    navigate('/premier-league/fantasy-game', { replace: true });
  };

  return (
    <Box>
      {/* Connection Header with Disconnect Button */}
      {gameState.isConnected && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: ThemeTokens.spacing.md,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Button
            size="small"
            onClick={handleDisconnect}
            sx={{
              textTransform: 'none',
              color: '#64748b',
              '&:hover': { backgroundColor: '#f1f5f9' },
            }}
          >
            Disconnect
          </Button>
        </Box>
      )}

      {/* Page Header - Centered Logo and Subtitle */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          paddingX: ThemeTokens.spacing.md,
          paddingY: { xs: ThemeTokens.spacing.sm, md: '32px' },
        }}
      >
        {/* FPL Logo */}
        <Box
          component="img"
          src="/fantasy-logo.png"
          alt="Fantasy Premier League"
          sx={{
            height: { xs: '80px', sm: '100px', md: '160px' },
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            flexShrink: 0,
            marginBottom: { xs: '2', md: '4' },
          }}
        />

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            fontSize: { xs: '15px', sm: '16px', md: '18px' },
            letterSpacing: '0.3px',
            lineHeight: 1.5,
            color: '#64748b',
            maxWidth: '600px',
          }}
        >
          Manage your FPL team, gameweeks and leagues
        </Typography>
      </Box>

      {/* Main Content Container */}
      <PageContainer
        sx={{
          padding: ThemeTokens.spacing.xs,
        }}
      >
        {/* SECTION 1: Gameweek Overview & Team Summary (2-col layout on desktop) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr', lg: '1fr 1fr' },
            gap: ThemeTokens.spacing.md,
            marginBottom: ThemeTokens.spacing.md,
            alignItems: { xs: 'start', lg: 'stretch' },
          }}
        >
          <Box sx={{ height: { xs: 'auto', lg: '100%' }, minHeight: 0 }}>
            <MyTeamSummary manager={managerData} onViewTeam={handleViewTeam} />
          </Box>
          <Box sx={{ height: { xs: 'auto', lg: '100%' }, minHeight: 0 }}>
            <CurrentGameweekSummary gameweek={gameweekData} onViewGameweek={handleViewGameweek} />
          </Box>
        </Box>

        {/* SECTION 2: Planning Status & Next Actions (2-col layout on desktop) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr', lg: '1fr 1fr' },
            gap: ThemeTokens.spacing.md,
            marginBottom: ThemeTokens.spacing.md,
            alignItems: 'start',
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
            gap: ThemeTokens.spacing.md,
            marginBottom: ThemeTokens.spacing.md,
            alignItems: 'start',
          }}
        >
          <LeagueSnapshot leagues={dashboardData.leagues} onLeagueClick={handleLeagueClick} />

          <GameweekContext
            gameweek={dashboardData.gameweek}
            onViewGameweek={handleGameweekCenterClick}
          />
        </Box>

        {/* SECTION 4: Quick Actions */}
        <Box sx={{ marginBottom: ThemeTokens.spacing.md }}>
          <QuickActions onViewTeam={handleViewTeam} onViewLeagues={handleViewLeagues} />
        </Box>
      </PageContainer>
    </Box>
  );
};
