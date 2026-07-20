/**
 * Gameweek Context Widget
 * Displays useful gameweek context: deadline, fixture outlook, recent performance
 */

import React from 'react';
import { Box, Card, Stack, Typography, Chip, Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { ThemeTokens } from '@shared/theme/tokens';
import type { GameweekOverviewData } from '../services/fantasy-dashboard.service';

interface GameweekContextProps {
  gameweek: GameweekOverviewData;
  onViewGameweek: () => void;
}

const formatDeadline = (deadlineStr: string | undefined): string => {
  if (!deadlineStr) return 'Deadline unavailable';

  try {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();

    if (diffMs < 0) return 'Deadline passed';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'} remaining`;
    }

    return `${hours} hour${hours === 1 ? '' : 's'} remaining`;
  } catch {
    return 'Deadline unavailable';
  }
};

export const GameweekContext: React.FC<GameweekContextProps> = ({
  gameweek,
  onViewGameweek,
}) => {
  const statusColors: Record<'UPCOMING' | 'IN_PROGRESS' | 'FINISHED', { label: string; bg: string; text: string }> = {
    UPCOMING: { label: 'Upcoming', bg: '#e3f2fd', text: '#1976d2' },
    IN_PROGRESS: { label: 'In Progress', bg: '#fff3e0', text: '#f57c00' },
    FINISHED: { label: 'Finished', bg: '#f3e5f5', text: '#7b1fa2' },
  };

  const statusConfig = statusColors[gameweek.status];
  const deadlineText = gameweek.nextDeadline ? formatDeadline(gameweek.nextDeadline) : undefined;

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
          Gameweek Context
        </Typography>
      </Box>

      <Stack spacing={2}>
        {/* Current Gameweek Status */}
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            CURRENT GAMEWEEK
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginTop: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              GW{gameweek.currentGameweekId}
            </Typography>
            <Chip
              label={statusConfig.label}
              size="small"
              sx={{
                backgroundColor: statusConfig.bg,
                color: statusConfig.text,
                fontWeight: 600,
                height: 24,
                fontSize: '0.75rem',
              }}
            />
          </Box>
        </Box>

        {/* Deadline */}
        {deadlineText && (
          <Box
            sx={{
              padding: ThemeTokens.spacing.sm,
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <AccessTimeIcon sx={{ fontSize: 20, color: '#ff9800' }} />
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                NEXT DEADLINE
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {deadlineText}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Next Gameweek */}
        {gameweek.nextGameweekId && (
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              NEXT GAMEWEEK
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              GW{gameweek.nextGameweekId}
            </Typography>
          </Box>
        )}

        {/* View Gameweek Action */}
        <Button
          variant="contained"
          size="small"
          onClick={onViewGameweek}
          sx={{
            textTransform: 'none',
            backgroundColor: '#2196f3',
            color: '#fff',
            '&:hover': { backgroundColor: '#1976d2' },
            marginTop: ThemeTokens.spacing.sm,
          }}
        >
          View Gameweek Center
        </Button>
      </Stack>
    </Card>
  );
};
