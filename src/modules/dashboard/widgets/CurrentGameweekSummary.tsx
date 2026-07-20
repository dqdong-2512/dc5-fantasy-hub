/**
 * Current Gameweek Summary Widget
 * Displays current gameweek statistics
 */

import React, { useMemo } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { DashboardWidget } from '../components/DashboardWidget';
import { BootstrapRepository } from '@repositories/bootstrap';
import { formatDeadline } from '@shared/presentation';

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

  return (
    <DashboardWidget title="Current Gameweek" icon={<EventIcon sx={{ color: '#1976d2' }} />}>
      <Stack spacing={ThemeTokens.spacing.md}>
        {/* Gameweek Number - Compact */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 1,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2', lineHeight: 1 }}>
            {gameweekData.gameweek}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
            {gameweekData.gameweek > 0 ? 'Active' : 'Complete'}
          </Typography>
        </Box>

        {/* Deadline Info */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <AccessTimeIcon sx={{ color: '#ff9800', fontSize: 16, marginTop: 0.25, flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginBottom: 0.25 }}
            >
              Deadline
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {gameweekData.deadlineFormatted}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </DashboardWidget>
  );
};
