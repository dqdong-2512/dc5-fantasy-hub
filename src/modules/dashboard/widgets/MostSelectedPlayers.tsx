/**
 * Most Selected Players Widget
 * Displays most owned/selected players
 */

import React, { useMemo } from 'react';
import { Box, Typography, Stack, Avatar, LinearProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { DashboardWidget } from '../components/DashboardWidget';
import { PlayerRepository } from '@repositories/players';
import { PlayerPresenter } from '@shared/presentation';
import { getPlayerImageUrl } from '@shared/assets';
import { ThemeTokens } from '@shared/theme/tokens';

/**
 * Most Selected Players Widget
 * Shows most owned players
 */
export const MostSelectedPlayers: React.FC = () => {
  const mostOwned = useMemo(() => {
    try {
      const repo = new PlayerRepository();
      const all = repo.getAll();
      const sorted = all
        .filter((p) => p.ownership && p.ownership > 0)
        .sort((a, b) => (b.ownership || 0) - (a.ownership || 0))
        .slice(0, 5);
      return PlayerPresenter.toListPresentations(sorted);
    } catch (error) {
      console.error('Error loading most selected players:', error);
      return [];
    }
  }, []);

  const maxOwnership = useMemo(() => {
    return mostOwned.length > 0
      ? Math.max(...mostOwned.map((p) => parseFloat(p.ownership || '0')))
      : 100;
  }, [mostOwned]);

  return (
    <DashboardWidget
      title="Most Selected Players"
      subtitle="Top 5 by ownership"
      icon={<PeopleIcon sx={{ color: '#9c27b0' }} />}
    >
      {mostOwned.length > 0 ? (
        <Stack spacing={ThemeTokens.spacing.sm}>
          {mostOwned.map((player, idx) => (
            <Box key={player.id}>
              {/* Player Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 0.5 }}>
                <Typography sx={{ fontWeight: 600, minWidth: 20, color: '#9c27b0' }}>
                  #{idx + 1}
                </Typography>
                <Avatar
                  src={getPlayerImageUrl(player.id)}
                  sx={{ width: 36, height: 36 }}
                  alt={player.name}
                >
                  {player.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {player.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" noWrap>
                    {player.club}
                  </Typography>
                </Box>
                <Typography
                  sx={{ fontWeight: 700, color: '#9c27b0', minWidth: 50, textAlign: 'right' }}
                >
                  {player.ownership}
                </Typography>
              </Box>

              {/* Ownership Progress Bar */}
              <LinearProgress
                variant="determinate"
                value={(parseFloat(player.ownership || '0') / maxOwnership) * 100}
                sx={{
                  height: 6,
                  borderRadius: 1,
                  backgroundColor: '#f0f0f0',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #9c27b0 0%, #7b1fa2 100%)',
                  },
                }}
              />
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography color="textSecondary" sx={{ textAlign: 'center', padding: 2 }}>
          No players data available
        </Typography>
      )}
    </DashboardWidget>
  );
};
