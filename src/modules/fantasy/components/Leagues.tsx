/**
 * Leagues Component
 * Displays joined leagues and league selector
 */

import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import type { FantasyEntry, FantasyLeagueStandings } from '@domain/models';
import { FantasyGameRepository } from '@repositories/fantasy';
import { LoadingState, ErrorState, EmptyState } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';

export interface LeaguesProps {
  entry: FantasyEntry | null;
  isLoading: boolean;
  connectedEntryId: number | null;
}

/**
 * Leagues Component
 */
export function Leagues({ entry, isLoading, connectedEntryId }: LeaguesProps): React.ReactElement {
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [leagueStandings, setLeagueStandings] = useState<FantasyLeagueStandings | null>(null);
  const [isLoadingStandings, setIsLoadingStandings] = useState(false);
  const [standingsError, setStandingsError] = useState<string | null>(null);

  const repository = new FantasyGameRepository();

  // Load standings when league is selected
  useEffect(() => {
    if (!selectedLeagueId) return;

    const loadStandings = async () => {
      try {
        setIsLoadingStandings(true);
        setStandingsError(null);
        const standings = await repository.getLeagueStandings(selectedLeagueId);
        setLeagueStandings(standings);
      } catch (err) {
        setStandingsError(err instanceof Error ? err.message : 'Failed to load standings');
      } finally {
        setIsLoadingStandings(false);
      }
    };

    loadStandings();
  }, [selectedLeagueId, repository]);

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
              {/* League Info */}
              <Card>
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
                        Your Rank
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

              {/* Standings Table */}
              <TableContainer component={Paper} sx={{ borderRadius: ThemeTokens.borderRadius.md }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Manager</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        GW
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leagueStandings.standings.map((standing) => {
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
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

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
    </Stack>
  );
}
