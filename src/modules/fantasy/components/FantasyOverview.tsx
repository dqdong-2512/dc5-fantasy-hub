/**
 * Fantasy Overview
 * Displays personal FPL metrics and recent gameweek history
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type { FantasyEntry, FantasyGameweekHistory } from '@domain/models';
import { LoadingState } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';

export interface FantasyOverviewProps {
  entry: FantasyEntry | null;
  history: FantasyGameweekHistory[] | null;
  isLoading: boolean;
}

interface StatBoxProps {
  label: string;
  value: string | number;
  color?: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, color = '#1976d2' }) => (
  <Card>
    <CardContent>
      <Typography
        variant="caption"
        color="textSecondary"
        sx={{ display: 'block', marginBottom: 0.5 }}
      >
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, color }} noWrap>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

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

  if (isLoading) {
    return <LoadingState label="Loading overview..." />;
  }

  if (!entry) {
    return (
      <Typography color="textSecondary" sx={{ textAlign: 'center' }}>
        No data available
      </Typography>
    );
  }

  return (
    <Stack spacing={ThemeTokens.spacing.xl}>
      {/* Key Metrics Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: ThemeTokens.spacing.lg,
        }}
      >
        <StatBox label="Overall Points" value={entry.manager.totalPoints} color="#4caf50" />
        <StatBox
          label="Overall Rank"
          value={entry.manager.overallRank ? `#${entry.manager.overallRank.toLocaleString()}` : '—'}
          color="#2196f3"
        />
        <StatBox label="Manager" value={entry.manager.name} color="#ff9800" />
        <StatBox label="Team" value={entry.team.name} color="#9c27b0" />
      </Box>

      {/* Recent Gameweek History */}
      {recentHistory.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}>
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
