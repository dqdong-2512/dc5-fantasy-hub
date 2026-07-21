/**
 * Player Point Breakdown Component
 * Shows detailed point calculation for a single player
 * Displays how each action (goals, CS, etc.) contributed to final points
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Divider,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface PointBreakdownData {
  playerId: number;
  playerName: string;
  playerTeam: string;
  fixture?: string;
  matchStatus?: 'finished' | 'live' | 'not_started' | 'unknown';

  // Player stats
  minutes: number;
  goalsScored: number;
  assists: number;
  cleanSheets: number;
  goalsConceded: number;
  ownGoals: number;
  penaltiesSaved: number;
  penaltiesMissed: number;
  yellowCards: number;
  redCards: number;
  bonus: number;
  bps: number;

  // Points breakdown
  totalPoints: number;
  multiplier: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  finalPoints: number;
}

interface PointBreakdownItemProps {
  label: string;
  value: number;
  pointsPer: number;
}

const PointBreakdownItem: React.FC<PointBreakdownItemProps> = ({ label, value, pointsPer }) => {
  if (value === 0) return null;

  const points = value * pointsPer;
  const isNegative = points < 0;

  return (
    <TableRow>
      <TableCell sx={{ paddingY: 1 }}>
        <Typography variant="body2">{label}</Typography>
      </TableCell>
      <TableCell sx={{ paddingY: 1, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      </TableCell>
      <TableCell sx={{ paddingY: 1, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {pointsPer}
        </Typography>
      </TableCell>
      <TableCell sx={{ paddingY: 1, textAlign: 'right' }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: isNegative ? '#d32f2f' : '#4caf50',
          }}
        >
          {isNegative ? '' : '+'}
          {points}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

export interface PlayerPointBreakdownProps {
  open: boolean;
  onClose: () => void;
  breakdown: PointBreakdownData | null;
}

export const PlayerPointBreakdown: React.FC<PlayerPointBreakdownProps> = ({
  open,
  onClose,
  breakdown,
}) => {
  if (!breakdown) {
    return null;
  }

  const multiplierLabel =
    breakdown.multiplier === 3
      ? '×3 (Triple Captain)'
      : breakdown.multiplier === 2
        ? '×2 (Captain)'
        : '×1';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Point Breakdown</DialogTitle>

      <DialogContent sx={{ paddingTop: 2 }}>
        <Stack spacing={2}>
          {/* Player Header */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {breakdown.playerName}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ marginTop: 0.5 }}>
              <Typography variant="body2" color="textSecondary">
                {breakdown.playerTeam}
              </Typography>
              {breakdown.fixture && (
                <Typography variant="body2" color="textSecondary">
                  vs {breakdown.fixture}
                </Typography>
              )}
              {breakdown.matchStatus && (
                <Chip
                  label={breakdown.matchStatus}
                  size="small"
                  sx={{
                    backgroundColor:
                      breakdown.matchStatus === 'finished'
                        ? '#e8f5e9'
                        : breakdown.matchStatus === 'live'
                          ? '#fff3e0'
                          : '#f5f5f5',
                  }}
                />
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Main Stats */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, marginBottom: 1 }}>
              Playing Time
            </Typography>
            <Typography variant="body2">
              {breakdown.minutes} minutes
              {breakdown.minutes < 60 && ' (less than 1 point for playing time)'}
            </Typography>
          </Box>

          {/* Actions Breakdown */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, marginBottom: 1 }}>
              Action Points
            </Typography>
            <Table size="small">
              <TableBody>
                <PointBreakdownItem
                  label="Goals Scored"
                  value={breakdown.goalsScored}
                  pointsPer={5}
                />
                <PointBreakdownItem label="Assists" value={breakdown.assists} pointsPer={1} />
                <PointBreakdownItem
                  label="Clean Sheet"
                  value={breakdown.cleanSheets}
                  pointsPer={4}
                />
                <PointBreakdownItem
                  label="Goals Conceded"
                  value={breakdown.goalsConceded}
                  pointsPer={-1}
                />
                <PointBreakdownItem label="Own Goals" value={breakdown.ownGoals} pointsPer={-2} />
                <PointBreakdownItem
                  label="Penalties Saved"
                  value={breakdown.penaltiesSaved}
                  pointsPer={1}
                />
                <PointBreakdownItem
                  label="Penalties Missed"
                  value={breakdown.penaltiesMissed}
                  pointsPer={-2}
                />
                <PointBreakdownItem
                  label="Yellow Cards"
                  value={breakdown.yellowCards}
                  pointsPer={-1}
                />
                <PointBreakdownItem label="Red Cards" value={breakdown.redCards} pointsPer={-3} />
                {breakdown.bonus > 0 && (
                  <PointBreakdownItem label="Bonus Points" value={1} pointsPer={breakdown.bonus} />
                )}
              </TableBody>
            </Table>
          </Box>

          <Divider />

          {/* Captain Multiplier */}
          {breakdown.multiplier > 1 && (
            <Box
              sx={{
                backgroundColor: '#fff3e0',
                padding: ThemeTokens.spacing.md,
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {multiplierLabel}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ marginTop: 0.5 }}>
                {breakdown.totalPoints} × {breakdown.multiplier} = {breakdown.finalPoints}
              </Typography>
            </Box>
          )}

          {/* Final Points */}
          <Box
            sx={{
              backgroundColor: '#f5f5f5',
              padding: ThemeTokens.spacing.md,
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Final Gameweek Points
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50', marginTop: 0.5 }}>
              {breakdown.finalPoints}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
