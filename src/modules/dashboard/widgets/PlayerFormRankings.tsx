/**
 * Player Form Rankings Widget
 * Displays top players by current form
 */

import React, { useMemo } from 'react';
import { Box, Typography, Stack, Avatar, Chip, LinearProgress } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { DashboardWidget } from '../components/DashboardWidget';
import { PlayerRepository } from '@repositories/players';
import { PlayerPresenter } from '@shared/presentation';
import { getPlayerImageUrl } from '@shared/assets';
import { ThemeTokens } from '@shared/theme/tokens';

/**
 * Player Form Rankings Widget
 * Shows top players by current form
 */
export const PlayerFormRankings: React.FC = () => {
  const topForm = useMemo(() => {
    try {
      const repo = new PlayerRepository();
      const all = repo.getAll();
      const sorted = all
        .filter((p) => p.form > 0)
        .sort((a, b) => b.form - a.form)
        .slice(0, 8);
      return PlayerPresenter.toListPresentations(sorted);
    } catch (error) {
      console.error('Error loading form rankings:', error);
      return [];
    }
  }, []);

  const getFormColor = (form: string): string => {
    const formNum = parseFloat(form);
    if (formNum > 7) return '#e53935'; // Red - Hot form
    if (formNum > 5) return '#ff9800'; // Orange - Good form
    if (formNum > 3) return '#4caf50'; // Green - Decent form
    return '#9e9e9e'; // Gray - Low form
  };

  const getFormLabel = (form: string): string => {
    const formNum = parseFloat(form);
    if (formNum > 7) return 'Hot';
    if (formNum > 5) return 'Good';
    if (formNum > 3) return 'OK';
    return 'Cold';
  };

  if (topForm.length === 0) {
    return null;
  }

  return (
    <DashboardWidget
      title="Form Rankings"
      subtitle="Top 8 players by form"
      icon={<LocalFireDepartmentIcon sx={{ color: '#e53935' }} />}
    >
      <Stack spacing={ThemeTokens.spacing.md}>
        {topForm.map((player, idx) => (
          <Box key={player.id}>
            {/* Player Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 0.5 }}>
              <Typography sx={{ fontWeight: 600, minWidth: 20, color: '#666' }}>
                {idx + 1}
              </Typography>
              <Avatar
                src={getPlayerImageUrl(player.id)}
                sx={{ width: 32, height: 32 }}
                alt={player.name}
              >
                {player.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {player.name}
                </Typography>
              </Box>
              <Chip
                label={getFormLabel(player.form)}
                size="small"
                sx={{
                  backgroundColor: getFormColor(player.form),
                  color: '#fff',
                  fontWeight: 600,
                  minWidth: 60,
                }}
              />
              <Typography
                sx={{
                  fontWeight: 700,
                  minWidth: 40,
                  textAlign: 'right',
                  color: getFormColor(player.form),
                }}
              >
                {player.form}
              </Typography>
            </Box>

            {/* Form Progress */}
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (parseFloat(player.form) / 10) * 100)}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getFormColor(player.form),
                },
              }}
            />
          </Box>
        ))}
      </Stack>
    </DashboardWidget>
  );
};
