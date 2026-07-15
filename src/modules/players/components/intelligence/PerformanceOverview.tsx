/**
 * Performance Overview Component
 * Displays player performance metrics and statistics
 */

import React from 'react';
import { Box, Typography, Card, CardContent, Stack } from '@mui/material';
import type { Player } from '@domain/models';
import { ThemeTokens } from '@shared/theme/tokens';

export interface PerformanceOverviewProps {
  player: Player;
}

interface PerformanceStat {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

/**
 * Performance Overview
 * Shows key performance statistics and form indicators
 */
export function PerformanceOverview({ player }: PerformanceOverviewProps): React.ReactElement {
  const getFormColor = (form: number): string => {
    if (form > 6) return 'success.main';
    if (form > 4) return 'info.main';
    if (form > 2) return 'warning.main';
    return 'error.main';
  };

  const stats: PerformanceStat[] = [
    {
      label: 'Current Form',
      value: player.form.toFixed(2),
      unit: '/10',
      color: getFormColor(player.form),
    },
    {
      label: 'Total Points',
      value: '—',
      unit: 'pts',
    },
    {
      label: 'Minutes Played',
      value: player.minutesPlayed,
      unit: 'mins',
    },
    {
      label: 'Goals',
      value: '—',
    },
    {
      label: 'Assists',
      value: '—',
    },
    {
      label: 'Clean Sheets',
      value: '—',
    },
    {
      label: 'Yellow Cards',
      value: '—',
    },
    {
      label: 'Red Cards',
      value: '—',
    },
  ];

  return (
    <Box>
      <Typography
        variant={ThemeTokens.typography.subsectionTitleVariant}
        sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
      >
        Performance Overview
      </Typography>
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
              gap: ThemeTokens.spacing.lg,
            }}
          >
            {stats.map((stat, idx) => (
              <Box key={idx}>
                <Stack spacing={ThemeTokens.spacing.sm}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {stat.label}
                  </Typography>
                  <Box
                    sx={{ display: 'flex', alignItems: 'baseline', gap: ThemeTokens.spacing.xs }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        color: stat.color,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    {stat.unit && (
                      <Typography variant="caption" color="text.secondary">
                        {stat.unit}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
