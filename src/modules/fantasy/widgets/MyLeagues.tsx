/**
 * My Leagues Widget
 * Displays personal league standings
 */

import React from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { DashboardWidget } from '../../dashboard/components';
import type { FantasyLeagueFixture } from '../types';

export interface MyLeaguesProps {
  leagues: FantasyLeagueFixture[];
  onLeagueClick?: (leagueId: number) => void;
}

export const MyLeagues: React.FC<MyLeaguesProps> = ({ leagues, onLeagueClick }) => {
  const getRankMovement = (current: number, previous: number): { icon: string; color: string } => {
    if (current < previous) return { icon: '↑', color: '#4caf50' };
    if (current > previous) return { icon: '↓', color: '#f44336' };
    return { icon: '→', color: '#757575' };
  };

  return (
    <DashboardWidget
      title="My Leagues"
      subtitle={`${leagues.length} league${leagues.length !== 1 ? 's' : ''}`}
      icon={<EmojiEventsIcon />}
    >
      {leagues.length > 0 ? (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table
            size="small"
            sx={{ '& td': { padding: '10px 8px' }, '& th': { padding: '10px 8px' } }}
          >
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>League</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, width: 60 }}>
                  Rank
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, width: 70 }}>
                  Movement
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, width: 80 }}>
                  Members
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leagues.map((league) => {
                const movement = getRankMovement(league.rank, league.previousRank);
                return (
                  <TableRow
                    key={league.id}
                    onClick={() => onLeagueClick?.(league.id)}
                    sx={{
                      cursor: onLeagueClick ? 'pointer' : 'default',
                      '&:hover': { backgroundColor: '#f9f9f9' },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{league.name}</TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        #{league.rank}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: movement.color,
                        }}
                      >
                        {movement.icon} {Math.abs(league.rank - league.previousRank)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{league.members}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography color="textSecondary" sx={{ textAlign: 'center', padding: 2 }}>
          No leagues joined yet
        </Typography>
      )}
    </DashboardWidget>
  );
};
