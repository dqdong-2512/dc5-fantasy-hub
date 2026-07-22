/**
 * Leagues Component
 * Live Mini League Center with Official/Live standings toggle
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  ButtonGroup,
  Drawer,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CompareIcon from '@mui/icons-material/Compare';
import type {
  FantasyEntry,
  FantasyLeagueStandings,
  FantasyLeagueStanding,
  LiveLeagueStandingsResult,
  LiveLeagueStanding,
} from '@domain/models';
import { FantasyGameRepository } from '@repositories/fantasy';
import { FantasyGameLiveLeagueService } from '@shared/services';
import { LoadingState, ErrorState, EmptyState } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { MyTeam } from './MyTeam';
import { HeadToHeadGameweekComparison } from './HeadToHeadGameweekComparison';

export interface LeaguesProps {
  entry: FantasyEntry | null;
  isLoading: boolean;
  connectedEntryId: number | null;
  selectedGameweek?: number | null;
}

type ViewMode = 'official' | 'live';

/**
 * Manager inspection drawer component
 */
const ManagerInspectionDrawer: React.FC<{
  standing: LiveLeagueStanding | null;
  open: boolean;
  onClose: () => void;
  gameweekId: number;
}> = ({ standing, open, onClose, gameweekId }) => {
  const [squadPerformance, setSquadPerformance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Use useMemo to prevent new repository instance on every render
  const repository = useMemo(() => new FantasyGameRepository(), []);

  useEffect(() => {
    if (!open || !standing) return;

    const loadSquad = async () => {
      try {
        setIsLoading(true);
        const performance = await repository.getLiveSquadPerformance(
          standing.entryId,
          gameweekId,
          new Map()
        );
        setSquadPerformance(performance);
      } catch (err) {
        console.error('Failed to load manager squad:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSquad();
  }, [open, standing, gameweekId, repository]);

  if (!standing) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 500, maxWidth: '100vw', padding: ThemeTokens.spacing.lg }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: ThemeTokens.spacing.lg,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {standing.playerName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {standing.teamName}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {isLoading ? (
          <LoadingState label="Loading squad..." />
        ) : squadPerformance ? (
          <MyTeam
            livePerformance={squadPerformance}
            isLoading={false}
            lastUpdated={new Date()}
            isRefreshing={false}
          />
        ) : (
          <ErrorState title="Failed to load squad" message="Unable to load manager's squad" />
        )}
      </Box>
    </Drawer>
  );
};

/**
 * Render rank movement indicator
 */
function RankMovementCell({ movement }: { movement?: number }): React.ReactElement {
  if (movement === undefined || movement === 0) {
    return <Typography variant="body2">—</Typography>;
  }

  const isImproved = movement > 0;
  const absMovement = Math.abs(movement);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {isImproved ? (
        <TrendingUpIcon sx={{ fontSize: '1rem', color: '#4caf50' }} />
      ) : (
        <TrendingDownIcon sx={{ fontSize: '1rem', color: '#f44336' }} />
      )}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: isImproved ? '#4caf50' : '#f44336',
        }}
      >
        {isImproved ? '+' : '-'}
        {absMovement}
      </Typography>
    </Box>
  );
}

/**
 * Leagues Component
 */
export function Leagues({
  entry,
  isLoading,
  connectedEntryId,
  selectedGameweek,
}: LeaguesProps): React.ReactElement {
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [leagueStandings, setLeagueStandings] = useState<FantasyLeagueStandings | null>(null);
  const [liveStandings, setLiveStandings] = useState<LiveLeagueStandingsResult | null>(null);
  const [isLoadingStandings, setIsLoadingStandings] = useState(false);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('official');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedManager, setSelectedManager] = useState<LiveLeagueStanding | null>(null);
  const [inspectionDrawerOpen, setInspectionDrawerOpen] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonOpponent, setComparisonOpponent] = useState<FantasyLeagueStanding | null>(null);

  const repository = new FantasyGameRepository();
  const liveLeagueService = useMemo(() => new FantasyGameLiveLeagueService(), []);

  // Load official standings when league is selected
  useEffect(() => {
    if (!selectedLeagueId) return;

    const loadStandings = async () => {
      try {
        setIsLoadingStandings(true);
        setStandingsError(null);
        const standings = await repository.getLeagueStandings(selectedLeagueId);
        setLeagueStandings(standings);
        setViewMode('official'); // Reset to official view
        setLiveStandings(null);
      } catch (err) {
        setStandingsError(err instanceof Error ? err.message : 'Failed to load standings');
      } finally {
        setIsLoadingStandings(false);
      }
    };

    loadStandings();
  }, [selectedLeagueId, repository]);

  // Load live standings when switching to live view or gameweek changes
  useEffect(() => {
    if (
      viewMode !== 'live' ||
      !selectedLeagueId ||
      !leagueStandings ||
      selectedGameweek === null ||
      selectedGameweek === undefined
    ) {
      return;
    }

    const loadLive = async () => {
      try {
        setIsLoadingLive(true);
        setLiveError(null);

        const result = await liveLeagueService.calculateLiveLeagueStandings(
          leagueStandings.standings,
          selectedGameweek,
          connectedEntryId ?? undefined
        );

        result.leagueId = selectedLeagueId;
        result.leagueName = leagueStandings.leagueName;

        setLiveStandings(result);
      } catch (err) {
        setLiveError(err instanceof Error ? err.message : 'Failed to calculate live standings');
      } finally {
        setIsLoadingLive(false);
      }
    };

    loadLive();
  }, [
    viewMode,
    selectedLeagueId,
    leagueStandings,
    selectedGameweek,
    liveLeagueService,
    connectedEntryId,
  ]);

  const handleRefreshLive = async () => {
    if (
      isRefreshing ||
      !selectedLeagueId ||
      !leagueStandings ||
      selectedGameweek === null ||
      selectedGameweek === undefined
    ) {
      return;
    }

    try {
      setIsRefreshing(true);
      const result = await liveLeagueService.calculateLiveLeagueStandings(
        leagueStandings.standings,
        selectedGameweek,
        connectedEntryId ?? undefined
      );

      result.leagueId = selectedLeagueId;
      result.leagueName = leagueStandings.leagueName;

      setLiveStandings(result);
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : 'Failed to refresh live standings');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManagerClick = (standing: LiveLeagueStanding) => {
    setSelectedManager(standing);
    setInspectionDrawerOpen(true);
  };

  const handleStartComparison = (opponent: FantasyLeagueStanding) => {
    // Don't compare against self
    if (opponent.entryId === connectedEntryId) {
      return;
    }
    setComparisonOpponent(opponent);
    setComparisonMode(true);
  };

  const handleCloseComparison = () => {
    setComparisonMode(false);
    setComparisonOpponent(null);
  };

  if (isLoading) {
    return <LoadingState label="Loading leagues..." />;
  }

  if (!entry || entry.joinedLeaguesIds.length === 0) {
    return (
      <EmptyState
        title="No Leagues Joined"
        description="You haven't joined any classic leagues yet. Join leagues on the official FPL website to view standings here."
      />
    );
  }

  return (
    <Stack spacing={ThemeTokens.spacing.xl}>
      {/* Head-to-Head Comparison Mode */}
      {comparisonMode && comparisonOpponent && connectedEntryId && selectedLeagueId && (
        <Box>
          <HeadToHeadGameweekComparison
            myManager={
              {
                entryId: connectedEntryId,
                rank:
                  leagueStandings?.standings.find((s) => s.entryId === connectedEntryId)?.rank ?? 0,
                playerName: entry?.manager.name ?? 'You',
                teamName: entry?.team.name ?? 'Your Team',
                eventPoints:
                  leagueStandings?.standings.find((s) => s.entryId === connectedEntryId)
                    ?.eventPoints ?? 0,
                totalPoints: entry?.manager.totalPoints ?? 0,
                prevRank: leagueStandings?.standings.find((s) => s.entryId === connectedEntryId)
                  ?.prevRank,
              } as FantasyLeagueStanding
            }
            opponentManager={comparisonOpponent}
            connectedEntryId={connectedEntryId}
            selectedLeagueId={selectedLeagueId}
            onClose={handleCloseComparison}
          />
        </Box>
      )}

      {/* League Selector */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
        >
          Your Leagues
        </Typography>
        <Box sx={{ display: 'flex', gap: ThemeTokens.spacing.md, flexWrap: 'wrap' }}>
          {entry.joinedLeaguesIds.map((leagueId) => (
            <Button
              key={leagueId}
              variant={selectedLeagueId === leagueId ? 'contained' : 'outlined'}
              onClick={() => setSelectedLeagueId(leagueId)}
              sx={{ textTransform: 'none' }}
            >
              League {leagueId}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Standings */}
      {selectedLeagueId && (
        <Box>
          {isLoadingStandings ? (
            <LoadingState label="Loading standings..." />
          ) : standingsError ? (
            <ErrorState title="Failed to load standings" message={standingsError} />
          ) : leagueStandings ? (
            <Stack spacing={ThemeTokens.spacing.lg}>
              {/* League Info & View Toggle */}
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
              >
                <Card sx={{ flex: 1 }}>
                  <CardContent>
                    <Stack spacing={ThemeTokens.spacing.sm}>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          League
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {leagueStandings.leagueName || `League ${selectedLeagueId}`}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Your Official Rank
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {leagueStandings.standings[0]?.rank
                            ? `#${leagueStandings.standings[0].rank} of ${leagueStandings.pageSize}`
                            : '—'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* View Toggle */}
                <Box sx={{ marginLeft: ThemeTokens.spacing.md }}>
                  <ButtonGroup size="small" variant="outlined">
                    <Button
                      onClick={() => setViewMode('official')}
                      variant={viewMode === 'official' ? 'contained' : 'outlined'}
                    >
                      Official
                    </Button>
                    <Button
                      onClick={() => setViewMode('live')}
                      variant={viewMode === 'live' ? 'contained' : 'outlined'}
                      disabled={selectedGameweek === null || selectedGameweek === undefined}
                    >
                      Live
                    </Button>
                  </ButtonGroup>
                </Box>
              </Box>

              {/* Live View - Summary & Loading */}
              {viewMode === 'live' && (
                <Stack spacing={ThemeTokens.spacing.md}>
                  {isLoadingLive && !liveStandings ? (
                    <LoadingState label="Calculating live standings..." />
                  ) : liveError ? (
                    <ErrorState title="Failed to calculate live standings" message={liveError} />
                  ) : liveStandings ? (
                    <>
                      {/* Live Summary */}
                      <Card>
                        <CardContent>
                          <Stack spacing={ThemeTokens.spacing.md}>
                            <Box>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{ fontSize: '0.75rem' }}
                              >
                                Page-scoped calculation ({liveStandings.successfullyLoadedManagers}{' '}
                                of {liveStandings.totalManagersOnPage} managers loaded)
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                                gap: ThemeTokens.spacing.md,
                              }}
                            >
                              <Box>
                                <Typography variant="caption" color="textSecondary">
                                  Your Live Rank
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  {liveStandings.standings.find(
                                    (s) => s.isConnectedUser && s.calculatedLiveRank
                                  )?.calculatedLiveRank ?? '—'}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="textSecondary">
                                  Your GW Points
                                </Typography>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 700,
                                    color:
                                      (liveStandings.standings.find((s) => s.isConnectedUser)
                                        ?.liveGameweekPoints ?? 0) >= 60
                                        ? '#4caf50'
                                        : '#ff9800',
                                  }}
                                >
                                  {liveStandings.standings.find((s) => s.isConnectedUser)
                                    ?.liveGameweekPoints ?? '—'}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="textSecondary">
                                  Page Average
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  {liveStandings.pageAverage}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="textSecondary">
                                  vs Page Average
                                </Typography>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 700,
                                    color:
                                      (liveStandings.standings.find((s) => s.isConnectedUser)
                                        ?.liveGameweekPoints ?? 0) > liveStandings.pageAverage
                                        ? '#4caf50'
                                        : '#f44336',
                                  }}
                                >
                                  {(() => {
                                    const yourPoints =
                                      liveStandings.standings.find((s) => s.isConnectedUser)
                                        ?.liveGameweekPoints ?? 0;
                                    const diff = yourPoints - liveStandings.pageAverage;
                                    return diff > 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`;
                                  })()}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Refresh & Last Updated */}
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: ThemeTokens.spacing.sm,
                                borderTopWidth: 1,
                                borderTopStyle: 'solid',
                                borderTopColor: '#e0e0e0',
                              }}
                            >
                              <Typography variant="caption" color="textSecondary">
                                Last updated: {liveStandings.lastUpdated.toLocaleTimeString()}
                              </Typography>
                              <Button
                                size="small"
                                onClick={handleRefreshLive}
                                disabled={isRefreshing}
                                startIcon={<RefreshIcon />}
                              >
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                              </Button>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </>
                  ) : null}
                </Stack>
              )}

              {/* Standings Table */}
              <TableContainer component={Paper} sx={{ borderRadius: ThemeTokens.borderRadius.md }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      {viewMode === 'official' ? (
                        <>
                          <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Manager</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            GW
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            Total
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            Actions
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell sx={{ fontWeight: 600 }}>Live Rank</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Δ</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Manager</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Captain</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            GW
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            Played
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            Left
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            Total
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            Actions
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewMode === 'official'
                      ? leagueStandings.standings.map((standing) => {
                          const isCurrentUser =
                            connectedEntryId && standing.entryId === connectedEntryId;
                          return (
                            <TableRow
                              key={standing.entryId}
                              sx={{
                                backgroundColor: isCurrentUser ? '#e3f2fd' : undefined,
                                '&:hover': { backgroundColor: '#f9f9f9' },
                                fontWeight: isCurrentUser ? 600 : undefined,
                              }}
                            >
                              <TableCell sx={{ fontWeight: isCurrentUser ? 700 : 600 }}>
                                #{standing.rank}
                              </TableCell>
                              <TableCell sx={{ fontWeight: isCurrentUser ? 600 : undefined }}>
                                {standing.playerName}
                                {isCurrentUser && (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{ marginLeft: 1, color: '#2196f3', fontWeight: 600 }}
                                  >
                                    (You)
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ fontWeight: isCurrentUser ? 600 : undefined }}>
                                {standing.teamName}
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  fontWeight: 600,
                                  color:
                                    standing.eventPoints >= 60
                                      ? '#4caf50'
                                      : standing.eventPoints >= 40
                                        ? '#ff9800'
                                        : undefined,
                                }}
                              >
                                {standing.eventPoints}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>
                                {standing.totalPoints}
                              </TableCell>
                              <TableCell align="right" sx={{ padding: ThemeTokens.spacing.xs }}>
                                {!isCurrentUser && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<CompareIcon />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartComparison(standing);
                                    }}
                                  >
                                    Compare
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      : liveStandings?.standings.map((standing) => {
                          const isCurrentUser =
                            connectedEntryId && standing.entryId === connectedEntryId;
                          return (
                            <TableRow
                              key={standing.entryId}
                              sx={{
                                backgroundColor: isCurrentUser ? '#e3f2fd' : undefined,
                                opacity: standing.isLoaded && !standing.error ? 1 : 0.6,
                                '&:hover': { backgroundColor: '#f9f9f9' },
                                fontWeight: isCurrentUser ? 600 : undefined,
                              }}
                              onClick={() => handleManagerClick(standing)}
                            >
                              <TableCell sx={{ fontWeight: isCurrentUser ? 700 : 600 }}>
                                {standing.calculatedLiveRank
                                  ? `#${standing.calculatedLiveRank}`
                                  : '—'}
                              </TableCell>
                              <TableCell>
                                <RankMovementCell movement={standing.rankMovement} />
                              </TableCell>
                              <TableCell sx={{ fontWeight: isCurrentUser ? 600 : undefined }}>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {standing.playerName}
                                    {isCurrentUser && (
                                      <Typography
                                        component="span"
                                        variant="caption"
                                        sx={{ marginLeft: 1, color: '#2196f3', fontWeight: 600 }}
                                      >
                                        (You)
                                      </Typography>
                                    )}
                                  </Typography>
                                  {standing.error && (
                                    <Typography variant="caption" sx={{ color: '#f44336' }}>
                                      {standing.error}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                {standing.captainName ? (
                                  <Box>
                                    <Typography variant="body2">{standing.captainName}</Typography>
                                    <Typography variant="caption" color="textSecondary">
                                      {standing.captainRawPoints} →{' '}
                                      {standing.captainEffectivePoints}
                                    </Typography>
                                  </Box>
                                ) : (
                                  '—'
                                )}
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  fontWeight: 600,
                                  color:
                                    standing.liveGameweekPoints >= 60
                                      ? '#4caf50'
                                      : standing.liveGameweekPoints >= 40
                                        ? '#ff9800'
                                        : undefined,
                                }}
                              >
                                {standing.liveGameweekPoints}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                {standing.playersPlayed}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                {standing.playersRemaining}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 700 }}>
                                {standing.calculatedLiveTotal}
                              </TableCell>
                              <TableCell align="right" sx={{ padding: ThemeTokens.spacing.xs }}>
                                {!isCurrentUser && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<CompareIcon />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartComparison({
                                        entryId: standing.entryId,
                                        rank: standing.calculatedLiveRank ?? 0,
                                        playerName: standing.playerName,
                                        teamName: standing.teamName,
                                        eventPoints: standing.liveGameweekPoints,
                                        totalPoints: standing.calculatedLiveTotal,
                                        prevRank: null,
                                        entryName: standing.teamName,
                                        points: standing.calculatedLiveTotal,
                                      } as FantasyLeagueStanding);
                                    }}
                                  >
                                    Compare
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Info Messages */}
              {viewMode === 'live' && liveStandings && (
                <Stack spacing={ThemeTokens.spacing.md}>
                  <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                    <Typography variant="body2">
                      <strong>
                        Live rankings are calculated for managers currently loaded on this standings
                        page.
                      </strong>{' '}
                      Click on any manager to view their detailed squad performance.
                    </Typography>
                  </Alert>

                  {liveStandings.successfullyLoadedManagers < liveStandings.totalManagersOnPage && (
                    <Alert severity="warning">
                      {liveStandings.totalManagersOnPage - liveStandings.successfullyLoadedManagers}{' '}
                      manager
                      {liveStandings.totalManagersOnPage -
                        liveStandings.successfullyLoadedManagers !==
                      1
                        ? 's'
                        : ''}{' '}
                      could not be loaded. Their scores are marked unavailable.
                    </Alert>
                  )}
                </Stack>
              )}

              {/* Pagination Note */}
              {leagueStandings.hasNext && (
                <Alert severity="info">
                  Showing page {leagueStandings.pageNumber}. Only one page of standings is loaded
                  currently.
                </Alert>
              )}
            </Stack>
          ) : null}
        </Box>
      )}

      {/* Manager Inspection Drawer */}
      {selectedGameweek && (
        <ManagerInspectionDrawer
          standing={selectedManager}
          open={inspectionDrawerOpen}
          onClose={() => setInspectionDrawerOpen(false)}
          gameweekId={selectedGameweek}
        />
      )}
    </Stack>
  );
}
