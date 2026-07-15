/**
 * Dashboard Header Component
 * Displays key information about the current gameweek and application state
 */

import React, { useMemo } from 'react';
import { Box, Typography, Chip, Alert } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import UpdateIcon from '@mui/icons-material/Update';
import { BootstrapRepository } from '@repositories/bootstrap';
import { getSeasonDisplay } from '@config/appConfig';
import { ThemeTokens } from '@shared/theme/tokens';

export interface DashboardHeaderProps {
  competition: string;
  lastSyncTime?: Date;
}

/**
 * Dashboard Header
 * Shows competition, season, gameweek, deadline, and sync status
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ competition, lastSyncTime }) => {
  // Load gameweek data
  const gameweekData = useMemo(() => {
    try {
      const repo = new BootstrapRepository();
      const current = repo.getCurrentGameweek();
      return {
        gameweek: current?.id || 0,
        deadline: current?.deadline || null,
      };
    } catch (error) {
      return { gameweek: 0, deadline: null };
    }
  }, []);

  // Calculate deadline countdown
  const deadlineInfo = useMemo(() => {
    if (!gameweekData.deadline) return null;
    const now = new Date();
    const deadline = new Date(gameweekData.deadline);
    const diffMs = deadline.getTime() - now.getTime();

    if (diffMs <= 0) {
      return {
        isActive: false,
        text: 'Deadline passed',
        hoursUntil: 0,
      };
    }

    const hoursUntil = Math.floor(diffMs / (1000 * 60 * 60));

    return {
      isActive: true,
      text: `Deadline in ${hoursUntil}h`,
      hoursUntil,
    };
  }, [gameweekData.deadline]);

  const getDeadlineColor = (): 'success' | 'warning' | 'error' => {
    if (!deadlineInfo) return 'success';
    if (deadlineInfo.hoursUntil > 24) return 'success';
    if (deadlineInfo.hoursUntil > 1) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ marginBottom: 4 }}>
      {/* Main Header Row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: ThemeTokens.spacing.lg,
          marginBottom: ThemeTokens.spacing.lg,
        }}
      >
        {/* Title Section */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
            {competition}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ marginTop: 0.5 }}>
            Season {getSeasonDisplay()}
          </Typography>
        </Box>

        {/* Status Chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<SportsSoccerIcon sx={{ fontSize: 18 }} />}
            label={`GW ${gameweekData.gameweek}`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            icon={<AccessTimeIcon sx={{ fontSize: 18 }} />}
            label={deadlineInfo?.text || 'Loading...'}
            color={getDeadlineColor()}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Box>

      {/* Last Sync Info */}
      {lastSyncTime && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem' }}>
          <UpdateIcon sx={{ fontSize: 16, color: 'textSecondary' }} />
          <Typography variant="caption" color="textSecondary">
            Last updated{' '}
            {(() => {
              const now = new Date();
              const diffMs = now.getTime() - lastSyncTime.getTime();
              const minutes = Math.floor(diffMs / (1000 * 60));
              const hours = Math.floor(diffMs / (1000 * 60 * 60));
              if (minutes < 1) return 'just now';
              if (minutes < 60) return `${minutes}m ago`;
              if (hours < 24) return `${hours}h ago`;
              return 'over a day ago';
            })()}
          </Typography>
        </Box>
      )}

      {/* Deadline Warning */}
      {deadlineInfo && deadlineInfo.isActive && deadlineInfo.hoursUntil < 24 && (
        <Alert
          severity={deadlineInfo.hoursUntil < 1 ? 'error' : 'warning'}
          sx={{ marginTop: ThemeTokens.spacing.md }}
        >
          Deadline in {deadlineInfo.hoursUntil} hours
        </Alert>
      )}
    </Box>
  );
};
