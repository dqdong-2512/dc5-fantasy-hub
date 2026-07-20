/**
 * Next Actions Widget
 * Displays actionable items derived from application state
 * Sorted by priority, with direct navigation to each feature
 */

import React from 'react';
import { Box, Card, Stack, Typography, Button, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { ThemeTokens } from '@shared/theme/tokens';
import type { NextActionData } from '../services/fantasy-dashboard.service';

interface NextActionsProps {
  actions: NextActionData[];
  onTransferClick: () => void;
  onGameweekClick: () => void;
  onSeasonClick: () => void;
  onGameweekCenterClick: () => void;
}

interface ActionItemProps {
  action: NextActionData;
  onNavigate: () => void;
}

const ActionItem: React.FC<ActionItemProps> = ({ action, onNavigate }) => {
  const priorityColors: Record<
    'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    { bg: string; text: string }
  > = {
    CRITICAL: { bg: '#ef5350', text: '#fff' },
    HIGH: { bg: '#ff9800', text: '#fff' },
    MEDIUM: { bg: '#fbc02d', text: '#000' },
    LOW: { bg: '#90a4ae', text: '#fff' },
  };

  const colors = priorityColors[action.priority];

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 2,
        paddingY: ThemeTokens.spacing.sm,
        borderBottom: '1px solid #e0e0e0',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {action.title}
          </Typography>
          <Chip
            label={action.priority}
            size="small"
            sx={{
              backgroundColor: colors.bg,
              color: colors.text,
              height: 20,
              fontSize: '0.65rem',
              fontWeight: 600,
            }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          {action.description}
        </Typography>
      </Box>
      <Button
        size="small"
        variant="contained"
        onClick={onNavigate}
        sx={{
          textTransform: 'none',
          fontSize: '0.75rem',
          padding: '4px 12px',
          minWidth: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        Go
      </Button>
    </Box>
  );
};

export const NextActionsPanel: React.FC<NextActionsProps> = ({
  actions,
  onTransferClick,
  onGameweekClick,
  onSeasonClick,
  onGameweekCenterClick,
}) => {
  if (actions.length === 0) {
    return (
      <Card
        sx={{
          p: ThemeTokens.spacing.md,
          backgroundColor: '#f5f5f5',
          border: '1px solid #e0e0e0',
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 1 }}>
          <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 32 }} />
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4caf50' }}>
          All Set
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', marginTop: 0.5 }}
        >
          Your plans are up to date. Good luck!
        </Typography>
      </Card>
    );
  }

  const handleAction = (action: NextActionData) => {
    switch (action.featurePath) {
      case 'transfer':
        onTransferClick();
        break;
      case 'gameweek':
        onGameweekClick();
        break;
      case 'season':
        onSeasonClick();
        break;
      case 'gameweek-center':
        onGameweekCenterClick();
        break;
    }
  };

  return (
    <Card
      sx={{
        p: ThemeTokens.spacing.md,
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
      }}
    >
      {/* Header */}
      <Box sx={{ marginBottom: ThemeTokens.spacing.md }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            paddingBottom: ThemeTokens.spacing.sm,
            borderBottom: '2px solid #7c3aed',
          }}
        >
          Next Actions
        </Typography>
      </Box>

      {/* Action Items */}
      <Stack spacing={0}>
        {actions.map((action) => (
          <ActionItem key={action.id} action={action} onNavigate={() => handleAction(action)} />
        ))}
      </Stack>
    </Card>
  );
};
