/**
 * League Switcher Component
 * Dropdown to switch between joined leagues
 * Navigates URL without page reload
 */

import React, { useCallback } from 'react';
import { Box, Select, MenuItem, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { FantasyLeagueFixture } from '../types';

export interface LeagueSwitcherProps {
  leagues: FantasyLeagueFixture[];
  selectedLeagueId: number | null;
}

export const LeagueSwitcher: React.FC<LeagueSwitcherProps> = ({ leagues, selectedLeagueId }) => {
  const navigate = useNavigate();

  const handleLeagueChange = useCallback(
    (leagueId: number): void => {
      navigate(`/premier-league/fantasy-game/leagues/${leagueId}`);
    },
    [navigate]
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          fontSize: '0.875rem',
          color: '#666',
        }}
      >
        League
      </Typography>
      <Select
        value={selectedLeagueId || ''}
        onChange={(e) => handleLeagueChange(Number(e.target.value))}
        sx={{
          height: '40px',
          minWidth: { xs: '100%', sm: '280px' },
          fontSize: '0.95rem',
          fontWeight: 600,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e0e0e0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2',
          },
        }}
      >
        {leagues.map((league) => (
          <MenuItem key={league.id} value={league.id}>
            {league.name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
