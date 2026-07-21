/**
 * Live League Standings Component
 * Displays official vs provisional/live league standings
 * Shows manager movements based on current gameweek performance
 */

import React, { useMemo, useState } from 'react';
import {
  Card,
  Box,
  Typography,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface LiveLeagueStandingsEntry {
  rank: number;
  liveRank: number;
  managerId: number;
  managerName: string;
  teamName: string;
  totalPoints: number;
  liveTotalPoints: number;
  gameweekPoints: number;
  liveGameweekPoints: number;
  movement: number; // Positive = improved rank
  isConnectedManager?: boolean;
  isSelectedOpponent?: boolean;
}

export interface LiveLeagueStandingsProps {
  standings: LiveLeagueStandingsEntry[] | null;
  isLoading?: boolean;
  error?: string | null;
  onSelectManager?: (managerId: number) => void;
  compact?: boolean;
}

export const LiveLeagueStandings: React.FC<LiveLeagueStandingsProps> = ({
  standings,
  isLoading = false,
  error = null,
  onSelectManager,
  compact = false,
}) => {
  const [viewMode, setViewMode] = useState<'official' | 'live'>('official');

  // Sort standings based on view mode
  const sortedStandings = useMemo(() => {
    if (!standings) return [];

    if (viewMode === 'live') {
      return [...standings].sort((a, b) => a.liveRank - b.liveRank);
    } else {
      return [...standings].sort((a, b) => a.rank - b.rank);
    }
  }, [standings, viewMode]);

  if (isLoading) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="textSecondary">
            Loading live standings...
          </Typography>
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md }}>
        <Typography color="error">{error}</Typography>
      </Card>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md }}>
        <Typography color="textSecondary">No standings data available</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ padding: ThemeTokens.spacing.md, borderBottom: '1px solid #e0e0e0' }}>
        <Stack sx={{ direction: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            League Standings
          </Typography>

          {!compact && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, mode) => mode && setViewMode(mode)}
              size="small"
            >
              <ToggleButton value="official">Official</ToggleButton>
              <ToggleButton value="live">Live</ToggleButton>
            </ToggleButtonGroup>
          )}
        </Stack>
        {viewMode === 'live' && (
          <Typography variant="caption" color="textSecondary" sx={{ marginTop: 0.5 }}>
            Provisional standings based on current gameweek performance
          </Typography>
        )}
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, padding: '12px 8px' }}>Rank</TableCell>
              {viewMode === 'live' && (
                <TableCell sx={{ fontWeight: 700, padding: '12px 8px', textAlign: 'center' }}>
                  Live Rank
                </TableCell>
              )}
              <TableCell sx={{ fontWeight: 700, padding: '12px 8px', minWidth: '150px' }}>
                Manager / Team
              </TableCell>
              <TableCell sx={{ fontWeight: 700, padding: '12px 8px', textAlign: 'center' }}>
                GW Pts
              </TableCell>
              <TableCell sx={{ fontWeight: 700, padding: '12px 8px', textAlign: 'center' }}>
                Total
              </TableCell>
              {viewMode === 'live' && (
                <TableCell sx={{ fontWeight: 700, padding: '12px 8px', textAlign: 'center' }}>
                  Movement
                </TableCell>
              )}
              <TableCell sx={{ fontWeight: 700, padding: '12px 8px', textAlign: 'center' }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedStandings.map((entry) => {
              const isConnected = entry.isConnectedManager;
              const isSelected = entry.isSelectedOpponent;
              const isCurrentUser = isConnected;

              let rowBgColor = 'transparent';
              if (isConnected) rowBgColor = '#e3f2fd';
              else if (isSelected) rowBgColor = '#f3e5f5';

              const displayRank = viewMode === 'live' ? entry.liveRank : entry.rank;
              const displayTotal = viewMode === 'live' ? entry.liveTotalPoints : entry.totalPoints;
              const displayGWPoints =
                viewMode === 'live' ? entry.liveGameweekPoints : entry.gameweekPoints;

              return (
                <TableRow
                  key={entry.managerId}
                  sx={{
                    backgroundColor: rowBgColor,
                    '&:hover': { backgroundColor: rowBgColor ? rowBgColor : '#fafafa' },
                    fontWeight: isCurrentUser ? 600 : 400,
                  }}
                >
                  {/* Rank */}
                  <TableCell sx={{ padding: '12px 8px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: isCurrentUser ? '#1976d2' : 'inherit',
                        }}
                      >
                        #{displayRank}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Live rank (only in live view) */}
                  {viewMode === 'live' && (
                    <TableCell sx={{ padding: '12px 8px', textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        #{entry.liveRank}
                        {entry.movement !== 0 && (
                          <Typography
                            sx={{
                              marginLeft: 1,
                              color: entry.movement > 0 ? '#4caf50' : '#d32f2f',
                              fontWeight: 700,
                            }}
                          >
                            {entry.movement > 0 ? '↑' : '↓'} {Math.abs(entry.movement)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  )}

                  {/* Manager / Team name */}
                  <TableCell sx={{ padding: '12px 8px' }}>
                    <Stack spacing={0.25}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: isCurrentUser ? '#1976d2' : 'inherit',
                        }}
                      >
                        {entry.managerName}
                        {isCurrentUser && <Typography variant="caption"> (You)</Typography>}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {entry.teamName}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* GW Points */}
                  <TableCell sx={{ padding: '12px 8px', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {displayGWPoints}
                    </Typography>
                  </TableCell>

                  {/* Total Points */}
                  <TableCell sx={{ padding: '12px 8px', textAlign: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: isCurrentUser ? '#4caf50' : 'inherit',
                      }}
                    >
                      {displayTotal}
                    </Typography>
                  </TableCell>

                  {/* Movement (live view only) */}
                  {viewMode === 'live' && (
                    <TableCell sx={{ padding: '12px 8px', textAlign: 'center' }}>
                      {entry.movement !== 0 && (
                        <Chip
                          label={`${entry.movement > 0 ? '+' : ''}${entry.movement}`}
                          size="small"
                          color={entry.movement > 0 ? 'success' : 'error'}
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  )}

                  {/* Action */}
                  <TableCell sx={{ padding: '12px 8px', textAlign: 'center' }}>
                    {!isCurrentUser && onSelectManager && (
                      <Button
                        size="small"
                        variant={isSelected ? 'contained' : 'outlined'}
                        onClick={() => onSelectManager(entry.managerId)}
                        sx={{ textTransform: 'none' }}
                      >
                        {isSelected ? 'Selected' : 'Compare'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      {/* Stats summary */}
      {!compact && standings.length > 0 && (
        <Box sx={{ padding: ThemeTokens.spacing.md, backgroundColor: '#f9f9f9' }}>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" color="textSecondary">
                Avg Points
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {Math.round(
                  standings.reduce((sum, s) => sum + s.totalPoints, 0) / standings.length
                )}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">
                Highest
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {Math.max(...standings.map((s) => s.totalPoints))}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">
                Lowest
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {Math.min(...standings.map((s) => s.totalPoints))}
              </Typography>
            </Box>
          </Stack>
        </Box>
      )}
    </Card>
  );
};
