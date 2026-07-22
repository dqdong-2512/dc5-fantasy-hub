/**
 * Fantasy Overview
 * Displays personal FPL metrics and recent gameweek history
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type { FantasyEntry, FantasyGameweekHistory } from '@domain/models';
import { OverviewSkeleton } from './OverviewSkeleton';
import { ThemeTokens } from '@shared/theme/tokens';

export interface FantasyOverviewProps {
  entry: FantasyEntry | null;
  history: FantasyGameweekHistory[] | null;
  isLoading: boolean;
}

/**
 * Fantasy Overview Component
 */
export function FantasyOverview({
  entry,
  history,
  isLoading,
}: FantasyOverviewProps): React.ReactElement {
  const recentHistory = useMemo(() => {
    if (!history) return [];
    // Show last 5 gameweeks, most recent first
    return history.slice(-5).reverse();
  }, [history]);

  // Show skeleton only on initial load when no data exists
  if (isLoading && !entry) {
    return <OverviewSkeleton />;
  }

  if (!entry) {
    return (
      <Typography color="textSecondary" sx={{ textAlign: 'center' }}>
        No data available
      </Typography>
    );
  }

  return (
    <Stack spacing={ThemeTokens.spacing.sm}>
      {/* Recent Gameweek History */}
      {recentHistory.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.xs }}>
            Recent Gameweek Performance
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: ThemeTokens.borderRadius.md }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>GW</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Points
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Total
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Rank
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Transfers
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentHistory.map((gw) => (
                  <TableRow key={gw.event} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>GW {gw.event}</TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color:
                            gw.points >= 60 ? '#4caf50' : gw.points >= 40 ? '#ff9800' : '#f44336',
                        }}
                      >
                        {gw.points}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{gw.totalPoints}</TableCell>
                    <TableCell align="right">
                      {gw.rank ? `#${gw.rank.toLocaleString()}` : '—'}
                    </TableCell>
                    <TableCell align="right">
                      {gw.transfers > 0 ? (
                        <Typography variant="caption" sx={{ color: '#f44336' }}>
                          {gw.transfers} (-{gw.transfersCost})
                        </Typography>
                      ) : (
                        '0'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Stack>
  );
}
