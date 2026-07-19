/**
 * Live League Race Gameweek Selector
 * Selector for choosing gameweek within the league race context
 * Preserves league workspace by updating query parameter only
 */

import React, { useMemo } from 'react';
import { Box, Select, MenuItem, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { LeagueRaceService } from '../../services/LeagueRaceService';

export interface LiveLeagueRaceGameweekSelectorProps {
  selectedGameweek: number;
  dataStatus: 'live' | 'final' | 'snapshot' | 'upcoming';
}

export const LiveLeagueRaceGameweekSelector: React.FC<LiveLeagueRaceGameweekSelectorProps> = ({
  selectedGameweek,
  dataStatus,
}) => {
  const [, setSearchParams] = useSearchParams();

  // Get available gameweeks with race data
  const availableGameweeks = useMemo(() => {
    const service = new LeagueRaceService();
    return service.getAvailableGameweeks([37, 38]).sort((a, b) => b - a);
  }, []);

  const handleGameweekChange = (event: any): void => {
    const newGameweekId = event.target.value as number;
    setSearchParams({ gw: String(newGameweekId) });
  };

  const statusDisplay = LeagueRaceService.formatStatus(dataStatus);
  const statusColor = LeagueRaceService.getStatusColor(dataStatus);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Select
        value={selectedGameweek}
        onChange={handleGameweekChange}
        sx={{
          minWidth: '100px',
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

      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          backgroundColor: statusColor,
          color: '#fff',
          borderRadius: '4px',
          fontWeight: 700,
          fontSize: '0.8rem',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#fff' }}>
          {statusDisplay}
        </Typography>
      </Box>
    </Box>
  );
};
