/**
 * Points Breakdown Component
 * Displays starting XI players and their gameweek contributions
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { ManagerGameweekSnapshot, PlayerGameweekContribution } from '@domain/models';

export interface PointsBreakdownProps {
  snapshot: ManagerGameweekSnapshot;
}

export const PointsBreakdown: React.FC<PointsBreakdownProps> = ({ snapshot }) => {
  const startersAndBench = useMemo(() => {
    const starters = snapshot.playerContributions
      .filter((p) => !p.isBench)
      .sort((a, b) => {
        // Sort by position: GK, DEF, MID, FWD
        const posOrder = { GOALKEEPER: 0, DEFENDER: 1, MIDFIELDER: 2, FORWARD: 3 };
        const aOrder = posOrder[a.position as keyof typeof posOrder] ?? 99;
        const bOrder = posOrder[b.position as keyof typeof posOrder] ?? 99;
        return aOrder - bOrder;
      });

    const bench = snapshot.playerContributions
      .filter((p) => p.isBench)
      .sort((a, b) => (a.benchOrder ?? 0) - (b.benchOrder ?? 0));

    return { starters, bench };
  }, [snapshot]);

  const getPositionShort = (position?: string): string => {
    switch (position) {
      case 'GOALKEEPER':
        return 'GK';
      case 'DEFENDER':
        return 'DEF';
      case 'MIDFIELDER':
        return 'MID';
      case 'FORWARD':
        return 'FWD';
      default:
        return '—';
    }
  };

  const renderPlayerRow = (player: PlayerGameweekContribution) => (
    <TableRow
      key={player.playerId}
      sx={{
        backgroundColor: player.isCaptain
          ? '#fff3e0'
          : player.isViceCaptain
            ? '#e3f2fd'
            : 'transparent',
        borderBottom: '1px solid #f0f0f0',
        '&:hover': { backgroundColor: '#fafafa' },
      }}
    >
      <TableCell
        sx={{
          paddingY: 1.5,
          fontWeight: 600,
          fontSize: '0.95rem',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>{player.playerName || 'Unknown'}</Typography>
          {player.isCaptain && (
            <Chip
              label="C"
              size="small"
              sx={{
                backgroundColor: '#d32f2f',
                color: '#fff',
                fontWeight: 700,
                height: '24px',
                width: '24px',
                '& .MuiChip-label': { padding: 0 },
              }}
            />
          )}
          {player.isViceCaptain && !player.isCaptain && (
            <Chip
              label="VC"
              size="small"
              sx={{
                backgroundColor: '#1976d2',
                color: '#fff',
                fontWeight: 700,
                height: '24px',
                '& .MuiChip-label': { padding: '0 4px' },
              }}
            />
          )}
        </Box>
      </TableCell>

      <TableCell sx={{ paddingY: 1.5, textAlign: 'center', fontSize: '0.9rem' }}>
        {getPositionShort(player.position)}
      </TableCell>

      <TableCell sx={{ paddingY: 1.5, textAlign: 'center', fontSize: '0.9rem' }}>
        {player.rawPoints}
      </TableCell>

      <TableCell sx={{ paddingY: 1.5, textAlign: 'center', fontSize: '0.9rem' }}>
        {player.multiplier === 1 ? '×1' : `×${player.multiplier}`}
      </TableCell>

      <TableCell
        sx={{
          paddingY: 1.5,
          textAlign: 'center',
          fontWeight: 700,
          color: player.managerPoints > 0 ? '#4caf50' : '#757575',
          fontSize: '0.95rem',
        }}
      >
        {player.managerPoints}
      </TableCell>
    </TableRow>
  );

  return (
    <Box sx={{ marginBottom: ThemeTokens.spacing.md }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          marginBottom: 1.5,
          fontSize: '1rem',
        }}
      >
        Points Breakdown
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Player</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
                Pos
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
                Points
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
                Multi
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
                Contribution
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Starting XI */}
            {startersAndBench.starters.map((player) => renderPlayerRow(player))}

            {/* Bench Section */}
            {startersAndBench.bench.length > 0 && (
              <>
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  <TableCell
                    colSpan={5}
                    sx={{
                      paddingY: 1,
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: '#666',
                    }}
                  >
                    Bench
                  </TableCell>
                </TableRow>
                {startersAndBench.bench.map((player) => renderPlayerRow(player))}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary Row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 2,
          paddingTop: 2,
          borderTop: '2px solid #e0e0e0',
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Starting XI Total</Typography>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1.1rem',
            color: '#1976d2',
          }}
        >
          {startersAndBench.starters.reduce((sum, p) => sum + p.managerPoints, 0)} pts
        </Typography>
      </Box>
    </Box>
  );
};
