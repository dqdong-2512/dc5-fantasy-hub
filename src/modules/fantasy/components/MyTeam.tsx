/**
 * My Team Component - Live Gameweek Center
 * Displays live squad performance with player stats
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Alert,
  Button,
  Card,
  CardContent,
  Drawer,
  IconButton,
  Chip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import type { LiveSquadPerformance, LiveSquadPlayer } from '@domain/models';
import { PlayerMatchStatus } from '@domain/models';
import { LoadingState, ErrorState } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { getPlayerImageUrl } from '@shared/assets';

export interface MyTeamProps {
  livePerformance: LiveSquadPerformance | null;
  isLoading: boolean;
  error?: string | null;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

/**
 * Get status chip color and label
 */
function getStatusDisplay(status: PlayerMatchStatus): {
  color: 'default' | 'error' | 'warning' | 'info' | 'success';
  label: string;
} {
  switch (status) {
    case PlayerMatchStatus.Finished:
      return { color: 'success', label: 'FT' };
    case PlayerMatchStatus.Live:
      return { color: 'error', label: 'LIVE' };
    case PlayerMatchStatus.NotStarted:
      return { color: 'warning', label: 'TO PLAY' };
    case PlayerMatchStatus.NoFixture:
      return { color: 'default', label: 'NO FIXTURE' };
    default:
      return { color: 'default', label: '—' };
  }
}

/**
 * Live Gameweek Summary Card
 */
const GameweekSummaryCard: React.FC<{ performance: LiveSquadPerformance }> = ({ performance }) => {
  const summary = performance.summary;

  return (
    <Card>
      <CardContent>
        <Stack spacing={ThemeTokens.spacing.sm}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            GW {summary.gameweekId} — {summary.isCompleted ? 'Final' : 'Live'}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: ThemeTokens.spacing.sm,
            }}
          >
            <Box>
              <Typography variant="caption" color="textSecondary">
                Total Points
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {summary.totalPoints}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="textSecondary">
                Players
              </Typography>
              <Typography variant="body2">
                {summary.playersPlayed} played • {summary.playersLive} live •{' '}
                {summary.playersRemaining} left
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="textSecondary">
                Captain
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                {summary.captainPoints}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="textSecondary">
                Bench
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                {summary.benchPoints}
              </Typography>
            </Box>
          </Box>

          {summary.deductedPoints > 0 && (
            <Alert severity="warning">Points deduction: -{summary.deductedPoints}</Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

/**
 * Performance Highlights
 */
const PerformanceHighlights: React.FC<{ performance: LiveSquadPerformance }> = ({
  performance,
}) => {
  const highlights = performance.highlights;
  const hasHighlights =
    highlights.topScorer ||
    highlights.captainContribution ||
    highlights.benchHighlight ||
    highlights.highestScoringDefender ||
    highlights.highestScoringMidfielder;

  if (!hasHighlights) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.sm }}>
          Performance Highlights
        </Typography>

        <Stack spacing={ThemeTokens.spacing.sm}>
          {highlights.topScorer && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                <strong>Top Scorer:</strong> {highlights.topScorer.playerName}
              </Typography>
              <Typography sx={{ fontWeight: 600, color: '#4caf50' }}>
                {highlights.topScorer.points} pts
              </Typography>
            </Box>
          )}

          {highlights.captainContribution && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                <strong>Captain:</strong> {highlights.captainContribution.playerName} (
                {highlights.captainContribution.basePoints} × 2)
              </Typography>
              <Typography sx={{ fontWeight: 600, color: '#ff9800' }}>
                {highlights.captainContribution.effectivePoints} pts
              </Typography>
            </Box>
          )}

          {highlights.benchHighlight && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                <strong>Best Bench:</strong> {highlights.benchHighlight.playerName}
              </Typography>
              <Typography sx={{ fontWeight: 600, color: '#2196f3' }}>
                {highlights.benchHighlight.points} pts
              </Typography>
            </Box>
          )}

          {highlights.highestScoringDefender && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                <strong>Top Defender:</strong> {highlights.highestScoringDefender.playerName}
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {highlights.highestScoringDefender.points} pts
              </Typography>
            </Box>
          )}

          {highlights.highestScoringMidfielder && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                <strong>Top Midfielder:</strong> {highlights.highestScoringMidfielder.playerName}
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {highlights.highestScoringMidfielder.points} pts
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

/**
 * Player Performance Drawer
 */
interface PlayerDrawerProps {
  player: LiveSquadPlayer | null;
  open: boolean;
  onClose: () => void;
}

const PlayerPerformanceDrawer: React.FC<PlayerDrawerProps> = ({ player, open, onClose }) => {
  if (!player) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, padding: ThemeTokens.spacing.lg }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: ThemeTokens.spacing.lg,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {player.playerName}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack spacing={ThemeTokens.spacing.md}>
          {/* Summary */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.sm }}
            >
              Summary
            </Typography>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: ThemeTokens.spacing.sm }}
            >
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Points
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {player.effectivePoints}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">
                  Minutes
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {player.minutes}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Stats */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.sm }}
            >
              Stats
            </Typography>
            <Stack spacing={ThemeTokens.spacing.xs}>
              {player.goalsScored > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Goals</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {player.goalsScored}
                  </Typography>
                </Box>
              )}
              {player.assists > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Assists</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {player.assists}
                  </Typography>
                </Box>
              )}
              {player.cleanSheets > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Clean Sheet</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ✓
                  </Typography>
                </Box>
              )}
              {player.goalsConceded > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Goals Conceded</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {player.goalsConceded}
                  </Typography>
                </Box>
              )}
              {player.saves > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Saves</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {player.saves}
                  </Typography>
                </Box>
              )}
              {player.yellowCards > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Yellow Cards</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {player.yellowCards}
                  </Typography>
                </Box>
              )}
              {player.redCards > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: '#f44336' }}>
                    Red Card
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#f44336' }}>
                    ✓
                  </Typography>
                </Box>
              )}
              {player.bonus > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Bonus</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff9800' }}>
                    +{player.bonus}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Multiplier */}
          {(player.isCaptain || player.isViceCaptain) && (
            <Box
              sx={{
                backgroundColor: '#f5f5f5',
                padding: ThemeTokens.spacing.md,
                borderRadius: ThemeTokens.borderRadius.md,
              }}
            >
              <Typography variant="caption" color="textSecondary">
                Multiplier
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {player.isCaptain ? 'Captain (×2)' : 'Vice Captain (×1)'}
              </Typography>
              <Typography variant="body2" sx={{ marginTop: ThemeTokens.spacing.xs }}>
                {player.gameweekPoints} pts × {player.isCaptain ? '2' : '1'} ={' '}
                {player.effectivePoints} effective pts
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
};

/**
 * Player Card on Pitch
 */
interface PlayerCardProps {
  player: LiveSquadPlayer;
  onViewDetails: (player: LiveSquadPlayer) => void;
  size?: 'sm' | 'md';
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onViewDetails, size = 'md' }) => {
  const statusDisplay = getStatusDisplay(player.matchStatus);
  const sizeScale = size === 'sm' ? 0.8 : 1;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.3,
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'scale(1.05)' },
      }}
      onClick={() => onViewDetails(player)}
    >
      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={getPlayerImageUrl(player.playerId)}
          sx={{
            width: 60 * sizeScale,
            height: 60 * sizeScale,
            border: player.isCaptain
              ? '3px solid #ffc107'
              : player.isViceCaptain
                ? '3px solid #ff9800'
                : '2px solid #999',
          }}
        />

        {(player.isCaptain || player.isViceCaptain) && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -5,
              right: -5,
              backgroundColor: player.isCaptain ? '#ffc107' : '#ff9800',
              color: '#fff',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {player.isCaptain ? 'C' : 'V'}
          </Box>
        )}

        {/* Status badge */}
        <Chip
          label={statusDisplay.label}
          size="small"
          color={statusDisplay.color}
          sx={{
            position: 'absolute',
            top: -5,
            right: -5,
            height: 20,
            fontSize: '0.65rem',
          }}
        />
      </Box>

      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          fontSize: 0.7 * sizeScale + 'rem',
          textAlign: 'center',
          maxWidth: 70 * sizeScale,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {player.playerName?.split(' ').pop()}
      </Typography>

      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: 0.8 * sizeScale + 'rem',
            color:
              player.effectivePoints >= 10
                ? '#4caf50'
                : player.effectivePoints >= 5
                  ? '#ff9800'
                  : '#666',
          }}
        >
          {player.effectivePoints}
        </Typography>
        {player.isCaptain && (
          <Typography
            variant="caption"
            sx={{ display: 'block', fontSize: 0.65 * sizeScale + 'rem' }}
          >
            {player.gameweekPoints} × 2
          </Typography>
        )}
      </Box>
    </Box>
  );
};

/**
 * Main MyTeam Component
 */
export function MyTeam({
  livePerformance,
  isLoading,
  error,
  lastUpdated,
  onRefresh,
  isRefreshing,
}: MyTeamProps): React.ReactElement {
  const [selectedPlayer, setSelectedPlayer] = useState<LiveSquadPlayer | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Show loading state only on initial load when no data exists
  if (isLoading && !livePerformance) {
    return <LoadingState label="Loading squad..." />;
  }

  // Show error state but preserve old data if it exists
  if (error && !livePerformance) {
    return <ErrorState title="Failed to load squad" message={error} />;
  }

  // Show empty state if truly no data
  if (!livePerformance) {
    return (
      <Typography color="textSecondary" sx={{ textAlign: 'center' }}>
        No squad data available
      </Typography>
    );
  }

  const starters = livePerformance.starters;
  const bench = livePerformance.bench;

  return (
    <Stack spacing={ThemeTokens.spacing.sm}>
      {/* Error alert if refresh failed but old data exists */}
      {error && livePerformance && <Alert severity="warning">{error}</Alert>}

      {/* Summary */}
      <GameweekSummaryCard performance={livePerformance} />

      {/* Last Updated & Refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {lastUpdated && (
          <Typography variant="caption" color="textSecondary">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        )}
        {onRefresh && (
          <Button
            size="small"
            onClick={onRefresh}
            disabled={isRefreshing}
            startIcon={<RefreshIcon />}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        )}
      </Box>

      {/* Pitch Layout */}
      <Card>
        <CardContent>
          <Box
            sx={{
              backgroundColor: '#2d5016',
              borderRadius: ThemeTokens.borderRadius.md,
              padding: ThemeTokens.spacing.lg,
              aspectRatio: '4/5',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
            }}
          >
            {/* Goalkeepers */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: ThemeTokens.spacing.md }}>
              {starters
                .filter((p) => p.playerPosition === 'GOALKEEPER')
                .map((p) => (
                  <PlayerCard
                    key={p.playerId}
                    player={p}
                    onViewDetails={(player) => {
                      setSelectedPlayer(player);
                      setDrawerOpen(true);
                    }}
                  />
                ))}
            </Box>

            {/* Defenders */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: ThemeTokens.spacing.md,
                flexWrap: 'wrap',
              }}
            >
              {starters
                .filter((p) => p.playerPosition === 'DEFENDER')
                .map((p) => (
                  <PlayerCard
                    key={p.playerId}
                    player={p}
                    onViewDetails={(player) => {
                      setSelectedPlayer(player);
                      setDrawerOpen(true);
                    }}
                  />
                ))}
            </Box>

            {/* Midfielders */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: ThemeTokens.spacing.md,
                flexWrap: 'wrap',
              }}
            >
              {starters
                .filter((p) => p.playerPosition === 'MIDFIELDER')
                .map((p) => (
                  <PlayerCard
                    key={p.playerId}
                    player={p}
                    onViewDetails={(player) => {
                      setSelectedPlayer(player);
                      setDrawerOpen(true);
                    }}
                  />
                ))}
            </Box>

            {/* Forwards */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: ThemeTokens.spacing.md }}>
              {starters
                .filter((p) => p.playerPosition === 'FORWARD')
                .map((p) => (
                  <PlayerCard
                    key={p.playerId}
                    player={p}
                    onViewDetails={(player) => {
                      setSelectedPlayer(player);
                      setDrawerOpen(true);
                    }}
                  />
                ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Bench */}
      {bench.length > 0 && (
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.sm }}
          >
            Bench
          </Typography>
          <Box sx={{ display: 'flex', gap: ThemeTokens.spacing.md, flexWrap: 'wrap' }}>
            {bench.map((p) => (
              <PlayerCard
                key={p.playerId}
                player={p}
                size="sm"
                onViewDetails={(player) => {
                  setSelectedPlayer(player);
                  setDrawerOpen(true);
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Highlights */}
      <PerformanceHighlights performance={livePerformance} />

      {/* Player Details Drawer */}
      <PlayerPerformanceDrawer
        player={selectedPlayer}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Stack>
  );
}
