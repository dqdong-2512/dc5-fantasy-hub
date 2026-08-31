/**
 * Quick Actions Widget
 * Navigation shortcuts for Fantasy Game features
 */

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
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
  description: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  icon,
  onClick,
  description,
}) => (
  <Button
    variant="text"
    onClick={onClick}
    disabled={!onClick}
    startIcon={icon}
    sx={{
      textTransform: 'none',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      textAlign: 'left',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      p: 1.5,
      color: '#0f172a',
      backgroundColor: '#fff',
      '&:hover': { borderColor: '#7c3aed', backgroundColor: '#faf5ff' },
      '& .MuiButton-startIcon': { mt: 0.15, color: '#7c3aed' },
    }}
  >
    <Box>
      <Typography sx={{ fontWeight: 800, fontSize: '0.88rem' }}>{label}</Typography>
      <Typography variant="caption" color="text.secondary">{description}</Typography>
    </Box>
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

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 1.5 }}>
        <ActionButton
          label="My Team"
          icon={<PersonIcon fontSize="small" />}
          onClick={onViewTeam}
          description="Review your starting XI"
        />
        <ActionButton
          label="Gameweek"
          icon={<EmojiEventsIcon fontSize="small" />}
          onClick={onViewGameweek}
          description="Open the live gameweek"
        />
        <ActionButton
          label="My Leagues"
          icon={<CompareIcon fontSize="small" />}
          onClick={onViewLeagues}
          description="Standings and rivals"
        />
        <ActionButton
          label="Transfers"
          icon={<SwapHorizIcon fontSize="small" />}
          onClick={onViewTransfers}
          description="Plan your next moves"
        />
        <ActionButton
          label="Points History"
          icon={<HistoryIcon fontSize="small" />}
          onClick={onViewHistory}
          description="Review past scores"
        />
      </Box>
    </Box>
  );
};
