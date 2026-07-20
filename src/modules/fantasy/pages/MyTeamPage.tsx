/**
 * My Team Page
 * Displays the user's selected FPL squad on a football pitch with bench
 * Supports both fixture data (for development) and real manager data (when connected)
 */

import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { PageContainer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { fantasyGameFixtures } from '../fixtures';
import { useFantasyGame, useManagerData, useEnrichedManagerPicks } from '../hooks';
import { FootballPitch, Bench, TeamSummary, GameweekSummaryCard } from '../components';
import { BootstrapRepository } from '@repositories/bootstrap';

export const MyTeamPage: React.FC = () => {
  const navigate = useNavigate();
  const gameState = useFantasyGame();
  const [manualGameweekOverride, setManualGameweekOverride] = useState<number | null>(null);

  // Determine which gameweek to display
  const displayGameweek = manualGameweekOverride || gameState.displayGameweek;

  // Get enriched picks for the selected gameweek (includes player gameweek points)
  const picks = useEnrichedManagerPicks(gameState.connectedEntryId, displayGameweek);

  // Format manager data for display
  const managerData = useManagerData(gameState);

  // Get gameweek list for selector
  const bootstrapRepo = useMemo(() => new BootstrapRepository(), []);
  const bootstrap = useMemo(() => {
    try {
      return bootstrapRepo.getBootstrap();
    } catch {
      return { gameweeks: [] };
    }
  }, [bootstrapRepo]);

  // Determine if using real data or fixtures
  const isUsingRealData =
    gameState.isConnected && gameState.connectedEntryId && picks.enrichedPicks;
  const fixtures = useMemo(() => fantasyGameFixtures, []);

  // Use real data if connected, otherwise fallback to fixtures
  const teamName = isUsingRealData ? managerData.context?.teamName : fixtures.manager.teamName;
  const gameweekNumber =
    displayGameweek ||
    (isUsingRealData ? gameState.displayGameweek : fixtures.currentGameweek.gameweek);
  const teamValue = isUsingRealData ? managerData.context?.teamValue : fixtures.manager.teamValue;
  const bank = isUsingRealData ? managerData.context?.bank : fixtures.manager.bank;

  // Prepare squad data for components
  const squadForComponents = isUsingRealData
    ? (picks.enrichedPicks?.picks?.map((pick: any) => ({
        playerId: pick.element,
        isStarter: pick.position <= 11,
        isCaptain: pick.isCaptain,
        isViceCaptain: pick.isViceCaptain,
        gameweekPoints: pick.playerEffectivePoints, // Real points with multiplier applied
        benchOrder: pick.position > 11 ? pick.position - 12 : undefined,
      })) ?? [])
    : (fixtures.squad?.map((p) => ({
        playerId: p.playerId,
        isStarter: p.isStarter,
        isCaptain: p.isCaptain,
        isViceCaptain: p.isViceCaptain,
        gameweekPoints: p.gameweekPoints,
        benchOrder: p.benchOrder,
      })) ?? []);

  // Handle gameweek navigation
  const handleGameweekChange = (newGameweek: number) => {
    setManualGameweekOverride(newGameweek);
  };

  const handlePreviousGameweek = () => {
    if (!displayGameweek) return;
    const availableGameweeks = bootstrap.gameweeks.map((gw) => gw.id).sort((a, b) => a - b);
    const currentIndex = availableGameweeks.indexOf(displayGameweek);
    if (currentIndex > 0) {
      handleGameweekChange(availableGameweeks[currentIndex - 1]);
    }
  };

  const handleNextGameweek = () => {
    if (!displayGameweek) return;
    const availableGameweeks = bootstrap.gameweeks.map((gw) => gw.id).sort((a, b) => a - b);
    const currentIndex = availableGameweeks.indexOf(displayGameweek);
    if (currentIndex < availableGameweeks.length - 1) {
      handleGameweekChange(availableGameweeks[currentIndex + 1]);
    }
  };

  // Show loading state if connected and loading
  if (gameState.isConnected && gameState.isLoading) {
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

  // Show error state if picks have error
  if (isUsingRealData && picks.error) {
    return (
      <Box>
        <Box sx={{ padding: ThemeTokens.spacing.xs, borderBottom: '1px solid #e0e0e0' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/premier-league/fantasy-game')}
            sx={{
              textTransform: 'none',
              color: '#1976d2',
              padding: 0,
              '&:hover': { backgroundColor: 'transparent' },
            }}
          >
            Back
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 700, marginTop: 2 }}>
            My Team
          </Typography>
        </Box>
        <PageContainer sx={{ padding: ThemeTokens.spacing.xs }}>
          <Alert severity="error">{picks.error}</Alert>
        </PageContainer>
      </Box>
    );
  }

  // Show empty state if no squad data
  if (!squadForComponents || squadForComponents.length === 0) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No squad data available{isUsingRealData ? ` for Gameweek ${displayGameweek}` : ''}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Compact Page Header */}
      <Box sx={{ padding: ThemeTokens.spacing.xs, borderBottom: '1px solid #e0e0e0' }}>
        {/* Navigation Buttons */}
        <Stack direction="row" spacing={1} sx={{ marginBottom: 1.5 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/premier-league/fantasy-game')}
            sx={{
              textTransform: 'none',
              color: '#1976d2',
              padding: 0,
              '&:hover': { backgroundColor: 'transparent' },
            }}
          >
            Back
          </Button>

          <Button
            startIcon={<SwapCallsIcon />}
            onClick={() => navigate('/premier-league/fantasy-game/transfers')}
            variant="outlined"
            sx={{ textTransform: 'none', borderColor: '#2196f3', color: '#2196f3' }}
          >
            Plan Transfers
          </Button>
        </Stack>

        {/* Page Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, marginBottom: 0.5 }}>
          My Team
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {teamName}
        </Typography>

        {/* Gameweek Selector (only for connected users) */}
        {gameState.isConnected && displayGameweek && (
          <Box sx={{ marginTop: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              onClick={handlePreviousGameweek}
              startIcon={<KeyboardArrowLeftIcon />}
              sx={{ padding: 0, minWidth: 'auto' }}
            >
              Prev
            </Button>

            <FormControl sx={{ minWidth: '120px' }}>
              <Select
                value={displayGameweek}
                onChange={(e) => handleGameweekChange(e.target.value as number)}
                size="small"
                sx={{ height: '36px' }}
              >
                {bootstrap.gameweeks.map((gw) => (
                  <MenuItem key={gw.id} value={gw.id}>
                    GW {gw.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              size="small"
              onClick={handleNextGameweek}
              endIcon={<KeyboardArrowRightIcon />}
              sx={{ padding: 0, minWidth: 'auto' }}
            >
              Next
            </Button>
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <PageContainer sx={{ padding: ThemeTokens.spacing.xs }}>
        {/* Loading indicator for picks */}
        {isUsingRealData && picks.isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Team Summary Stats */}
        {!picks.isLoading && (
          <>
            <TeamSummary
              teamName={teamName ?? 'Team'}
              gameweekNumber={gameweekNumber ?? 0}
              gameweekPoints={
                managerData.displayValues?.gameweekPoints
                  ? parseInt(managerData.displayValues.gameweekPoints)
                  : fixtures.currentGameweek.points
              }
              teamValue={teamValue ?? 0}
              bank={bank ?? 0}
              squad={squadForComponents.map((p) => ({
                playerId: p.playerId,
                isStarter: p.isStarter,
              }))}
            />

            {/* Gameweek Summary Card (for connected users with real data) */}
            {isUsingRealData && displayGameweek && (
              <GameweekSummaryCard
                gameweekNumber={displayGameweek}
                totalPoints={picks.totalPoints ?? 0}
                gameweekRank={null}
                transfers={picks.transfersMade ?? 0}
                transferCost={picks.transfersCost ?? 0}
                captainPoints={picks.captainPoints ?? 0}
                benchPoints={picks.benchPoints ?? 0}
                activeChip={picks.activeChip ?? null}
                isHistorical={displayGameweek < (gameState.currentGameweekIndex ?? 0)}
              />
            )}

            {/* Football Pitch */}
            <FootballPitch squad={squadForComponents} />

            {/* Bench */}
            <Bench squad={squadForComponents} />
          </>
        )}
      </PageContainer>
    </Box>
  );
};
