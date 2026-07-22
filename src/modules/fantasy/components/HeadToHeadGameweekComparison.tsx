/**
 * Head-to-Head Gameweek Comparison Component
 * Displays interactive side-by-side manager comparison for a selected gameweek
 * Integrates into League Detail experience with Pitch/List views and League Race tracking
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
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { LoadingState, ErrorState } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { GameweekHeadToHeadService } from '../services';
import { ComparisonPitchView } from './ComparisonPitchView';
import { LeagueRaceView } from './LeagueRaceView';
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
  const [comparisonTab, setComparisonTab] = useState<'head-to-head' | 'league-race'>(
    'head-to-head'
  );

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
        </Stack>
      </CardContent>
    </Card>
  );
};
