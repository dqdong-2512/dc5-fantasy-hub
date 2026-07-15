/**
 * Player Detail Drawer Component
 * Displays detailed player information in a side drawer
 */

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Divider,
  Card,
  CardContent,
  Badge as MUIBadge,
} from '@mui/material';
import type { Player } from '@domain/models';
import { Position } from '@domain/enums';
import { SideDrawer, ComingSoonCard } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';

export interface PlayerDetailDrawerProps {
  player: Player | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Player Detail Drawer
 * Shows comprehensive player information and analytics placeholders
 */
export function PlayerDetailDrawer({
  player,
  open,
  onClose,
}: PlayerDetailDrawerProps): React.ReactElement {
  if (!player) {
    return <></>;
  }

  const getPositionLabel = (position: string): string => {
    const positionMap: Record<string, string> = {
      [Position.Goalkeeper]: 'Goalkeeper',
      [Position.Defender]: 'Defender',
      [Position.Midfielder]: 'Midfielder',
      [Position.Forward]: 'Forward',
    };
    return positionMap[position] || position;
  };

  const getPositionColor = (position: string): string => {
    const colorMap: Record<string, string> = {
      [Position.Goalkeeper]: '#1e88e5',
      [Position.Defender]: '#fbc02d',
      [Position.Midfielder]: '#43a047',
      [Position.Forward]: '#e53935',
    };
    return colorMap[position] || '#9c27b0';
  };

  return (
    <SideDrawer title={`${player.firstName} ${player.lastName}`} open={open} onClose={onClose}>
      <Stack spacing={ThemeTokens.spacing.lg}>
        {/* Player Summary Card */}
        <Card>
          <CardContent>
            <Stack spacing={ThemeTokens.spacing.md}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.md }}>
                <MUIBadge
                  badgeContent={getPositionLabel(player.position).substring(0, 3)}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: getPositionColor(player.position),
                      color: '#fff',
                      fontWeight: 600,
                    },
                  }}
                >
                  <Box
                    sx={{ width: 60, height: 60, backgroundColor: 'action.hover', borderRadius: 1 }}
                  />
                </MUIBadge>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {getPositionLabel(player.position)}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {player.club}
                  </Typography>
                </Box>
              </Box>

              <Divider />

              {/* Key Stats Grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: ThemeTokens.spacing.md,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Price
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    £{(player.price / 10).toFixed(1)}m
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Selected By
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {player.ownership.toFixed(1)}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Form
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, color: player.form > 5 ? 'success.main' : 'inherit' }}
                  >
                    {player.form.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Minutes Played
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {player.minutesPlayed}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Next Fixture Section */}
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
          >
            Next Fixture
          </Typography>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Fixture information will be displayed here
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Coming Soon Sections */}
        <ComingSoonCard title="Price History" subtitle="View historical pricing trends" />

        <ComingSoonCard title="Performance Trend" subtitle="Weekly performance analytics" />

        <ComingSoonCard title="Transfer Trend" subtitle="Transfer history and market movement" />
      </Stack>
    </SideDrawer>
  );
}
