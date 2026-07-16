/**
 * Top Performing Players Widget
 * Displays top 10 players by total points
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
  Avatar,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { DashboardWidget } from '../components/DashboardWidget';
import { PlayerRepository } from '@repositories/players';
import { PlayerPresenter } from '@shared/presentation';
import { getPlayerImageUrl } from '@shared/assets';

export interface TopPerformingPlayersProps {
  onPlayerClick?: (playerId: number) => void;
}

/**
 * Top Performing Players Widget
 * Shows top 10 players by total points
 */
export const TopPerformingPlayers: React.FC<TopPerformingPlayersProps> = ({ onPlayerClick }) => {
  const topPlayers = useMemo(() => {
    try {
      const repo = new PlayerRepository();
      const all = repo.getAll();
      const sorted = all.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 10);
      return PlayerPresenter.toListPresentations(sorted);
    } catch (error) {
      console.error('Error loading top players:', error);
      return [];
    }
  }, []);

  return (
    <DashboardWidget
      title="Top Performing Players"
      subtitle="Top 10 by total points"
      icon={<TrendingUpIcon sx={{ color: '#4caf50' }} />}
    >
      {topPlayers.length > 0 ? (
        <TableContainer>
          <Table size="small" sx={{ '& td': { padding: '8px' }, '& th': { padding: '8px' } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600, padding: '8px' }}>Player</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, padding: '8px' }}>
                  Points
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, padding: '8px' }}>
                  Form
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, padding: '8px' }}>
                  Price
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topPlayers.map((player, idx) => (
                <TableRow
                  key={player.id}
                  onClick={() => onPlayerClick?.(player.id as unknown as number)}
                  sx={{
                    cursor: onPlayerClick ? 'pointer' : 'default',
                    height: 44,
                    '&:hover': { backgroundColor: '#f9f9f9' },
                  }}
                >
                  {' '}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 600, minWidth: 20 }}>{idx + 1}</Typography>
                      <Avatar
                        src={getPlayerImageUrl(player.id)}
                        sx={{ width: 32, height: 32 }}
                        alt={player.name}
                      >
                        {player.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {player.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" noWrap>
                          {player.club}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: 700, color: '#4caf50' }}>
                      {player.totalPoints}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color:
                          player.form && parseFloat(player.form) > 5
                            ? '#4caf50'
                            : parseFloat(player.form || '0') > 3
                              ? '#ff9800'
                              : '#f44336',
                      }}
                    >
                      {player.form}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.price}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography color="textSecondary" sx={{ textAlign: 'center', padding: 2 }}>
          No players data available
        </Typography>
      )}
    </DashboardWidget>
  );
};
