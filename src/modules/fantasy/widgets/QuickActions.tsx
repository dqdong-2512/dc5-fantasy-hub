/**
 * Quick Actions Widget
 * Navigation shortcuts for Fantasy Game features
 */

import React from 'react';
import { Box, Button, Stack, Typography, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CompareIcon from '@mui/icons-material/Compare';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HistoryIcon from '@mui/icons-material/History';

export interface QuickActionsProps {
  onViewTeam?: () => void;
  onViewGameweek?: () => void;
  onViewLeagues?: () => void;
  onViewTransfers?: () => void;
  onViewHistory?: () => void;
}

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onClick,
  disabled,
  comingSoon,
}) => (
  <Button
    variant="outlined"
    size="small"
    onClick={onClick}
    disabled={disabled || comingSoon}
    startIcon={icon}
    sx={{
      textTransform: 'none',
      justifyContent: 'flex-start',
      position: 'relative',
      '&:disabled': {
        borderColor: '#ccc',
        color: '#999',
      },
    }}
  >
    {label}
    {comingSoon && (
      <Chip
        label="Coming Soon"
        size="small"
        variant="outlined"
        sx={{
          height: 20,
          fontSize: '0.65rem',
          marginLeft: 'auto',
          borderColor: '#ffa500',
          backgroundColor: 'rgba(255, 165, 0, 0.1)',
          color: '#ffa500',
        }}
      />
    )}
  </Button>
);

export const QuickActions: React.FC<QuickActionsProps> = ({
  onViewTeam,
  onViewGameweek,
  onViewLeagues,
  onViewTransfers,
  onViewHistory,
}) => {
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          marginBottom: 2,
          fontSize: '1rem',
        }}
      >
        Quick Actions
      </Typography>

      <Stack spacing={1.5}>
        <ActionButton
          label="My Team"
          icon={<PersonIcon fontSize="small" />}
          onClick={onViewTeam}
          comingSoon
        />
        <ActionButton
          label="Gameweek"
          icon={<EmojiEventsIcon fontSize="small" />}
          onClick={onViewGameweek}
          comingSoon
        />
        <ActionButton
          label="My Leagues"
          icon={<CompareIcon fontSize="small" />}
          onClick={onViewLeagues}
          comingSoon
        />
        <ActionButton
          label="Transfers"
          icon={<SwapHorizIcon fontSize="small" />}
          onClick={onViewTransfers}
          comingSoon
        />
        <ActionButton
          label="Points History"
          icon={<HistoryIcon fontSize="small" />}
          onClick={onViewHistory}
          comingSoon
        />
      </Stack>

      <Typography
        variant="caption"
        color="textSecondary"
        sx={{
          display: 'block',
          marginTop: 2,
          fontStyle: 'italic',
        }}
      >
        These features will be available in upcoming releases.
      </Typography>
    </Box>
  );
};
