/**
 * Top Clubs Widget
 * Displays clubs ordered by strength
 */

import React, { useMemo } from 'react';
import { Box, Typography, Stack, Avatar, LinearProgress, Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { DashboardWidget } from '../components/DashboardWidget';
import { TeamRepository } from '@repositories/teams';
import { getTeamBadgeUrl } from '@shared/assets';
import { ThemeTokens } from '@shared/theme/tokens';

/**
 * Top Clubs Widget
 * Shows clubs ordered by strength
 */
export const TopClubs: React.FC = () => {
  const topClubs = useMemo(() => {
    try {
      const repo = new TeamRepository();
      const all = repo.getAll();
      return all.sort((a, b) => (b.strength || 0) - (a.strength || 0)).slice(0, 8);
    } catch (error) {
      console.error('Error loading teams:', error);
      return [];
    }
  }, []);

  const maxStrength = useMemo(() => {
    return topClubs.length > 0 ? Math.max(...topClubs.map((t) => t.strength || 0)) : 100;
  }, [topClubs]);

  return (
    <DashboardWidget
      title="Top Clubs"
      subtitle="By squad strength"
      icon={<EmojiEventsIcon sx={{ color: '#fbc02d' }} />}
    >
      {topClubs.length > 0 ? (
        <Stack spacing={ThemeTokens.spacing.md}>
          {topClubs.map((club, idx) => (
            <Box key={club.id}>
              {/* Club Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 0.5 }}>
                <Typography
                  sx={{ fontWeight: 700, minWidth: 24, color: '#fbc02d', fontSize: '1.1rem' }}
                >
                  {idx + 1}
                </Typography>
                <Avatar
                  src={getTeamBadgeUrl(club.code || club.id)}
                  sx={{ width: 36, height: 36 }}
                  alt={club.name}
                >
                  {club.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {club.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Strength: {club.strength}
                  </Typography>
                </Box>
                <Chip
                  label={`${Math.round((club.strength || 0) / 10)}`}
                  size="small"
                  sx={{
                    backgroundColor: '#fbc02d',
                    color: '#000',
                    fontWeight: 600,
                    minWidth: 50,
                    textAlign: 'center',
                  }}
                />
              </Box>

              {/* Strength Progress */}
              <LinearProgress
                variant="determinate"
                value={((club.strength || 0) / maxStrength) * 100}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  backgroundColor: '#f0f0f0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#fbc02d',
                  },
                }}
              />
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography color="textSecondary" sx={{ textAlign: 'center', padding: 2 }}>
          No teams data available
        </Typography>
      )}
    </DashboardWidget>
  );
};
