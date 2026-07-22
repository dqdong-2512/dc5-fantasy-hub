/**
 * Fantasy Game Header Component
 * Displays manager/team info and actions when connected
 */

import React, { useMemo } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import type { FantasyEntry, FantasyGameweekHistory } from '@domain/models';
import { ThemeTokens } from '@shared/theme/tokens';

export interface FantasyGameHeaderProps {
  entry: FantasyEntry | null;
  gameweekHistory: FantasyGameweekHistory[] | null;
  onChangeTeam: () => void;
  onDisconnect: () => void;
}

/**
 * Calculate rank movement from gameweek history
 * Returns { movement: number, direction: 'up' | 'down' | 'none', display: string }
 */
function calculateRankMovement(
  currentRank: number | null,
  gameweekHistory: FantasyGameweekHistory[] | null
): { movement: number; direction: 'up' | 'down' | 'none'; display: string } {
  if (!currentRank || !gameweekHistory || gameweekHistory.length === 0) {
    return { movement: 0, direction: 'none', display: '—' };
  }

  // Find the latest gameweek with rank data
  const latestGameweek = gameweekHistory.find((gw) => gw.rank !== null && gw.prevRank !== null);

  if (!latestGameweek || latestGameweek.prevRank === null) {
    return { movement: 0, direction: 'none', display: '—' };
  }

  const prevRank = latestGameweek.prevRank;
  const movement = prevRank - currentRank;

  if (movement > 0) {
    return {
      movement: Math.abs(movement),
      direction: 'up',
      display: `↑ ${Math.abs(movement).toLocaleString()}`,
    };
  } else if (movement < 0) {
    return {
      movement: Math.abs(movement),
      direction: 'down',
      display: `↓ ${Math.abs(movement).toLocaleString()}`,
    };
  } else {
    return { movement: 0, direction: 'none', display: '—' };
  }
}

/**
 * Fantasy Game Header
 */
export function FantasyGameHeader({
  entry,
  gameweekHistory,
  onChangeTeam,
  onDisconnect,
}: FantasyGameHeaderProps): React.ReactElement {
  if (!entry) {
    return <Box />;
  }

  const rankMovement = useMemo(
    () => calculateRankMovement(entry.manager.overallRank, gameweekHistory),
    [entry.manager.overallRank, gameweekHistory]
  );

  return (
    <Box
      sx={{
        backgroundColor: '#f5f5f5',
        borderRadius: ThemeTokens.borderRadius.md,
        paddingY: ThemeTokens.spacing.xs,
        paddingX: ThemeTokens.spacing.sm,
        marginBottom: ThemeTokens.spacing.xs,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={ThemeTokens.spacing.sm}
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexWrap: 'wrap',
        }}
      >
        {/* Team Info */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' }, minWidth: '150px' }}>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ display: 'block', fontSize: '0.8125rem' }}
          >
            Team
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            {entry.team.name}
          </Typography>
        </Box>

        {/* Manager */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' }, minWidth: '150px' }}>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ display: 'block', fontSize: '0.8125rem' }}
          >
            Manager
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {entry.manager.name}
          </Typography>
        </Box>

        {/* Points */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' }, minWidth: '80px' }}>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ display: 'block', fontSize: '0.8125rem' }}
          >
            Points
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              color: '#4caf50',
            }}
          >
            {entry.manager.totalPoints}
          </Typography>
        </Box>

        {/* Rank */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' }, minWidth: '100px' }}>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ display: 'block', fontSize: '0.8125rem' }}
          >
            Rank
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              color: '#2196f3',
            }}
          >
            {entry.manager.overallRank ? `#${entry.manager.overallRank.toLocaleString()}` : '—'}
          </Typography>
        </Box>

        {/* Rank Movement */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' }, minWidth: '120px' }}>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ display: 'block', fontSize: '0.8125rem' }}
          >
            Movement
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: 'center',
            }}
          >
            {rankMovement.direction === 'up' && (
              <>
                <TrendingUp sx={{ color: '#4caf50', fontSize: '1.25rem' }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    color: '#4caf50',
                  }}
                >
                  {rankMovement.movement.toLocaleString()}
                </Typography>
              </>
            )}
            {rankMovement.direction === 'down' && (
              <>
                <TrendingDown sx={{ color: '#f44336', fontSize: '1.25rem' }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    color: '#f44336',
                  }}
                >
                  {rankMovement.movement.toLocaleString()}
                </Typography>
              </>
            )}
            {rankMovement.direction === 'none' && (
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: '#999',
                }}
              >
                —
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Actions */}
        <Stack
          direction="row"
          spacing={ThemeTokens.spacing.xs}
          sx={{ marginLeft: 'auto', flex: '0 1 auto' }}
        >
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
