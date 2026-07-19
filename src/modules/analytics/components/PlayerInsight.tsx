/**
 * Player Insight Component
 * Displays comprehensive player analytics and comparison data
 */

import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Stack,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { Player } from '@domain/models';
import { PlayerAnalyticsService } from '../services/player-analytics.service';
import { PlayerFixtureIntelligenceService } from '@modules/players/services';
import { ShortlistButton } from './ShortlistButton';

export interface PlayerInsightProps {
  player: Player;
  open: boolean;
  onClose: () => void;
  isInMyTeam?: boolean;
  useDrawer?: boolean;
  onCompare?: (playerId: number) => void;
}

export const PlayerInsight: React.FC<PlayerInsightProps> = ({
  player,
  open,
  onClose,
  isInMyTeam = false,
  useDrawer = true,
  onCompare,
}) => {
  const analyticsService = useMemo(() => new PlayerAnalyticsService(), []);
  const fixtureService = useMemo(() => new PlayerFixtureIntelligenceService(), []);

  const analytics = useMemo(
    () => analyticsService.buildAnalyticsRecord(player),
    [player, analyticsService]
  );

  const fixtures = useMemo(
    () => fixtureService.getPlayerUpcomingFixtures(player, 5),
    [player, fixtureService]
  );

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: ThemeTokens.spacing.lg }}>
      {/* Header */}
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          padding: ThemeTokens.spacing.md,
          borderRadius: '8px',
        }}
      >
        <Stack spacing={ThemeTokens.spacing.sm}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {player.displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {player.club} • {player.position}
              </Typography>
            </Box>
            <ShortlistButton playerId={player.id} />
          </Box>

          {isInMyTeam && (
            <Chip label="In My Team" size="small" color="primary" variant="outlined" />
          )}
        </Stack>
      </Box>

      {/* Key Metrics Grid */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.sm }}
        >
          Key Metrics
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
            gap: ThemeTokens.spacing.md,
          }}
        >
          {/* Price */}
          <Paper sx={{ padding: ThemeTokens.spacing.md, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Price
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              £{(player.price / 10).toFixed(1)}m
            </Typography>
          </Paper>

          {/* Total Points */}
          <Paper sx={{ padding: ThemeTokens.spacing.md, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Total Points
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
              {player.totalPoints}
            </Typography>
          </Paper>

          {/* Form */}
          <Paper sx={{ padding: ThemeTokens.spacing.md, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Form
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2e7d32' }}>
              {player.form.toFixed(1)}
            </Typography>
          </Paper>

          {/* Ownership */}
          <Paper sx={{ padding: ThemeTokens.spacing.md, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Ownership
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {player.ownership.toFixed(1)}%
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Analytics Scores */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.sm }}
        >
          Analytics Scores
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
            gap: ThemeTokens.spacing.md,
          }}
        >
          <Paper sx={{ padding: ThemeTokens.spacing.md, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Value Score
            </Typography>
            <Box sx={{ marginTop: ThemeTokens.spacing.xs }}>
              <Chip
                label={analytics.valueScore.toFixed(1)}
                sx={{
                  backgroundColor: '#2e7d32',
                  color: '#fff',
                  fontWeight: 700,
                }}
              />
            </Box>
          </Paper>

          <Paper sx={{ padding: ThemeTokens.spacing.md, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Differential
            </Typography>
            <Box sx={{ marginTop: ThemeTokens.spacing.xs }}>
              <Chip
                label={analytics.differentialScore.toFixed(1)}
                sx={{
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                }}
                variant="outlined"
              />
            </Box>
          </Paper>

          <Paper sx={{ padding: ThemeTokens.spacing.md, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Fixtures
            </Typography>
            <Box sx={{ marginTop: ThemeTokens.spacing.xs }}>
              <Chip
                label={analytics.fixtureScore.toFixed(1)}
                sx={{
                  backgroundColor: '#2e7d32',
                  color: '#fff',
                  fontWeight: 700,
                }}
              />
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Performance Stats */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.sm }}
        >
          Performance Stats
        </Typography>
        <Paper sx={{ padding: ThemeTokens.spacing.md }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
              gap: ThemeTokens.spacing.md,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Points Per Game
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {player.pointsPerGame.toFixed(1)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Minutes Played
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {player.minutesPlayed}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Goals Scored
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {player.goalsScored || 0}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Assists
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {player.assists || 0}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Clean Sheets
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {player.cleanSheets || 0}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Threat / Creativity
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {player.threat?.toFixed(1) || 'N/A'} / {player.creativity?.toFixed(1) || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Upcoming Fixtures */}
      {fixtures.length > 0 && (
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.sm }}
          >
            Upcoming Fixtures
          </Typography>
          <Paper sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>GW</TableCell>
                  <TableCell>Opponent</TableCell>
                  <TableCell align="center">H/A</TableCell>
                  <TableCell align="right">FDR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fixtures.map((fixture) => (
                  <TableRow key={fixture.gameweek}>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{fixture.gameweek}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{fixture.opponent.name}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '0.85rem' }}>
                      {fixture.homeAway}
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                      {fixture.difficulty}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      {/* Actions */}
      <Stack
        direction="row"
        spacing={ThemeTokens.spacing.md}
        sx={{ marginTop: ThemeTokens.spacing.md }}
      >
        {onCompare && (
          <Button variant="outlined" onClick={() => onCompare(player.id)}>
            Compare
          </Button>
        )}
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </Stack>
    </Box>
  );

  if (useDrawer) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{player.displayName}</DialogTitle>
        <DialogContent sx={{ overflowY: 'auto' }}>{content}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{player.displayName}</DialogTitle>
      <DialogContent>{content}</DialogContent>
    </Dialog>
  );
};
