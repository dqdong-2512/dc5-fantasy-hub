/**
 * League Standings Panel Component
 * Displays league standings with pagination and row selection
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Stack,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { RankMovement } from '../RankMovement';
import type { FantasyLeagueStandings } from '@domain/models';

export interface LeagueStandingsPanelProps {
  standings: FantasyLeagueStandings | null;
  selectedOpponentId: number | null;
  currentManagerId: number | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onSelectOpponent: (opponentId: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export const LeagueStandingsPanel: React.FC<LeagueStandingsPanelProps> = ({
  standings,
  selectedOpponentId,
  currentManagerId,
  isLoading,
  error,
  currentPage,
  hasNextPage,
  hasPreviousPage,
  onSelectOpponent,
  onNextPage,
  onPreviousPage,
}) => {
  const standingsEntries = useMemo(() => {
    return standings?.standings || [];
  }, [standings]);

  if (isLoading) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md }}>
        <Alert severity="error">{error}</Alert>
      </Card>
    );
  }

  return (
    <Card sx={{ padding: ThemeTokens.spacing.md }}>
      <Stack spacing={ThemeTokens.spacing.md}>
        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
          Standings
        </Typography>

        {/* Desktop Table */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Manager / Team</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  GW
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Total
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Movement
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {standingsEntries.map((entry, idx) => {
                const isCurrentUser = entry.entryId === currentManagerId;
                const isSelected = entry.entryId === selectedOpponentId;

                return (
                  <TableRow
                    key={idx}
                    onClick={() => {
                      if (!isCurrentUser) {
                        onSelectOpponent(entry.entryId || 0);
                      }
                    }}
                    sx={{
                      backgroundColor: isCurrentUser ? '#f0f7ff' : isSelected ? '#e3f2fd' : '#fff',
                      cursor: isCurrentUser ? 'default' : 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: isCurrentUser ? '#f0f7ff' : '#f5f5f5',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, width: 60 }}>{entry.rank}</TableCell>
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                          {entry.playerName}
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                          {entry.entryName}
                        </Typography>
                        {isCurrentUser && (
                          <Typography
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#1976d2',
                              marginTop: 0.25,
                            }}
                          >
                            YOU
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#4caf50', fontWeight: 600 }}>
                      {entry.eventPoints || 0}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      {entry.points || entry.totalPoints || 0}
                    </TableCell>
                    <TableCell align="center">
                      <RankMovement
                        previousRank={entry.prevRank || 0}
                        currentRank={entry.rank}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>

        {/* Mobile Card View */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
          {standingsEntries.map((entry, idx) => {
            const isCurrentUser = entry.entryId === currentManagerId;
            const isSelected = entry.entryId === selectedOpponentId;

            return (
              <Box
                key={idx}
                onClick={() => {
                  if (!isCurrentUser) {
                    onSelectOpponent(entry.entryId || 0);
                  }
                }}
                sx={{
                  padding: 2,
                  backgroundColor: isCurrentUser ? '#f0f7ff' : isSelected ? '#e3f2fd' : '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  cursor: isCurrentUser ? 'default' : 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                <Stack spacing={1}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
                      #{entry.rank}
                    </Typography>
                    {isCurrentUser && (
                      <Typography sx={{ fontWeight: 700, color: '#1976d2' }}>YOU</Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{entry.playerName}</Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                      {entry.entryName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        GW Points
                      </Typography>
                      <Typography sx={{ fontWeight: 600, color: '#4caf50' }}>
                        {entry.eventPoints || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Total
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {entry.points || entry.totalPoints || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Movement
                      </Typography>
                      <RankMovement
                        previousRank={entry.prevRank || 0}
                        currentRank={entry.rank}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Box>

        {/* Pagination */}
        {(hasPreviousPage || hasNextPage) && (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', paddingTop: ThemeTokens.spacing.md }}
          >
            <Stack direction="row" spacing={1}>
              <Button
                onClick={onPreviousPage}
                disabled={!hasPreviousPage}
                variant="outlined"
                size="small"
              >
                Previous
              </Button>
              <Typography sx={{ alignSelf: 'center' }}>Page {currentPage}</Typography>
              <Button onClick={onNextPage} disabled={!hasNextPage} variant="outlined" size="small">
                Next
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>
    </Card>
  );
};
