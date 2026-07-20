/**
 * Gameweek Center Page
 * Central hub for gameweek-specific data and analysis
 * Displays manager performance, player contributions, fixtures, and captain impact
 */

import React, { useMemo } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageContainer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { GameweekCenterService } from '../services';
import {
  GameweekSelector,
  GameweekSummary,
  CaptainImpact,
  PointsBreakdown,
  FixturesList,
  FootballPitch,
  Bench,
} from '../components';

export const GameweekCenterPage: React.FC = () => {
  const { gameweekId: gameweekIdParam } = useParams<{ gameweekId: string }>();
  const navigate = useNavigate();

  const gameweekIdNum = useMemo(() => {
    return gameweekIdParam ? parseInt(gameweekIdParam, 10) : null;
  }, [gameweekIdParam]);

  const service = useMemo(() => new GameweekCenterService(), []);

  // Get gameweek center data
  // Note: Without a configured manager ID, this returns public gameweek data only
  const gameweekData = useMemo(() => {
    if (!gameweekIdNum) return null;
    return service.getGameweekCenterData(gameweekIdNum);
  }, [gameweekIdNum, service]);

  // Handle invalid gameweek
  if (!gameweekData) {
    // Redirect to latest available gameweek
    const latest = service.getLatestGameweek();
    if (latest) {
      return <Navigate to={`/premier-league/fantasy-game/gameweeks/${latest.id}`} replace />;
    }
    // No gameweeks available, redirect to dashboard
    return <Navigate to="/premier-league/fantasy-game" replace />;
  }

  const handleBack = (): void => {
    navigate('/premier-league/fantasy-game', { replace: true });
  };

  // Helper to get status display
  const statusDisplay = useMemo(() => {
    return GameweekCenterService.formatStatus(gameweekData.status);
  }, [gameweekData.status]);

  const statusColor = useMemo(() => {
    return GameweekCenterService.getStatusColor(gameweekData.status);
  }, [gameweekData.status]);

  return (
    <Box>
      {/* Compact Page Header */}
      <Box
        sx={{
          padding: ThemeTokens.spacing.xs,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            textTransform: 'none',
            marginBottom: 1.5,
            color: '#1976d2',
            padding: 0,
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          Back to Fantasy Game
        </Button>

        {/* Page Title + Selector + Status */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                marginBottom: 0.5,
              }}
            >
              Gameweek Center
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Fantasy Premier League / Gameweek {gameweekData.gameweek.id}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              marginLeft: 'auto',
            }}
          >
            <GameweekSelector currentGameweekId={gameweekData.gameweek.id} />
          </Box>
        </Box>

        {/* Status Indicator */}
        <Box sx={{ marginTop: 1.5 }}>
          <Typography
            sx={{
              display: 'inline-block',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: statusColor,
            }}
          >
            {statusDisplay}
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <PageContainer sx={{ padding: ThemeTokens.spacing.xs }}>
        {/* Missing Manager Snapshot Alert */}
        {gameweekData.hasMissingSnapshot && (
          <Alert severity="info" sx={{ marginBottom: ThemeTokens.spacing.md }}>
            Team snapshot is not available for this gameweek. Public gameweek information is
            displayed below.
          </Alert>
        )}

        {/* Manager Data Sections */}
        {gameweekData.managerSnapshot && (
          <>
            {/* Gameweek Summary */}
            <GameweekSummary snapshot={gameweekData.managerSnapshot} />

            {/* Captain Impact */}
            <CaptainImpact snapshot={gameweekData.managerSnapshot} />

            {/* My Gameweek Team - Pitch Visualization */}
            <Box sx={{ marginBottom: ThemeTokens.spacing.md }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1.5,
                  fontSize: '1rem',
                }}
              >
                My Gameweek Team
              </Typography>

              {/* Convert contributions to pitch format */}
              <FootballPitch
                squad={gameweekData.managerSnapshot.playerContributions.map((c) => ({
                  playerId: c.playerId,
                  isStarter: !c.isBench,
                  isCaptain: c.isCaptain,
                  isViceCaptain: c.isViceCaptain,
                  gameweekPoints: c.rawPoints,
                }))}
              />

              <Bench
                squad={gameweekData.managerSnapshot.playerContributions.map((c) => ({
                  playerId: c.playerId,
                  isStarter: !c.isBench,
                  benchOrder: c.benchOrder,
                  gameweekPoints: c.rawPoints,
                }))}
              />
            </Box>

            {/* Points Breakdown */}
            <PointsBreakdown snapshot={gameweekData.managerSnapshot} />
          </>
        )}

        {/* Fixtures Section - Always show for public data */}
        <FixturesList gameweekId={gameweekData.gameweek.id} />

        {/* Bottom Padding */}
        <Box sx={{ paddingBottom: ThemeTokens.spacing.xs }} />
      </PageContainer>
    </Box>
  );
};
