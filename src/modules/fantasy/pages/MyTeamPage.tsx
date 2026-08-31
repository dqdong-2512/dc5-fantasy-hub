/**
 * My Team Page
 * Displays the user's selected FPL squad on a football pitch with bench
 * Uses the connected manager entry plus the current normalized FPL dataset.
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
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { ThemeTokens } from '@shared/theme/tokens';
import { useEnrichedManagerPicks, useManagerLeagues } from '../hooks';
import { useGameweekHubState } from '../context';
import {
  FootballPitch,
  Bench,
  TeamSummary,
  GameweekSummaryCard,
  GameweekHistory,
  PlayerPointBreakdown,
} from '../components';
import { getBootstrapRepository } from '@repositories/index';
import type { PointBreakdownData } from '../components/PlayerPointBreakdown';
import { HeadToHeadGameweekComparison } from '../components/HeadToHeadGameweekComparison';
import { getStoredLeagueId } from '../components/FplConnectionGate';

export const MyTeamPage: React.FC = () => {
  const navigate = useNavigate();
  const gameState = useGameweekHubState();
  const [manualGameweekOverride, setManualGameweekOverride] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'pitch' | 'compare'>('pitch');
  const [selectedOpponentId, setSelectedOpponentId] = useState<number | null>(null);
  const [selectedPlayerBreakdown, setSelectedPlayerBreakdown] = useState<PointBreakdownData | null>(
    null
  );

  // Determine which gameweek to display
  const displayGameweek = manualGameweekOverride || gameState.displayGameweek;

  // Get enriched picks for the selected gameweek (includes player gameweek points)
  const picks = useEnrichedManagerPicks(gameState.connectedEntryId, displayGameweek);

  const comparisonLeagueIds = useMemo(() => {
    const joinedLeagueIds = gameState.entry?.joinedLeaguesIds ?? [];
    const connectedLeagueId = getStoredLeagueId();

    if (!connectedLeagueId) {
      return joinedLeagueIds;
    }

    return [
      connectedLeagueId,
      ...joinedLeagueIds.filter((leagueId) => leagueId !== connectedLeagueId),
    ];
  }, [gameState.entry?.joinedLeaguesIds]);

  const leagueData = useManagerLeagues(
    gameState.connectedEntryId,
    comparisonLeagueIds
  );
  const myLeagueStanding =
    leagueData.standings?.find((standing) => standing.entryId === gameState.connectedEntryId) ??
    null;
  const opponents =
    leagueData.standings?.filter((standing) => standing.entryId !== gameState.connectedEntryId) ??
    [];
  const selectedOpponent =
    opponents.find((standing) => standing.entryId === selectedOpponentId) ?? opponents[0] ?? null;

  // Get gameweek list for selector
  const bootstrapRepo = useMemo(() => getBootstrapRepository(), []);
  const bootstrap = useMemo(() => {
    try {
      return bootstrapRepo.getBootstrap();
    } catch {
      return { gameweeks: [] };
    }
  }, [bootstrapRepo]);

  // The routed page is connection-gated, so only render the connected entry's runtime data.
  const isUsingRealData = Boolean(
    gameState.isConnected && gameState.connectedEntryId && picks.enrichedPicks
  );

  const teamName = gameState.entry?.team.name ?? 'My Team';
  const gameweekNumber = displayGameweek ?? bootstrapRepo.getCurrentGameweek()?.id ?? 1;
  const teamValue = isUsingRealData ? picks.teamValue / 10 : 0;
  const bank = isUsingRealData ? picks.bankValue / 10 : 0;

  // Prepare squad data for components
  const squadForComponents =
    picks.enrichedPicks?.picks?.map((pick: any) => ({
        playerId: pick.element,
        isStarter: pick.position <= 11,
        isCaptain: pick.isCaptain,
        isViceCaptain: pick.isViceCaptain,
        gameweekPoints: pick.playerEffectivePoints, // Real points with multiplier applied
        benchOrder: pick.position > 11 ? pick.position - 12 : undefined,
      })) ?? [];

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

  return (
    <Box
      sx={{
        // The shell places this route inside the same PageContainer rail as the tabs.
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        marginX: 0,
        boxSizing: 'border-box',
        paddingTop: ThemeTokens.spacing.lg,
        paddingBottom: ThemeTokens.spacing.xxl,
      }}
    >
      <Stack spacing={ThemeTokens.spacing.lg}>
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            p: { xs: 2.5, md: 3.5 },
            borderRadius: '12px',
            color: '#fff',
            background: 'linear-gradient(125deg, #37003c 0%, #6d0875 55%, #00a8e8 130%)',
            boxShadow: '0 16px 36px rgba(55, 0, 60, 0.20)',
            '&::after': {
              content: '""',
              position: 'absolute',
              width: 240,
              height: 240,
              right: -60,
              top: -150,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.10)',
            },
          }}
        >
          <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
            >
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/premier-league/home')}
                sx={{ alignSelf: 'flex-start', p: 0, color: 'rgba(255,255,255,.82)', textTransform: 'none' }}
              >
                Back to Home
              </Button>
              <Button
                startIcon={<SwapCallsIcon />}
                onClick={() => navigate('/premier-league/gameweek/transfers')}
                variant="outlined"
                sx={{
                  alignSelf: 'flex-start',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,.45)',
                  textTransform: 'none',
                  '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,.10)' },
                }}
              >
                Plan transfers
              </Button>
            </Stack>

            <Box>
              <Typography variant="overline" sx={{ opacity: 0.75, letterSpacing: 1.4 }}>
                My FPL squad
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 850, lineHeight: 1.05, fontSize: { xs: '2rem', md: '2.75rem' } }}
              >
                {teamName}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.75, opacity: 0.78 }}>
                Select your captain, review fixtures and prepare your starting XI
              </Typography>
            </Box>

            {gameState.isConnected && displayGameweek && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Button
                  size="small"
                  onClick={handlePreviousGameweek}
                  sx={{ minWidth: 36, color: '#fff' }}
                >
                  <KeyboardArrowLeftIcon />
                </Button>
                <FormControl sx={{ minWidth: 130 }}>
                  <Select
                    value={displayGameweek}
                    onChange={(event) => handleGameweekChange(event.target.value as number)}
                    size="small"
                    MenuProps={{
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' },
                      slotProps: {
                        paper: {
                          sx: {
                            mt: 1,
                            maxHeight: 304,
                            borderRadius: '8px',
                            boxShadow: '0 14px 32px rgba(15, 23, 42, 0.18)',
                          },
                        },
                      },
                    }}
                    sx={{ height: 40, fontWeight: 750, backgroundColor: '#fff' }}
                  >
                    {bootstrap.gameweeks.map((gameweek) => (
                      <MenuItem key={gameweek.id} value={gameweek.id}>
                        Gameweek {gameweek.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  size="small"
                  onClick={handleNextGameweek}
                  sx={{ minWidth: 36, color: '#fff' }}
                >
                  <KeyboardArrowRightIcon />
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Loading indicator for picks */}
        {gameState.isConnected && picks.isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {gameState.isConnected && (
          <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: '12px !important' }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>Team workspace</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Review your squad or compare it with a league rival
                  </Typography>
                </Box>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={viewMode}
                  onChange={(_event, value: 'pitch' | 'compare' | null) => {
                    if (value) setViewMode(value);
                  }}
                >
                  <ToggleButton value="pitch" sx={{ textTransform: 'none', fontWeight: 700 }}>
                    Pitch view
                  </ToggleButton>
                  <ToggleButton value="compare" sx={{ textTransform: 'none', fontWeight: 700 }}>
                    Compare rival
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </CardContent>
          </Card>
        )}

        {viewMode === 'pitch' && picks.error && (
          <Alert severity="info">
            Your Entry ID is connected, but FPL has not published Gameweek {displayGameweek} picks
            for public access yet. Manager squads normally become available after the deadline, so
            the page will not substitute demo players for your real team.
          </Alert>
        )}

        {/* Team Summary Stats */}
        {!picks.isLoading && viewMode === 'pitch' && squadForComponents.length > 0 && (
          <Stack spacing={ThemeTokens.spacing.lg}>
            <TeamSummary
              teamName={teamName ?? 'Team'}
              gameweekNumber={gameweekNumber ?? 0}
              gameweekPoints={isUsingRealData ? picks.totalPoints : 0}
              teamValue={teamValue ?? 0}
              bank={bank ?? 0}
              squad={squadForComponents.map((p) => ({
                playerId: p.playerId,
                isStarter: p.isStarter,
              }))}
            />

            <Box>
              <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 850 }}>
                Starting XI
              </Typography>
              <FootballPitch
                squad={squadForComponents}
                gameweekId={displayGameweek ?? undefined}
              />
            </Box>

            <Bench squad={squadForComponents} gameweekId={displayGameweek ?? undefined} />

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

            {isUsingRealData && gameState.history && (
              <GameweekHistory
                history={gameState.history}
                currentGameweek={displayGameweek ?? undefined}
                onSelectGameweek={handleGameweekChange}
                isLoading={picks.isLoading}
              />
            )}
          </Stack>
        )}

        {!picks.isLoading && viewMode === 'compare' && (
          <Stack spacing={ThemeTokens.spacing.md}>
            <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 850 }}>
                      Head-to-head comparison
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Compare pitch, captaincy, differentials and live league race
                    </Typography>
                  </Box>
                  <FormControl size="small" sx={{ minWidth: 240 }}>
                    <Select
                      value={selectedOpponent?.entryId ?? ''}
                      displayEmpty
                      onChange={(event) => setSelectedOpponentId(Number(event.target.value))}
                    >
                      {opponents.map((opponent) => (
                        <MenuItem key={opponent.entryId} value={opponent.entryId}>
                          {opponent.entryName} · #{opponent.rank}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>

            {leagueData.isLoadingStandings && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            )}
            {leagueData.error && <Alert severity="warning">{leagueData.error}</Alert>}
            {!leagueData.isLoadingStandings &&
              !leagueData.error &&
              myLeagueStanding &&
              selectedOpponent &&
              gameState.connectedEntryId &&
              leagueData.currentLeagueId && (
                <HeadToHeadGameweekComparison
                  myManager={myLeagueStanding}
                  opponentManager={selectedOpponent}
                  connectedEntryId={gameState.connectedEntryId}
                  selectedLeagueId={leagueData.currentLeagueId}
                  onClose={() => setViewMode('pitch')}
                />
              )}
            {!leagueData.isLoadingStandings &&
              !leagueData.error &&
              (!myLeagueStanding || !selectedOpponent) && (
                <Alert severity="info">
                  No league opponent is available yet. Connect a classic league with at least two
                  managers to enable comparison.
                </Alert>
              )}
          </Stack>
        )}

        <PlayerPointBreakdown
          open={selectedPlayerBreakdown !== null}
          onClose={() => setSelectedPlayerBreakdown(null)}
          breakdown={selectedPlayerBreakdown}
        />
      </Stack>
    </Box>
  );
};
