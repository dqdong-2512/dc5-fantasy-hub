/**
 * Replacement Candidates Component
 * Shows eligible replacement players for transfer
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import { PlayerRepository } from '@repositories/players';
import { PlayerAnalyticsService } from '@modules/analytics/services/player-analytics.service';
import { ThemeTokens } from '@shared/theme/tokens';
import AddIcon from '@mui/icons-material/Add';

/**
 * Get position label from position string
 */
function getPositionLabel(position: string): string {
  switch (position) {
    case 'GOALKEEPER':
      return 'GK';
    case 'DEFENDER':
      return 'DEF';
    case 'MIDFIELDER':
      return 'MID';
    case 'FORWARD':
      return 'FWD';
    default:
      return position;
  }
}

export interface ReplacementCandidatesProps {
  outgoingPlayerId: number;
  plannedSquadIds: Set<number>;
  availableBudget: number;
  selectedCandidateId: number | null;
  onSelectCandidate: (playerId: number) => void;
  onAddTransfer: () => void;
  isAdding?: boolean;
}

export const ReplacementCandidates: React.FC<ReplacementCandidatesProps> = ({
  outgoingPlayerId,
  plannedSquadIds,
  availableBudget,
  selectedCandidateId,
  onSelectCandidate,
  onAddTransfer,
  isAdding = false,
}) => {
  const playerRepo = useMemo(() => new PlayerRepository(), []);
  const analyticsService = useMemo(() => new PlayerAnalyticsService(), []);

  const outPlayer = useMemo(
    () => playerRepo.getById(outgoingPlayerId),
    [outgoingPlayerId, playerRepo]
  );

  // Find eligible replacement candidates
  const candidates = useMemo(() => {
    if (!outPlayer) return [];

    const allPlayers = playerRepo.getAll();
    const eligible: any[] = [];

    for (const player of allPlayers) {
      // Must be same position (simplified check)
      if (player.position !== outPlayer.position) continue;

      // Must not already be owned in planned squad
      if (plannedSquadIds.has(player.id)) continue;

      // Must be within budget
      if (player.price / 10 > availableBudget) continue;

      // Build analytics record
      const analytics = analyticsService.buildAnalyticsRecord(player);

      eligible.push({
        playerId: player.id,
        player,
        analytics,
        affordability: availableBudget - player.price / 10,
      });
    }

    // Sort by overall score
    return eligible.sort(
      (a, b) => (b.analytics.overallScore || 0) - (a.analytics.overallScore || 0)
    );
  }, [outPlayer, playerRepo, plannedSquadIds, availableBudget, analyticsService]);

  if (!outPlayer) {
    return (
      <Box sx={{ textAlign: 'center', padding: ThemeTokens.spacing.lg }}>
        <Typography color="textSecondary">Select a player first</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.md }}
      >
        Replacement Candidates ({candidates.length})
      </Typography>

      {/* Info Box */}
      <Card sx={{ marginBottom: ThemeTokens.spacing.md, backgroundColor: '#f5f5f5' }}>
        <CardContent>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            <strong>Position:</strong> {getPositionLabel(outPlayer.position)}
          </Typography>
          <Typography variant="body2">
            <strong>Budget:</strong> £{availableBudget.toFixed(1)}m available
          </Typography>
        </CardContent>
      </Card>

      {/* Candidates List */}
      <Stack spacing={1} sx={{ maxHeight: '600px', overflowY: 'auto' }}>
        {candidates.length === 0 ? (
          <Box sx={{ padding: ThemeTokens.spacing.lg, textAlign: 'center' }}>
            <Typography color="textSecondary">No eligible candidates within budget</Typography>
          </Box>
        ) : (
          candidates.map(({ playerId, player, analytics }) => {
            const isSelected = selectedCandidateId === playerId;

            return (
              <Card
                key={playerId}
                onClick={() => onSelectCandidate(isSelected ? -1 : playerId)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#e8f5e9' : '#fff',
                  border: isSelected ? '2px solid #4caf50' : '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: isSelected ? '#e8f5e9' : '#f9f9f9',
                  },
                }}
              >
                <CardContent sx={{ paddingY: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      gap: 1,
                    }}
                  >
                    {/* Player Info */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {player.displayName}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {player.club}
                      </Typography>

                      {/* Analytics Chips */}
                      <Box sx={{ marginTop: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        <Chip
                          label={`£${(player.price / 10).toFixed(1)}m`}
                          size="small"
                          variant="outlined"
                        />
                        {analytics.valueScore !== undefined && (
                          <Chip
                            label={`Value: ${analytics.valueScore.toFixed(1)}`}
                            size="small"
                            color={analytics.valueScore >= 15 ? 'success' : 'default'}
                            variant="filled"
                            sx={{
                              backgroundColor: analytics.valueScore >= 15 ? '#4caf50' : '#ccc',
                              color: '#fff',
                              fontSize: '0.75rem',
                            }}
                          />
                        )}
                        {analytics.differentialScore !== undefined &&
                          analytics.differentialScore > 0 && (
                            <Chip
                              label={`Diff: ${analytics.differentialScore.toFixed(1)}`}
                              size="small"
                              sx={{
                                backgroundColor: '#ff9800',
                                color: '#fff',
                                fontSize: '0.75rem',
                              }}
                            />
                          )}
                      </Box>
                    </Box>

                    {/* Stats */}
                    <Box sx={{ textAlign: 'right', minWidth: '80px' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {player.totalPoints}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        pts
                      </Typography>
                      <Box sx={{ marginTop: 0.5 }}>
                        <Typography variant="caption" color="textSecondary">
                          Form: {player.form.toFixed(1)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}
      </Stack>

      {/* Add Transfer Button */}
      {selectedCandidateId && selectedCandidateId > 0 && (
        <Button
          variant="contained"
          fullWidth
          startIcon={isAdding ? <CircularProgress size={20} /> : <AddIcon />}
          onClick={onAddTransfer}
          disabled={isAdding}
          sx={{
            marginTop: ThemeTokens.spacing.lg,
            backgroundColor: '#4caf50',
            color: '#fff',
            '&:hover': { backgroundColor: '#388e3c' },
          }}
        >
          {isAdding ? 'Adding...' : 'Add Transfer'}
        </Button>
      )}
    </Box>
  );
};
