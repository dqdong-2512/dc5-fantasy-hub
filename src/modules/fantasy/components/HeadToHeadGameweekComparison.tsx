/**
 * Head-to-Head Gameweek Comparison Component
 * Displays interactive side-by-side manager comparison for a selected gameweek
 * Integrates into League Detail experience with Pitch/List views and League Race tracking
 * Includes Live gameweek tracking during active gameweeks
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Select,
  MenuItem,
  Button,
  Alert,
  Chip,
  IconButton,
  ButtonGroup,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { LoadingState, ErrorState } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { GameweekHeadToHeadService } from '../services';
import { useLiveGameweek, useDifferentialImpact, useGameweekLivePolling } from '../hooks';
import { ComparisonPitchView } from './ComparisonPitchView';
import { LeagueRaceView } from './LeagueRaceView';
import { LiveImpactFeed } from './LiveImpactFeed';
import { LiveTeamPoints } from './LiveTeamPoints';
import { PlayersRemaining } from './PlayersRemaining';
import type { GameweekComparison } from '../services/GameweekHeadToHeadService';
import type { FantasyLeagueStanding } from '@domain/models';

export interface HeadToHeadGameweekComparisonProps {
  myManager: FantasyLeagueStanding;
  opponentManager: FantasyLeagueStanding;
  connectedEntryId: number;
  selectedLeagueId: number;
  onClose: () => void;
}

export const HeadToHeadGameweekComparison: React.FC<HeadToHeadGameweekComparisonProps> = ({
  myManager,
  opponentManager,
  connectedEntryId,
  onClose,
}) => {
  const [comparison, setComparison] = useState<GameweekComparison | null>(null);
  const [availableGameweeks, setAvailableGameweeks] = useState<number[]>([]);
  const [selectedGameweek, setSelectedGameweek] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pitch' | 'list'>('pitch');
  const [comparisonTab, setComparisonTab] = useState<'head-to-head' | 'league-race' | 'live'>(
    'head-to-head'
  );
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastLiveRefresh, setLastLiveRefresh] = useState<Date | null>(null);

  // Live gameweek data
  const myLivePerformance = useLiveGameweek(connectedEntryId, selectedGameweek);
  const opponentLivePerformance = useLiveGameweek(opponentManager.entryId, selectedGameweek);
  const differentialImpact = useDifferentialImpact(
    myLivePerformance.performance,
    opponentLivePerformance.performance
  );

  // Set up polling hook
  const { enableAutoRefresh, disableAutoRefresh, isAutoRefreshEnabled } = useGameweekLivePolling({
    isLive: myLivePerformance.performance?.gameStatus === 'live' || false,
    isFinished: myLivePerformance.performance?.gameStatus === 'finished' || false,
    refreshInterval: 30000,
    onRefresh: async () => {
      await Promise.all([myLivePerformance.refresh(), opponentLivePerformance.refresh()]);
    },
  });

  const service = useMemo(() => new GameweekHeadToHeadService(), []);

  // Load available gameweeks
  useEffect(() => {
    const loadGameweeks = async () => {
      try {
        const gws = await service.getAvailableGameweeks(connectedEntryId);
        setAvailableGameweeks(gws);
        if (gws.length > 0) {
          setSelectedGameweek(gws[0]); // Default to latest
        }
      } catch (err) {
        console.error('Failed to load gameweeks:', err);
      }
    };

    loadGameweeks();
  }, [connectedEntryId, service]);

  // Auto-refresh live data when gameweek is live
  useEffect(() => {
    if (autoRefresh && myLivePerformance.performance?.gameStatus === 'live') {
      enableAutoRefresh();
    } else {
      disableAutoRefresh();
    }

    return () => {
      disableAutoRefresh();
    };
  }, [
    autoRefresh,
    myLivePerformance.performance?.gameStatus,
    enableAutoRefresh,
    disableAutoRefresh,
  ]);

  // Load comparison data when gameweek changes
  useEffect(() => {
    if (!selectedGameweek) return;

    const loadComparison = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const comp = await service.compareGameweek(
          selectedGameweek,
          connectedEntryId,
          opponentManager.entryId
        );
        setComparison(comp);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comparison');
      } finally {
        setIsLoading(false);
      }
    };

    loadComparison();
  }, [selectedGameweek, connectedEntryId, opponentManager.entryId, service]);

  const handleRefresh = useCallback(async () => {
    if (!selectedGameweek || isLoading) return;
    service.clearCache();
    try {
      setIsLoading(true);
      const comp = await service.compareGameweek(
        selectedGameweek,
        connectedEntryId,
        opponentManager.entryId
      );
      setComparison(comp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh comparison');
    } finally {
      setIsLoading(false);
    }
  }, [selectedGameweek, connectedEntryId, opponentManager.entryId, service, isLoading]);

  if (error && !comparison) {
    return (
      <Card>
        <CardContent>
          <ErrorState title="Failed to load comparison" message={error} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={ThemeTokens.spacing.lg}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Head-to-Head Comparison
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Tabs */}
          <Tabs
            value={comparisonTab}
            onChange={(_, newValue) => setComparisonTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Head-to-Head" value="head-to-head" />
            <Tab label="League Race" value="league-race" />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Live
                  {myLivePerformance.performance?.gameStatus === 'live' && (
                    <FiberManualRecordIcon
                      sx={{
                        fontSize: '0.6rem',
                        color: '#ff6b6b',
                        animation: 'pulse 1.5s infinite',
                      }}
                    />
                  )}
                </Box>
              }
              value="live"
            />
          </Tabs>

          {/* Head-to-Head Tab Content */}
          {comparisonTab === 'head-to-head' && (
            <Stack spacing={ThemeTokens.spacing.lg}>
              {/* Gameweek Selector and Controls */}
              <Box
                sx={{
                  display: 'flex',
                  gap: ThemeTokens.spacing.md,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Select
                  value={selectedGameweek || ''}
                  onChange={(e) => setSelectedGameweek(Number(e.target.value))}
                  size="small"
                  sx={{ width: 120 }}
                >
                  {availableGameweeks.map((gw) => (
                    <MenuItem key={gw} value={gw}>
                      GW {gw}
                    </MenuItem>
                  ))}
                </Select>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  startIcon={<RefreshIcon />}
                >
                  Refresh
                </Button>
                <Box sx={{ flex: 1 }} />
                <Typography variant="caption" color="textSecondary">
                  View:
                </Typography>
                <ButtonGroup size="small" variant="outlined">
                  <Button
                    onClick={() => setViewMode('pitch')}
                    variant={viewMode === 'pitch' ? 'contained' : 'outlined'}
                    startIcon={<GridViewIcon />}
                  >
                    Pitch
                  </Button>
                  <Button
                    onClick={() => setViewMode('list')}
                    variant={viewMode === 'list' ? 'contained' : 'outlined'}
                    startIcon={<ViewListIcon />}
                  >
                    List
                  </Button>
                </ButtonGroup>
              </Box>

              {/* Summary Card */}
              {isLoading ? (
                <LoadingState label="Loading head-to-head comparison..." />
              ) : error && !comparison ? (
                <ErrorState title="Failed to load comparison" message={error} />
              ) : comparison ? (
                <>
                  <Card variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                          gap: ThemeTokens.spacing.md,
                        }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.xs }}
                          >
                            My Team
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.xs }}
                          >
                            {comparison.myGameweekPoints}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            GW Points
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.xs }}
                          >
                            Opponent
                          </Typography>
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.xs }}
                          >
                            {comparison.opponentGameweekPoints}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            GW Points
                          </Typography>
                        </Box>
                      </Box>

                      {/* Difference */}
                      <Box
                        sx={{
                          marginTop: ThemeTokens.spacing.md,
                          textAlign: 'center',
                          borderTop: '1px solid #e0e0e0',
                          paddingTop: ThemeTokens.spacing.md,
                        }}
                      >
                        <Typography variant="body2" color="textSecondary">
                          GW Difference
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: ThemeTokens.spacing.sm,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color:
                                comparison.gameweekPointsDifference > 0
                                  ? '#4caf50'
                                  : comparison.gameweekPointsDifference < 0
                                    ? '#f44336'
                                    : '#666',
                            }}
                          >
                            {comparison.gameweekPointsDifference > 0 ? '+' : ''}
                            {comparison.gameweekPointsDifference}
                          </Typography>
                          {comparison.gameweekPointsDifference > 0 ? (
                            <TrendingUpIcon sx={{ color: '#4caf50', fontSize: '1.5rem' }} />
                          ) : comparison.gameweekPointsDifference < 0 ? (
                            <TrendingDownIcon sx={{ color: '#f44336', fontSize: '1.5rem' }} />
                          ) : null}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Pitch View */}
                  {viewMode === 'pitch' && (
                    <ComparisonPitchView
                      comparison={comparison}
                      myManager={myManager}
                      opponentManager={opponentManager}
                    />
                  )}

                  {/* List View */}
                  {viewMode === 'list' && (
                    <Stack spacing={ThemeTokens.spacing.lg}>
                      {/* Key Differences */}
                      {comparison.keyDifferences.length > 0 && (
                        <Card variant="outlined">
                          <CardContent>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.md }}
                            >
                              Key Differences
                            </Typography>
                            <Stack spacing={ThemeTokens.spacing.sm}>
                              {comparison.keyDifferences.slice(0, 5).map((diff, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Typography variant="body2">{diff.description}</Typography>
                                  <Chip
                                    label={`${diff.isPositiveForMyTeam ? '+' : ''}${diff.pointsImpact}`}
                                    size="small"
                                    color={diff.isPositiveForMyTeam ? 'success' : 'error'}
                                    variant="outlined"
                                  />
                                </Box>
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      )}

                      {/* Common Players */}
                      {comparison.commonPlayersCount > 0 && (
                        <Alert severity="info">
                          Common Players: {comparison.commonPlayersCount} / 15
                        </Alert>
                      )}

                      {/* Differentials Summary */}
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                          gap: ThemeTokens.spacing.md,
                        }}
                      >
                        <Box>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.md }}
                              >
                                My Differentials ({comparison.myDifferentialsCount})
                              </Typography>
                              <Stack spacing={ThemeTokens.spacing.xs}>
                                {comparison.players
                                  .filter(
                                    (p) =>
                                      p.status === 'myDifferential' && p.myTeamEffectivePoints > 0
                                  )
                                  .sort((a, b) => b.myTeamEffectivePoints - a.myTeamEffectivePoints)
                                  .slice(0, 5)
                                  .map((player) => (
                                    <Box
                                      key={player.playerId}
                                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                                    >
                                      <Typography variant="body2">{player.playerName}</Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600, color: '#4caf50' }}
                                      >
                                        +{player.myTeamEffectivePoints}
                                      </Typography>
                                    </Box>
                                  ))}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Box>
                        <Box>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.md }}
                              >
                                Opponent Differentials ({comparison.opponentDifferentialsCount})
                              </Typography>
                              <Stack spacing={ThemeTokens.spacing.xs}>
                                {comparison.players
                                  .filter(
                                    (p) =>
                                      p.status === 'opponentDifferential' &&
                                      p.opponentEffectivePoints > 0
                                  )
                                  .sort(
                                    (a, b) => b.opponentEffectivePoints - a.opponentEffectivePoints
                                  )
                                  .slice(0, 5)
                                  .map((player) => (
                                    <Box
                                      key={player.playerId}
                                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                                    >
                                      <Typography variant="body2">{player.playerName}</Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 600, color: '#f44336' }}
                                      >
                                        -{player.opponentEffectivePoints}
                                      </Typography>
                                    </Box>
                                  ))}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Box>
                      </Box>

                      {/* Captain Comparison */}
                      {(comparison.myCaptain || comparison.opponentCaptain) && (
                        <Card variant="outlined">
                          <CardContent>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.md }}
                            >
                              Captain Comparison
                            </Typography>
                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                gap: ThemeTokens.spacing.md,
                              }}
                            >
                              {comparison.myCaptain && (
                                <Box>
                                  <Box>
                                    <Typography variant="caption" color="textSecondary">
                                      My Captain
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {comparison.myCaptain.playerName}
                                    </Typography>
                                    <Typography variant="body2">
                                      {comparison.myCaptain.gameweekPoints}pts ×{' '}
                                      {comparison.myCaptain.myTeamMultiplier} ={' '}
                                      <strong>{comparison.myCaptain.myTeamEffectivePoints}</strong>
                                    </Typography>
                                  </Box>
                                </Box>
                              )}
                              {comparison.opponentCaptain && (
                                <Box>
                                  <Box>
                                    <Typography variant="caption" color="textSecondary">
                                      Opponent Captain
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {comparison.opponentCaptain.playerName}
                                    </Typography>
                                    <Typography variant="body2">
                                      {comparison.opponentCaptain.gameweekPoints}pts ×{' '}
                                      {comparison.opponentCaptain.opponentMultiplier} ={' '}
                                      <strong>
                                        {comparison.opponentCaptain.opponentEffectivePoints}
                                      </strong>
                                    </Typography>
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      )}
                    </Stack>
                  )}
                </>
              ) : null}
            </Stack>
          )}

          {/* League Race Tab Content */}
          {comparisonTab === 'league-race' && (
            <LeagueRaceView
              myEntryId={connectedEntryId}
              opponentEntryId={opponentManager.entryId}
              myManagerName={myManager.playerName}
              opponentManagerName={opponentManager.playerName}
              currentGameweek={selectedGameweek || 1}
            />
          )}

          {/* Live Tab Content */}
          {comparisonTab === 'live' && (
            <Stack spacing={ThemeTokens.spacing.lg}>
              {/* Live Status and Controls */}
              <Box
                sx={{
                  display: 'flex',
                  gap: ThemeTokens.spacing.md,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {myLivePerformance.performance?.gameStatus === 'live' && (
                  <Alert severity="warning" sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FiberManualRecordIcon sx={{ fontSize: '0.8rem', color: '#ff6b6b' }} />
                      <Box>
                        <strong>Gameweek Live</strong> - Points are provisional and will update as
                        matches progress
                      </Box>
                    </Box>
                  </Alert>
                )}
                {myLivePerformance.performance?.gameStatus === 'finished' && (
                  <Alert severity="success" sx={{ flex: 1 }}>
                    Gameweek Finished - Official points locked in
                  </Alert>
                )}
                {myLivePerformance.performance?.gameStatus === 'upcoming' && (
                  <Alert severity="info" sx={{ flex: 1 }}>
                    Gameweek Upcoming - Matches start at deadline
                  </Alert>
                )}

                {/* Manual Refresh */}
                <Tooltip
                  title={
                    lastLiveRefresh
                      ? `Last updated: ${lastLiveRefresh.toLocaleTimeString()}`
                      : 'Refresh live data'
                  }
                >
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      myLivePerformance.refresh();
                      opponentLivePerformance.refresh();
                      setLastLiveRefresh(new Date());
                    }}
                    disabled={myLivePerformance.isLoading || opponentLivePerformance.isLoading}
                    startIcon={
                      myLivePerformance.isLoading ? <CircularProgress size={16} /> : <RefreshIcon />
                    }
                  >
                    Refresh
                  </Button>
                </Tooltip>

                {/* Auto Refresh Toggle */}
                {myLivePerformance.performance?.gameStatus === 'live' && (
                  <Button
                    variant={isAutoRefreshEnabled ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => {
                      if (isAutoRefreshEnabled) {
                        disableAutoRefresh();
                      } else {
                        enableAutoRefresh();
                      }
                      setAutoRefresh(!autoRefresh);
                    }}
                  >
                    {isAutoRefreshEnabled ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
                  </Button>
                )}
              </Box>

              {/* Live Performance Cards */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: ThemeTokens.spacing.md,
                }}
              >
                <LiveTeamPoints
                  performance={myLivePerformance.performance}
                  isLoading={myLivePerformance.isLoading}
                  error={myLivePerformance.error}
                  showTransferCost={true}
                />
                <LiveTeamPoints
                  performance={opponentLivePerformance.performance}
                  isLoading={opponentLivePerformance.isLoading}
                  error={opponentLivePerformance.error}
                  showTransferCost={true}
                />
              </Box>

              {/* Live Head-to-Head Summary */}
              {myLivePerformance.performance && opponentLivePerformance.performance && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.md }}
                    >
                      Provisional Match Summary
                    </Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: ThemeTokens.spacing.md,
                        textAlign: 'center',
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          My Team
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 700, marginY: ThemeTokens.spacing.xs }}
                        >
                          {myLivePerformance.performance.provisionalGameweekPoints}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Opponent
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 700, marginY: ThemeTokens.spacing.xs }}
                        >
                          {opponentLivePerformance.performance.provisionalGameweekPoints}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        marginTop: ThemeTokens.spacing.md,
                        paddingTop: ThemeTokens.spacing.md,
                        borderTop: '1px solid #e0e0e0',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        Current Difference
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: ThemeTokens.spacing.sm,
                          marginTop: ThemeTokens.spacing.xs,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color:
                              myLivePerformance.performance.provisionalGameweekPoints -
                                opponentLivePerformance.performance.provisionalGameweekPoints >
                              0
                                ? '#4caf50'
                                : myLivePerformance.performance.provisionalGameweekPoints -
                                      opponentLivePerformance.performance
                                        .provisionalGameweekPoints <
                                    0
                                  ? '#f44336'
                                  : '#666',
                          }}
                        >
                          {myLivePerformance.performance.provisionalGameweekPoints -
                            opponentLivePerformance.performance.provisionalGameweekPoints >
                          0
                            ? '+'
                            : ''}
                          {myLivePerformance.performance.provisionalGameweekPoints -
                            opponentLivePerformance.performance.provisionalGameweekPoints}
                        </Typography>
                        {myLivePerformance.performance.provisionalGameweekPoints -
                          opponentLivePerformance.performance.provisionalGameweekPoints >
                        0 ? (
                          <TrendingUpIcon sx={{ color: '#4caf50', fontSize: '1.5rem' }} />
                        ) : myLivePerformance.performance.provisionalGameweekPoints -
                            opponentLivePerformance.performance.provisionalGameweekPoints <
                          0 ? (
                          <TrendingDownIcon sx={{ color: '#f44336', fontSize: '1.5rem' }} />
                        ) : null}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Players Remaining Status */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: ThemeTokens.spacing.md,
                }}
              >
                <PlayersRemaining performance={myLivePerformance.performance} />
                <PlayersRemaining performance={opponentLivePerformance.performance} />
              </Box>

              {/* Live Differential Impact */}
              {differentialImpact && (
                <LiveImpactFeed
                  myPerformance={myLivePerformance.performance}
                  opponentPerformance={opponentLivePerformance.performance}
                  isLoading={myLivePerformance.isLoading || opponentLivePerformance.isLoading}
                />
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
