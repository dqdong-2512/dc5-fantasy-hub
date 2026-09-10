/**
 * Quick Actions Widget
 * Navigation shortcuts for Fantasy Game features
 */

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

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
  onViewTransfers,
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

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
        <ActionButton
          label="Squad & League"
          icon={<PersonIcon fontSize="small" />}
          onClick={onViewTeam}
          description="Compare squads and live league rank"
        />
        <ActionButton
          label="Fixtures"
          icon={<EmojiEventsIcon fontSize="small" />}
          onClick={onViewGameweek}
          description="Results, line-ups and match stats"
        />
        <ActionButton
          label="Transfers"
          icon={<SwapHorizIcon fontSize="small" />}
          onClick={onViewTransfers}
          description="Plan your next moves"
        />
      </Box>
    </Box>
  );
};
