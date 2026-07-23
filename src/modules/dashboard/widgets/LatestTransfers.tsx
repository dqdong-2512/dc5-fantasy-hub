/**
 * Latest Transfers Widget
 * Displays detected squad changes from synchronized FPL data
 */

import React, { useMemo } from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { ThemeTokens } from '@shared/theme/tokens';
import { DashboardWidget } from '../components/DashboardWidget';
import { TransferRepository, type PlayerTransfer } from '@repositories/transfers';
import { TeamRepository } from '@repositories/teams';

/**
 * Latest Transfers Widget
 * Shows recent squad changes detected during sync
 */
export const LatestTransfers: React.FC = () => {
  const transferData = useMemo(() => {
    try {
      const transferRepo = new TransferRepository();
      const teamRepo = new TeamRepository();
      const teams = teamRepo.getAll();

      // Create team map for quick lookups
      const teamMap = new Map<number, string>();
      teams.forEach((team) => {
        teamMap.set(team.id, team.shortName || team.name);
      });

      const transfers = transferRepo.getLatest(5);

      return {
        transfers,
        teamMap,
        count: transfers.length,
      };
    } catch (error) {
      console.error('Error loading transfers:', error);
      return {
        transfers: [],
        teamMap: new Map(),
        count: 0,
      };
    }
  }, []);

  return (
    <DashboardWidget
      title="Latest Squad Changes"
      icon={<TrendingUpIcon sx={{ color: '#2196f3' }} />}
    >
      {transferData.count === 0 ? (
        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
          No recent squad changes detected.
        </Typography>
      ) : (
        <Stack spacing={ThemeTokens.spacing.sm}>
          {transferData.transfers.map((transfer: PlayerTransfer) => {
            const fromTeamName = transferData.teamMap.get(transfer.fromTeamId || 0) || 'Unknown';
            const toTeamName = transferData.teamMap.get(transfer.toTeamId) || 'Unknown';

            return (
              <Box
                key={`${transfer.playerId}-${transfer.detectedAt}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: ThemeTokens.spacing.sm,
                  padding: `${ThemeTokens.spacing.xs}px 0`,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}
              >
                {/* Player Name */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {transfer.playerName}
                  </Typography>
                </Box>

                {/* Transfer Arrow */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  <Chip
                    label={fromTeamName}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: '#2196f3',
                      margin: '0 2px',
                    }}
                  >
                    →
                  </Typography>
                  <Chip
                    label={toTeamName}
                    size="small"
                    variant="filled"
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: '#2196f3',
                      color: '#fff',
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </DashboardWidget>
  );
};
