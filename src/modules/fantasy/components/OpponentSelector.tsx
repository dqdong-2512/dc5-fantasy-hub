/**
 * Opponent Selector Component
 * Dropdown to select an opponent manager for comparison
 * Filters out current manager
 */

import React, { useCallback, useMemo } from 'react';
import { Box, Select, MenuItem, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { LeagueStandingEntry } from '../types';

export interface OpponentSelectorProps {
  standings: LeagueStandingEntry[];
  currentManagerId: number;
  leagueId: number;
}

export const OpponentSelector: React.FC<OpponentSelectorProps> = ({
  standings,
  currentManagerId,
  leagueId,
}) => {
  const navigate = useNavigate();

  const opponents = useMemo(
    () => standings.filter((entry) => entry.managerId !== currentManagerId),
    [standings, currentManagerId]
  );

  const handleOpponentChange = useCallback(
    (managerId: number): void => {
      navigate(`/premier-league/fantasy-game/leagues/${leagueId}/managers/${managerId}`);
    },
    [navigate, leagueId]
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          fontSize: '0.875rem',
          color: '#666',
        }}
      >
        Compare With
      </Typography>
      <Select
        value={''}
        onChange={(e) => handleOpponentChange(Number(e.target.value))}
        displayEmpty
        sx={{
          height: '40px',
          minWidth: { xs: '100%', sm: '320px' },
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
        <MenuItem value="">
          <em>Select a manager</em>
        </MenuItem>
        {opponents.map((entry) => (
          <MenuItem key={entry.managerId} value={entry.managerId}>
            {entry.teamName} — {entry.managerName} (#{entry.currentRank})
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
