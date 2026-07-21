/**
 * Gameweek History Component
 * Shows recent gameweeks performance summary
 * Allows selection of a gameweek to navigate to it
 */

import React, { useMemo } from 'react';
import {
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Button,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { RankMovement } from './RankMovement';
import type { FantasyGameweekHistory } from '@domain/models';

export interface GameweekHistoryProps {
  history: FantasyGameweekHistory[] | null;
  currentGameweek?: number;
  onSelectGameweek: (gameweekId: number) => void;
  isLoading?: boolean;
}

export const GameweekHistory: React.FC<GameweekHistoryProps> = ({
  history,
  currentGameweek,
  onSelectGameweek,
  isLoading = false,
}) => {
  // Get last 10 gameweeks
  const recentHistory = useMemo(() => {
    if (!history) return [];
    return history.slice(-10).reverse();
  }, [history]);

  if (!history || history.length === 0) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md }}>
        <Typography color="textSecondary">No gameweek history available</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ padding: 0, overflow: 'hidden' }}>
      <Box sx={{ padding: ThemeTokens.spacing.md, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Gameweek History (Last 10)
        </Typography>
      </Box>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, padding: '12px 8px' }}>Gameweek</TableCell>
              <TableCell sx={{ fontWeight: 700, padding: '12px 8px', textAlign: 'center' }}>
                Points
              </TableCell>
              <TableCell sx={{ fontWeight: 700, padding: '12px 8px', textAlign: 'center' }}>
                GW Rank
              </TableCell>
              <TableCell sx={{ fontWeight: 700, padding: '12px 8px', textAlign: 'center' }}>
                Overall Rank
              </TableCell>
              <TableCell sx={{ fontWeight: 700, padding: '12px 8px', textAlign: 'center' }}>
                Transfers
              </TableCell>
              <TableCell sx={{ fontWeight: 700, padding: '12px 8px', textAlign: 'center' }}>
                Cost
              </TableCell>
              <TableCell sx={{ fontWeight: 700, padding: '12px 8px', textAlign: 'center' }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {recentHistory.map((gw) => (
              <TableRow
                key={gw.event}
                sx={{
                  backgroundColor: gw.event === currentGameweek ? '#f5f5f5' : 'transparent',
                  '&:hover': { backgroundColor: '#fafafa' },
                }}
              >
                <TableCell sx={{ padding: '12px 8px', fontWeight: 600 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>GW {gw.event}</span>
                    {gw.event === currentGameweek && (
                      <Chip label="Current" size="small" color="primary" variant="outlined" />
                    )}
                  </Box>
                </TableCell>

                <TableCell sx={{ padding: '12px 8px', textAlign: 'center', fontWeight: 600 }}>
                  {gw.points}
                </TableCell>

                <TableCell sx={{ padding: '12px 8px', textAlign: 'center' }}>
                  {gw.rank ? `#${gw.rank.toLocaleString()}` : '—'}
                </TableCell>

                <TableCell sx={{ padding: '12px 8px', textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Typography variant="body2">#{gw.totalPoints.toLocaleString()}</Typography>
                    {gw.rank !== null && gw.prevRank !== null && (
                      <RankMovement
                        previousRank={gw.prevRank}
                        currentRank={gw.rank}
                        size="small"
                        showAbsoluteValue={false}
                      />
                    )}
                  </Box>
                </TableCell>

                <TableCell sx={{ padding: '12px 8px', textAlign: 'center' }}>
                  {gw.transfers}
                </TableCell>

                <TableCell sx={{ padding: '12px 8px', textAlign: 'center' }}>
                  {gw.transfersCost > 0 ? `-${gw.transfersCost}` : '—'}
                </TableCell>

                <TableCell sx={{ padding: '12px 8px', textAlign: 'center' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onSelectGameweek(gw.event)}
                    disabled={isLoading || gw.event === currentGameweek}
                    sx={{ textTransform: 'none' }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};
