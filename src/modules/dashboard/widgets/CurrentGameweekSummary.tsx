/**
 * Current Gameweek Summary Widget
 * Displays current gameweek or pre-season status
 * For pre-season: shows next gameweek and season start info
 */

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { DashboardWidget } from '../components/DashboardWidget';
import { BootstrapRepository } from '@repositories/bootstrap';
import { formatDeadline } from '@shared/presentation';

/**
 * Detect season state
 */
function detectSeasonState(gameweeks: any[]): 'pre-season' | 'active' | 'completed' {
  if (!gameweeks || gameweeks.length === 0) {
    return 'pre-season';
  }

  // Find first unfinished gameweek
  const unfinishedGw = gameweeks.find((gw) => !gw.finished);

  if (!unfinishedGw) {
    // All finished = completed season
    return 'completed';
  }

  // Has unfinished gameweek = active season
  return 'active';
}

/**
 * Get first gameweek for pre-season display
 */
function getNextGameweek(gameweeks: any[]) {
  if (!gameweeks || gameweeks.length === 0) return null;
  return gameweeks[0]; // First gameweek is the next one in pre-season
}

/**
 * Current Gameweek Summary Widget
 */
export const CurrentGameweekSummary: React.FC = () => {
  let gameweekData;
  try {
    const repo = new BootstrapRepository();
    const bootstrap = repo.getBootstrap();
    const seasonState = detectSeasonState(bootstrap.gameweeks);
    const current = repo.getCurrentGameweek();

    if (seasonState === 'pre-season') {
      const nextGw = getNextGameweek(bootstrap.gameweeks);
      gameweekData = {
        seasonState: 'pre-season' as const,
        gameweek: nextGw?.id || 1,
        deadline: nextGw?.deadline || null,
        deadlineFormatted: formatDeadline(nextGw?.deadline || ''),
        statusLabel: 'Upcoming',
      };
    } else {
      gameweekData = {
        seasonState: seasonState as 'active' | 'completed',
        gameweek: current?.id || 0,
        deadline: current?.deadline || null,
        deadlineFormatted: formatDeadline(current?.deadline || ''),
        statusLabel: current?.id ? 'Active' : 'Complete',
      };
    }
  } catch {
    gameweekData = {
      seasonState: 'pre-season' as const,
      gameweek: 1,
      deadline: null,
      deadlineFormatted: 'TBA',
      statusLabel: 'Upcoming',
    };
  }

  const title = gameweekData.seasonState === 'pre-season' ? 'Next Gameweek' : 'Current Gameweek';
  const titleColor = gameweekData.seasonState === 'pre-season' ? '#7c3aed' : '#1976d2';
  const numberColor = gameweekData.seasonState === 'pre-season' ? '#7c3aed' : '#1976d2';

  return (
    <DashboardWidget title={title} icon={<EventIcon sx={{ color: titleColor }} />}>
      <Stack spacing={ThemeTokens.spacing.md}>
        {/* Gameweek Number - Compact */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 1,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: numberColor, lineHeight: 1 }}>
            {gameweekData.gameweek}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600 }}>
            {gameweekData.statusLabel}
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
              {gameweekData.seasonState === 'pre-season' ? 'Season Starts' : 'Deadline'}
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
