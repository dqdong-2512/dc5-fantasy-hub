/**
 * Manager Head-to-Head Gameweek Selector
 * Allows selection of gameweek for comparison
 */

import React, { useMemo } from 'react';
import { Box, Select, MenuItem, Chip } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { ManagerHeadToHeadService } from '../../services/ManagerHeadToHeadService';

export interface ManagerHeadToHeadGameweekSelectorProps {
  selectedGameweek: number;
  dataStatus: 'live' | 'final' | 'snapshot' | 'upcoming';
  onGameweekChange?: (gw: number) => void;
}

export const ManagerHeadToHeadGameweekSelector: React.FC<
  ManagerHeadToHeadGameweekSelectorProps
> = ({ selectedGameweek, dataStatus, onGameweekChange }) => {
  const service = useMemo(() => new ManagerHeadToHeadService(), []);
  const availableGameweeks = service.getAvailableGameweeks();

  const handleGameweekChange = (gw: number): void => {
    onGameweekChange?.(gw);
  };

  const statusColor = ManagerHeadToHeadService.getStatusColor(dataStatus);
  const statusLabel = ManagerHeadToHeadService.formatStatus(dataStatus);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.sm }}>
      <Select
        value={selectedGameweek}
        onChange={(e) => handleGameweekChange(Number(e.target.value))}
        sx={{
          fontSize: '0.85rem',
          '& .MuiOutlinedInput-root': {
            height: '32px',
          },
          '& .MuiOutlinedInput-input': {
            padding: '6px 12px',
          },
        }}
      >
        {availableGameweeks.map((gw) => (
          <MenuItem key={gw} value={gw}>
            GW {gw}
          </MenuItem>
        ))}
      </Select>

      <Chip
        label={statusLabel}
        size="small"
        sx={{
          height: '26px',
          fontSize: '0.75rem',
          fontWeight: 700,
          backgroundColor: statusColor,
          color: '#fff',
        }}
      />
    </Box>
  );
};
