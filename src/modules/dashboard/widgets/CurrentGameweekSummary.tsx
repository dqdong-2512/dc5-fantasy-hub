/**
 * Current Gameweek Summary Widget
 * Displays current gameweek statistics
 */

import React, { useMemo } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { DashboardWidget } from '../components/DashboardWidget';
import { BootstrapRepository } from '@repositories/bootstrap';
import { formatDeadline } from '@shared/presentation';
import { ThemeTokens } from '@shared/theme/tokens';

/**
 * Current Gameweek Summary Widget
 */
export const CurrentGameweekSummary: React.FC = () => {
  const gameweekData = useMemo(() => {
    try {
      const repo = new BootstrapRepository();
      const current = repo.getCurrentGameweek();
      return {
        gameweek: current?.id || 0,
        deadline: current?.deadline || null,
        deadlineFormatted: formatDeadline(current?.deadline || ''),
      };
    } catch (error) {
      return { gameweek: 0, deadline: null, fixtures: 0, deadlineFormatted: 'N/A' };
    }
  }, []);

  const timeRemaining = useMemo(() => {
    if (!gameweekData.deadline) return 'N/A';
    const now = new Date();
    const deadline = new Date(gameweekData.deadline);
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) return 'Deadline passed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  }, [gameweekData.deadline]);

  return (
    <DashboardWidget
      title="Current Gameweek"
      icon={<EventIcon sx={{ color: '#1976d2' }} />}
      subtitle={`Gameweek ${gameweekData.gameweek}`}
    >
      <Stack spacing={ThemeTokens.spacing.md}>
        {/* Gameweek Number */}
        <Box
          sx={{
            padding: ThemeTokens.spacing.md,
            backgroundColor: '#e3f2fd',
            borderRadius: 1,
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2' }}>
            {gameweekData.gameweek}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Current Gameweek
          </Typography>
        </Box>

        {/* Details Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {/* Deadline */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <AccessTimeIcon sx={{ color: '#ff9800', marginTop: 0.5, fontSize: 20 }} />
              <Box>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block', marginBottom: 0.5 }}
                >
                  Deadline
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {gameweekData.deadlineFormatted}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {timeRemaining}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Stack>
    </DashboardWidget>
  );
};
