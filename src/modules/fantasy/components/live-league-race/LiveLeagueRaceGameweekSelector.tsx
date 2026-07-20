/**
 * Live League Race Gameweek Selector
 * Selector for choosing gameweek within the league race context
 * Preserves league workspace by updating query parameter only
 * Uses actual gameweek data from BootstrapRepository
 */

import React, { useMemo } from 'react';
import { Box, Select, MenuItem, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { BootstrapRepository } from '@repositories/bootstrap';

export interface LiveLeagueRaceGameweekSelectorProps {
  selectedGameweek: number;
  dataStatus: 'live' | 'final' | 'snapshot' | 'upcoming';
}

export const LiveLeagueRaceGameweekSelector: React.FC<LiveLeagueRaceGameweekSelectorProps> = ({
  selectedGameweek,
  dataStatus,
}) => {
  const [, setSearchParams] = useSearchParams();

  // Get available gameweeks from canonical repository (not hardcoded)
  const availableGameweeks = useMemo(() => {
    try {
      const bootstrapRepo = new BootstrapRepository();
      const bootstrap = bootstrapRepo.getBootstrap();

      // Get most recent gameweeks (last 5 or all if fewer than 5)
      const allGameweeks = bootstrap.gameweeks.map((gw) => gw.id).sort((a, b) => b - a);
      return allGameweeks.slice(0, Math.max(5, allGameweeks.length));
    } catch {
      return [];
    }
  }, []);

  const handleGameweekChange = (event: any): void => {
    const newGameweekId = event.target.value as number;
    setSearchParams({ gw: String(newGameweekId) });
  };

  // Status helpers (moved from LeagueRaceService since it's service-specific)
  const formatStatus = (status: 'live' | 'final' | 'snapshot' | 'upcoming'): string => {
    switch (status) {
      case 'live':
        return 'Live';
      case 'final':
        return 'Final';
      case 'snapshot':
        return 'Snapshot';
      case 'upcoming':
        return 'Upcoming';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: 'live' | 'final' | 'snapshot' | 'upcoming'): string => {
    switch (status) {
      case 'live':
        return '#ff6b6b';
      case 'final':
        return '#4caf50';
      case 'snapshot':
        return '#2196f3';
      case 'upcoming':
        return '#ff9800';
      default:
        return '#999';
    }
  };

  const statusDisplay = formatStatus(dataStatus);
  const statusColor = getStatusColor(dataStatus);

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
        {availableGameweeks.length === 0 ? (
          <MenuItem disabled>No gameweeks available</MenuItem>
        ) : (
          availableGameweeks.map((gwId) => (
            <MenuItem key={gwId} value={gwId}>
              GW {gwId}
            </MenuItem>
          ))
        )}
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
