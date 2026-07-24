/**
 * League Race Table Component
 * Main standings table for Live League Race
 * Shows all managers with rank, movement, points, and gaps
 * Manager rows are interactive to navigate to comparison
 */

import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ThemeTokens } from '@shared/theme/tokens';
import type { LeagueRaceEntry } from '@domain/models';

export interface LeagueRaceTableProps {
  entries: LeagueRaceEntry[];
  currentManagerId: number;
  leagueId: number;
}

interface RankMovementProps {
  movement: number;
}

const RankMovement: React.FC<RankMovementProps> = ({ movement }) => {
  if (movement === 0) {
    return <Typography sx={{ fontWeight: 700, color: '#666' }}>--</Typography>;
  }

  const isUp = movement > 0;
  const color = isUp ? '#4caf50' : '#f44336';
  const symbol = isUp ? 'UP' : 'DOWN';

  return (
    <Typography sx={{ fontWeight: 700, color }}>
      {symbol}
      {Math.abs(movement)}
    </Typography>
  );
};

export const LeagueRaceTable: React.FC<LeagueRaceTableProps> = ({
  entries,
  currentManagerId,
  leagueId,
}) => {
  const navigate = useNavigate();

  const handleRowClick = (managerId: number): void => {
    if (managerId === currentManagerId) {
      return; // Don't self-compare
    }

    navigate(`/premier-league/gameweek/league/${leagueId}/managers/${managerId}`);
  };

  const isClickable = (managerId: number): boolean => managerId !== currentManagerId;

  return (
    <Paper sx={{ mb: ThemeTokens.spacing.lg, overflow: 'hidden' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '100%' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', py: 1.5 }}>Rank</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', py: 1.5 }}>Mv</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', py: 1.5 }}>
                Manager / Team
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.85rem', py: 1.5 }}>
                GW
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.85rem', py: 1.5 }}>
                Total
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.85rem', py: 1.5 }}>
                Gap
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => {
              const isCurrentManager = entry.managerId === currentManagerId;
              const clickable = isClickable(entry.managerId);

              return (
                <TableRow
                  key={entry.managerId}
                  onClick={() => handleRowClick(entry.managerId)}
                  sx={{
                    backgroundColor: isCurrentManager ? '#fff9c4' : 'transparent',
                    cursor: clickable ? 'pointer' : 'default',
                    transition: 'background-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: clickable
                        ? '#f5f5f5'
                        : isCurrentManager
                          ? '#fff9c4'
                          : 'transparent',
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 700, py: 1, fontSize: '0.9rem' }}>
                    {entry.currentRank}
                  </TableCell>
                  <TableCell sx={{ py: 1, fontSize: '0.9rem' }}>
                    <RankMovement movement={entry.rankMovement} />
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: isCurrentManager ? 700 : 600,
                          fontSize: '0.9rem',
                        }}
                      >
                        {entry.managerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {entry.teamName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, py: 1, fontSize: '0.9rem' }}>
                    {entry.gameweekPoints}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, py: 1, fontSize: '0.9rem' }}>
                    {entry.totalPoints}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: entry.gapToLeader < 0 ? '#f44336' : '#666',
                      }}
                    >
                      {entry.gapToLeader < 0 ? entry.gapToLeader : '--'}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};
