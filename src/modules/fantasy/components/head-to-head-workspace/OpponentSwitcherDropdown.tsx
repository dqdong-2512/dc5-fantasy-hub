/**
 * Opponent Switcher Dropdown
 * Allows quick switching between opponents in the same league
 */

import React from 'react';
import { Box, Typography, Select, MenuItem } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ThemeTokens } from '@shared/theme/tokens';

export interface LeagueStandingEntry {
  managerId: number;
  managerName: string;
  currentRank: number;
}

export interface OpponentSwitcherDropdownProps {
  leagueId: number;
  currentManagerId: number;
  selectedOpponentId: number;
  standings: LeagueStandingEntry[];
}

export const OpponentSwitcherDropdown: React.FC<OpponentSwitcherDropdownProps> = ({
  leagueId,
  currentManagerId,
  selectedOpponentId,
  standings,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const opponents = standings.filter((e) => e.managerId !== currentManagerId);

  const handleOpponentChange = (newOpponentId: number): void => {
    const gw = searchParams.get('gw');
    const url = `/premier-league/gameweek/league/${leagueId}/managers/${newOpponentId}${
      gw ? `?gw=${gw}` : ''
    }`;
    navigate(url);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.sm }}>
      <Typography
        sx={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#666',
          whiteSpace: 'nowrap',
        }}
      >
        Compare With
      </Typography>
      <Select
        value={selectedOpponentId}
        onChange={(e) => handleOpponentChange(Number(e.target.value))}
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
        {opponents.map((opponent) => (
          <MenuItem key={opponent.managerId} value={opponent.managerId}>
            {opponent.managerName} (#{opponent.currentRank})
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};


