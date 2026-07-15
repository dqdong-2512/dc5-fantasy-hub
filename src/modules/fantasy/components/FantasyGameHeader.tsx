/**
 * Fantasy Game Header Component
 * Displays manager/team info and actions when connected
 */

import React from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import type { FantasyEntry } from '@domain/models';
import { ThemeTokens } from '@shared/theme/tokens';

export interface FantasyGameHeaderProps {
  entry: FantasyEntry | null;
  onChangeTeam: () => void;
  onDisconnect: () => void;
}

/**
 * Fantasy Game Header
 */
export function FantasyGameHeader({
  entry,
  onChangeTeam,
  onDisconnect,
}: FantasyGameHeaderProps): React.ReactElement {
  if (!entry) {
    return <Box />;
  }

  return (
    <Box
      sx={{
        backgroundColor: '#f5f5f5',
        borderRadius: ThemeTokens.borderRadius.md,
        padding: ThemeTokens.spacing.lg,
        marginBottom: ThemeTokens.spacing.lg,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={ThemeTokens.spacing.lg}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
        }}
      >
        {/* Team Info */}
        <Stack spacing={ThemeTokens.spacing.md}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Team Name
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {entry.team.name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Manager
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {entry.manager.name}
            </Typography>
          </Box>
        </Stack>

        {/* Stats */}
        <Stack direction="row" spacing={ThemeTokens.spacing.xl}>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Overall Points
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#4caf50',
              }}
            >
              {entry.manager.totalPoints}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Overall Rank
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#2196f3',
              }}
            >
              {entry.manager.overallRank ? `#${entry.manager.overallRank.toLocaleString()}` : '—'}
            </Typography>
          </Box>
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={ThemeTokens.spacing.sm}>
          <Button
            variant="outlined"
            size="small"
            onClick={onChangeTeam}
            sx={{ textTransform: 'none' }}
          >
            Change Team
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={onDisconnect}
            sx={{ textTransform: 'none' }}
          >
            Disconnect
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
