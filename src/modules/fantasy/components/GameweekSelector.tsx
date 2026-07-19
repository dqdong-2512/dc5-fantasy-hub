/**
 * Gameweek Selector Component
 * Dropdown to switch between available gameweeks
 * URL is source of truth for selected gameweek
 */

import React, { useMemo } from 'react';
import { Box, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BootstrapRepository } from '@repositories/bootstrap';

export interface GameweekSelectorProps {
  currentGameweekId: number;
}

export const GameweekSelector: React.FC<GameweekSelectorProps> = ({ currentGameweekId }) => {
  const navigate = useNavigate();

  // Get all available gameweeks from bootstrap data
  const availableGameweeks = useMemo(() => {
    try {
      const repo = new BootstrapRepository();
      const bootstrap = repo.getBootstrap();
      return bootstrap.gameweeks.map((gw) => gw.id).sort((a, b) => b - a); // Sort descending (latest first)
    } catch {
      return [];
    }
  }, []);

  const handleGameweekChange = (event: any): void => {
    const newGameweekId = event.target.value as number;
    navigate(`/premier-league/fantasy-game/gameweeks/${newGameweekId}`, { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Select
        value={currentGameweekId}
        onChange={handleGameweekChange}
        sx={{
          minWidth: '120px',
          height: '40px',
          fontSize: '0.95rem',
          fontWeight: 600,
        }}
      >
        {availableGameweeks.map((gwId) => (
          <MenuItem key={gwId} value={gwId}>
            GW {gwId}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
