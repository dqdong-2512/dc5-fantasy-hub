/**
 * Gameweek Center Page
 * Central hub for gameweek-specific data and analysis
 * Displays manager performance, player contributions, fixtures, and captain impact
 * Supports both real manager data (when connected) and public gameweek data (when not connected)
 */

import React, { useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SportsSoccerOutlinedIcon from '@mui/icons-material/SportsSoccerOutlined';
import { PageContainer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { FixtureRepository } from '@repositories/fixtures';
import { GameweekCenterService } from '../services';
import { useEnrichedManagerPicks } from '../hooks';
import { useGameweekHubState } from '../context';
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
  const gameState = useGameweekHubState();

  const gameweekIdNum = useMemo(() => {
    return gameweekIdParam ? parseInt(gameweekIdParam, 10) : null;
  }, [gameweekIdParam]);

  const service = useMemo(() => new GameweekCenterService(), []);

  // Load real manager picks if connected
  const managerPicks = useEnrichedManagerPicks(gameState.connectedEntryId, gameweekIdNum);

  // Get gameweek center data (public data + optional manager override)
  const gameweekData = useMemo(() => {
    if (!gameweekIdNum) return null;
    return service.getGameweekCenterData(gameweekIdNum);
  }, [gameweekIdNum, service]);

  // Helper to get status display (must be before early returns)
  const statusDisplay = useMemo(() => {
    if (!gameweekData) return null;
    return GameweekCenterService.formatStatus(gameweekData.status);
  }, [gameweekData]);

  const statusColor = useMemo(() => {
    if (!gameweekData) return null;
    return GameweekCenterService.getStatusColor(gameweekData.status);
  }, [gameweekData]);

  const fixtureSummary = useMemo(() => {
    if (!gameweekIdNum) return { total: 0, finished: 0, live: 0, upcoming: 0 };
    const fixtures = new FixtureRepository().getByGameweek(gameweekIdNum);
    return {
      total: fixtures.length,
      finished: fixtures.filter((fixture) => fixture.finished).length,
      live: fixtures.filter((fixture) => fixture.started && !fixture.finished).length,
      upcoming: fixtures.filter((fixture) => !fixture.started && !fixture.finished).length,
    };
  }, [gameweekIdNum]);

  // Determine if using real manager data
  const isUsingRealData =
    gameState.isConnected && managerPicks.enrichedPicks && !managerPicks.isLoading;

  // Show loading when fetching real manager picks
  if (gameState.isConnected && gameweekIdNum && managerPicks.isLoading) {
    return (
      <Box
        sx={{
          padding: 4,
          textAlign: 'center',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show error if real data fails to load
  if (isUsingRealData === false && gameState.isConnected && managerPicks.error) {
    return (
      <Box sx={{ padding: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/premier-league/gameweek')}
          sx={{
            textTransform: 'none',
            color: '#1976d2',
            padding: 0,
            marginBottom: 2,
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          Back to Fantasy Game
        </Button>
        <Alert severity="error">{managerPicks.error}</Alert>
      </Box>
    );
  }

  // Handle invalid gameweek
  if (!gameweekData) {
    // Redirect to latest available gameweek
    const latest = service.getLatestGameweek();
    if (latest) {
      return <Navigate to={`/premier-league/gameweek/gameweeks/${latest.id}`} replace />;
    }
    // No gameweeks available, redirect to dashboard
    return <Navigate to="/premier-league/gameweek" replace />;
  }

  const handleBack = (): void => {
    navigate('/premier-league/gameweek', { replace: true });
  };

  return (
    <PageContainer
      sx={{
        paddingTop: ThemeTokens.spacing.lg,
        paddingBottom: ThemeTokens.spacing.xxl,
      }}
    >
      <Stack spacing={ThemeTokens.spacing.lg}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            textTransform: 'none',
            color: '#1976d2',
            padding: 0,
            alignSelf: 'flex-start',
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          Back to overview
        </Button>

        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '12px',
            p: { xs: 2.5, md: 4 },
            color: '#fff',
            background:
              'linear-gradient(125deg, #37003c 0%, #6d0875 48%, #00a8e8 130%)',
            boxShadow: '0 16px 36px rgba(55, 0, 60, 0.20)',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 260,
              height: 260,
              right: -70,
              top: -150,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.10)',
            },
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{
              position: 'relative',
              zIndex: 1,
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Chip
                label={statusDisplay}
                size="small"
                sx={{
                  mb: 1.5,
                  color: '#fff',
                  fontWeight: 750,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  border: '1px solid rgba(255,255,255,0.24)',
                }}
              />
              <Typography
                variant="overline"
                sx={{ display: 'block', opacity: 0.78, letterSpacing: 1.4 }}
              >
                Fantasy Premier League
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 850, lineHeight: 1, fontSize: { xs: '2.1rem', md: '3rem' } }}
              >
                Gameweek {gameweekData.gameweek.id}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1.5 }}>
                <CalendarMonthOutlinedIcon sx={{ fontSize: 18, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.88 }}>
                  Deadline{' '}
                  {new Date(gameweekData.gameweek.deadline).toLocaleString([], {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ minWidth: { md: 150 }, '& .MuiOutlinedInput-root': { background: '#fff' } }}>
              <GameweekSelector currentGameweekId={gameweekData.gameweek.id} />
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: ThemeTokens.spacing.md,
          }}
        >
          {[
            {
              label: 'Match slate',
              value: `${fixtureSummary.total} fixtures`,
              detail: `${fixtureSummary.upcoming} remaining`,
              icon: <SportsSoccerOutlinedIcon />,
              color: '#7c3aed',
            },
            {
              label: 'Gameweek pulse',
              value: fixtureSummary.live > 0 ? `${fixtureSummary.live} live` : statusDisplay,
              detail: `${fixtureSummary.finished} matches finished`,
              icon: <InsightsOutlinedIcon />,
              color: statusColor ?? '#0284c7',
            },
            {
              label: 'Your team',
              value: gameState.isConnected ? 'Connected' : 'Public view',
              detail: gameState.isConnected ? 'Personal insights enabled' : 'Connect for team insights',
              icon: <CalendarMonthOutlinedIcon />,
              color: '#0ea5e9',
            },
          ].map((metric) => (
            <Card key={metric.label} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 42,
                    height: 42,
                    borderRadius: '10px',
                    color: metric.color,
                    backgroundColor: `${metric.color}14`,
                  }}
                >
                  {metric.icon}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {metric.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 800 }}>{metric.value}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {metric.detail}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

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

        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Match preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The opening fixtures in this gameweek
                </Typography>
              </Box>
              <Button
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/premier-league/gameweek/fixtures')}
                sx={{ textTransform: 'none' }}
              >
                All fixtures
              </Button>
            </Stack>
            <FixturesList
              gameweekId={gameweekData.gameweek.id}
              limit={4}
              compact
              title=""
            />
          </CardContent>
        </Card>

        {/* Manager Picks from Real Data (when connected) */}
        {isUsingRealData && managerPicks.enrichedPicks && (
          <>
            <Box sx={{ marginTop: ThemeTokens.spacing.lg }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  marginBottom: 1.5,
                  fontSize: '1rem',
                }}
              >
                Your Gameweek Team
              </Typography>

              {/* Real Manager Picks on Pitch */}
              <FootballPitch
                squad={managerPicks.enrichedPicks.starters.map((pick: any) => ({
                  playerId: pick.element,
                  isStarter: true,
                  isCaptain: pick.isCaptain,
                  isViceCaptain: pick.isViceCaptain,
                  gameweekPoints: pick.playerEffectivePoints,
                }))}
              />

              {/* Real Manager Bench */}
              <Bench
                squad={managerPicks.enrichedPicks.bench.map((pick: any, idx: number) => ({
                  playerId: pick.element,
                  isStarter: false,
                  benchOrder: idx,
                  gameweekPoints: pick.playerEffectivePoints,
                }))}
              />
            </Box>
          </>
        )}

      </Stack>
    </PageContainer>
  );
};
