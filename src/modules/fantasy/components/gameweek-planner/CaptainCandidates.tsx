/**
 * Captain Candidates Component
 * Displays ranked candidates for captain based on form, fixtures, and PPG
 */

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { CaptainCandidate } from '../../domain/GameweekPlan';

export interface CaptainCandidatesProps {
  candidates: CaptainCandidate[];
  currentCaptainId: number | null;
  onSelectCaptain: (playerId: number) => void;
}

export const CaptainCandidates: React.FC<CaptainCandidatesProps> = ({
  candidates,
  currentCaptainId,
  onSelectCaptain,
}) => {
  if (candidates.length === 0) {
    return (
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
        >
          Captain Candidates
        </Typography>
        <Typography variant="body2" color="textSecondary">
          No candidates available
        </Typography>
      </Box>
    );
  }

  // Sort by suitability score
  const sorted = [...candidates].sort(
    (a, b) => b.captainSuitabilityScore - a.captainSuitabilityScore
  );

  return (
    <Box>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
      >
        Captain Candidates ({candidates.length})
      </Typography>
      <Stack spacing={ThemeTokens.spacing.md}>
        {sorted.map((candidate) => (
          <Card
            key={candidate.playerId}
            sx={{
              border: currentCaptainId === candidate.playerId ? '2px solid #1976d2' : undefined,
              backgroundColor: currentCaptainId === candidate.playerId ? '#f3f6ff' : 'transparent',
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: ThemeTokens.spacing.md,
                  alignItems: 'center',
                  marginBottom: ThemeTokens.spacing.md,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {candidate.playerName}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {candidate.position} • {candidate.club}
                  </Typography>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', gap: ThemeTokens.spacing.sm }}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        Form
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {candidate.form.toFixed(1)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        PPG
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {candidate.pointsPerGame.toFixed(1)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        FDR
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {candidate.fixtureScore.toFixed(1)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{ display: 'flex', gap: ThemeTokens.spacing.sm, justifyContent: 'flex-end' }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Score
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {candidate.captainSuitabilityScore.toFixed(1)}/10
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={candidate.captainSuitabilityScore * 10}
                      sx={{ height: 6, borderRadius: '3px' }}
                    />
                  </Box>
                  <Button
                    variant={currentCaptainId === candidate.playerId ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => onSelectCaptain(candidate.playerId)}
                    sx={{ minWidth: 60 }}
                  >
                    {currentCaptainId === candidate.playerId ? 'C' : 'Set C'}
                  </Button>
                </Box>
              </Box>

              {candidate.fixture && (
                <Box sx={{ pt: ThemeTokens.spacing.md, borderTop: '1px solid #e0e0e0' }}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ display: 'block', mb: '4px' }}
                  >
                    Fixture
                  </Typography>
                  <Box sx={{ display: 'flex', gap: ThemeTokens.spacing.sm, alignItems: 'center' }}>
                    <Chip
                      label={`${candidate.fixture.opponent} (${candidate.fixture.homeAway})`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`FDR ${candidate.fixture.difficulty}`}
                      size="small"
                      sx={{
                        backgroundColor:
                          candidate.fixture.difficulty <= 2
                            ? '#e8f5e9'
                            : candidate.fixture.difficulty === 3
                              ? '#fff3e0'
                              : '#ffebee',
                      }}
                    />
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};
