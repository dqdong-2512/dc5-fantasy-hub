/**
 * FPL Command Center Widget
 * Displays key FPL signals and recommendations
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Alert,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { DashboardWidget } from './DashboardWidget';
import { BootstrapRepository } from '@repositories/bootstrap';
import { PlayerRepository } from '@repositories/players';
import { compileCommandCenterData } from '../insights';
import { getPlayerImageUrl } from '@shared/assets';
import { getSeasonDisplay } from '@config/appConfig';
import { ThemeTokens } from '@shared/theme/tokens';
import type { PlayerRecommendation } from '../insights';

/**
 * Format time remaining for deadline
 */
function formatTimeRemaining(hours: number): string {
  if (hours === 0) return 'Deadline passed';
  if (hours < 1) return `${Math.round(hours * 60)} minutes remaining`;
  if (hours < 24) return `${hours}h remaining`;

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days === 1 && remainingHours === 0) return 'Deadline tomorrow';
  if (days === 1) return `1 day and ${remainingHours}h remaining`;
  return `${days} days and ${remainingHours}h remaining`;
}

/**
 * Player recommendation row component
 */
interface PlayerRowProps {
  player: PlayerRecommendation;
  hideReason?: boolean;
}

const PlayerRow: React.FC<PlayerRowProps> = ({ player, hideReason }) => (
  <TableRow sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
    <TableCell sx={{ maxWidth: 200 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar
          src={getPlayerImageUrl(player.playerId)}
          sx={{ width: 32, height: 32 }}
          alt={player.playerName}
        >
          {player.playerName.charAt(0)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {player.playerName}
          </Typography>
          <Typography variant="caption" color="textSecondary" noWrap>
            {player.club}
          </Typography>
        </Box>
      </Box>
    </TableCell>
    <TableCell align="right">
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        £{(player.price / 10).toFixed(1)}m
      </Typography>
    </TableCell>
    <TableCell align="right">
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color:
            player.form > 6.5 ? '#4caf50' : player.form > 4 ? '#ff9800' : '#999',
        }}
      >
        {player.form.toFixed(1)}
      </Typography>
    </TableCell>
    <TableCell align="right">
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {player.totalPoints}
      </Typography>
    </TableCell>
    {!hideReason && (
      <TableCell sx={{ maxWidth: 250 }}>
        <Typography variant="caption" color="textSecondary" noWrap>
          {player.reason}
        </Typography>
      </TableCell>
    )}
  </TableRow>
);

/**
 * FPL Command Center
 * Main insights widget
 */
export const CommandCenter: React.FC = () => {
  const commandCenterData = useMemo(() => {
    try {
      const bootstrapRepo = new BootstrapRepository();
      const playerRepo = new PlayerRepository();

      const currentGameweek = bootstrapRepo.getCurrentGameweek();
      const allPlayers = playerRepo.getAll();

      return compileCommandCenterData(currentGameweek, allPlayers);
    } catch (error) {
      console.error('Error compiling command center data:', error);
      return null;
    }
  }, []);

  if (!commandCenterData) {
    return null;
  }

  const { deadline, playersToWatch, differentials, topOwned, hasUnavailableData, unavailablePlayers } = commandCenterData;

  if (!deadline) {
    return null;
  }

  return (
    <DashboardWidget
      title="FPL Command Center"
      icon={<TrendingUpIcon sx={{ color: '#1976d2' }} />}
      subtitle={`GW${deadline.gameweek} · Season ${getSeasonDisplay()}`}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: ThemeTokens.spacing.lg }}>
        {/* Deadline Status */}
        <Card
          sx={{
            backgroundColor:
              deadline.severity === 'critical'
                ? '#ffebee'
                : deadline.severity === 'warning'
                  ? '#fff3e0'
                  : '#e3f2fd',
            borderLeft: `4px solid ${
              deadline.severity === 'critical'
                ? '#f44336'
                : deadline.severity === 'warning'
                  ? '#ff9800'
                  : '#1976d2'
            }`,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 0.5 }}>
              {deadline.severity === 'critical' && (
                <WarningIcon sx={{ color: '#f44336', fontSize: 20 }} />
              )}
              {deadline.severity === 'warning' && (
                <WarningIcon sx={{ color: '#ff9800', fontSize: 20 }} />
              )}
              {deadline.severity === 'info' && (
                <InfoIcon sx={{ color: '#1976d2', fontSize: 20 }} />
              )}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color:
                    deadline.severity === 'critical'
                      ? '#f44336'
                      : deadline.severity === 'warning'
                        ? '#ff9800'
                        : '#1976d2',
                }}
              >
                Deadline Status
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 0.5 }}>
              {formatDeadline(deadline.deadline)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatTimeRemaining(deadline.hoursRemaining)}
            </Typography>
          </CardContent>
        </Card>

        {/* Players to Watch Section */}
        {playersToWatch.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 1 }}>
              Players to Watch
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', marginBottom: 1 }}>
              Based on current form and season performance
            </Typography>
            <TableContainer sx={{ borderRadius: 1, backgroundColor: '#fafafa' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Player</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Price
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Form
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Pts
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, maxWidth: 200 }}>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {playersToWatch.map((player: PlayerRecommendation) => (
                    <PlayerRow key={player.playerId} player={player} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Differential Watch Section */}
        {differentials.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 1 }}>
              Differential Watch
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', marginBottom: 1 }}>
              Low ownership + strong form + meaningful minutes
            </Typography>
            <TableContainer sx={{ borderRadius: 1, backgroundColor: '#fafafa' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Player</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Price
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Form
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Pts
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, maxWidth: 250 }}>Why Interesting</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {differentials.map((player: PlayerRecommendation) => (
                    <PlayerRow key={player.playerId} player={player} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Top Owned Players Section */}
        {topOwned.length > 0 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 1 }}>
              Most Selected
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', marginBottom: 1 }}>
              Popular template players
            </Typography>
            <TableContainer sx={{ borderRadius: 1, backgroundColor: '#fafafa' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Player</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Price
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Form
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Ownership
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topOwned.map((player: PlayerRecommendation) => (
                    <TableRow key={player.playerId} sx={{ '&:hover': { backgroundColor: '#f0f0f0' } }}>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={getPlayerImageUrl(player.playerId)}
                            sx={{ width: 32, height: 32 }}
                          >
                            {player.playerName.charAt(0)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                              {player.playerName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" noWrap>
                              {player.club}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          £{(player.price / 10).toFixed(1)}m
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color:
                              player.form > 6.5
                                ? '#4caf50'
                                : player.form > 4
                                  ? '#ff9800'
                                  : '#999',
                          }}
                        >
                          {player.form.toFixed(1)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${player.ownership.toFixed(1)}%`}
                          size="small"
                          sx={{
                            backgroundColor: '#e3f2fd',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Availability Watch Section */}
        {hasUnavailableData && unavailablePlayers.length > 0 && (
          <Alert severity="warning" sx={{ margin: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 1 }}>
              Player Availability Concerns
            </Typography>
            <Box>
              {unavailablePlayers.map((player: PlayerRecommendation) => (
                <Typography key={player.playerId} variant="caption" sx={{ display: 'block' }}>
                  • {player.playerName} ({player.club}): {player.reason}
                </Typography>
              ))}
            </Box>
          </Alert>
        )}
      </Box>
    </DashboardWidget>
  );
};

/**
 * Format deadline timestamp
 */
function formatDeadline(deadline: string): string {
  try {
    const date = new Date(deadline);
    return date.toLocaleString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return deadline;
  }
}
