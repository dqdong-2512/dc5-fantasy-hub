/**
 * Fixture Intelligence Component
 * Displays upcoming fixtures and fixture difficulty analysis
 */

import React from 'react';
import { Box, Typography, Card, CardContent, Stack, Chip } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { ComingSoonCard } from '@shared/components';

export interface FixtureIntelligenceProps {
  playerClub: string;
}

/**
 * Fixture Difficulty Indicator
 * Reusable component showing fixture difficulty
 */
function FixtureDifficultyIndicator({
  difficulty,
  label,
}: {
  difficulty: 'easy' | 'medium' | 'hard';
  label: string;
}): React.ReactElement {
  const getDifficultyColor = (diff: string): string => {
    const colors: Record<string, string> = {
      easy: '#43a047',
      medium: '#fbc02d',
      hard: '#e53935',
    };
    return colors[diff] || '#999';
  };

  const getDifficultyLabel = (diff: string): string => {
    const labels: Record<string, string> = {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    };
    return labels[diff] || diff;
  };

  return (
    <Stack spacing={ThemeTokens.spacing.xs}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Chip
        label={getDifficultyLabel(difficulty)}
        size="small"
        sx={{
          backgroundColor: getDifficultyColor(difficulty),
          color: '#fff',
          fontWeight: 600,
          width: 'fit-content',
        }}
      />
    </Stack>
  );
}

/**
 * Fixture Intelligence
 * Shows upcoming fixtures and difficulty ratings
 */
export function FixtureIntelligence(_props: FixtureIntelligenceProps): React.ReactElement {
  return (
    <Box>
      <Typography
        variant={ThemeTokens.typography.subsectionTitleVariant}
        sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
      >
        Fixture Intelligence
      </Typography>

      <Stack spacing={ThemeTokens.spacing.md}>
        {/* Upcoming Fixtures Placeholder */}
        <Card>
          <CardContent>
            <Stack spacing={ThemeTokens.spacing.md}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
                >
                  Upcoming Fixtures
                </Typography>
                <Stack spacing={ThemeTokens.spacing.md}>
                  {[1, 2, 3].map((_, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: ThemeTokens.spacing.md,
                        paddingBottom: ThemeTokens.spacing.md,
                        borderBottom: idx < 2 ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          GW {39 + idx} Fixture
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, marginTop: ThemeTokens.spacing.xs }}
                        >
                          —
                        </Typography>
                      </Box>
                      <FixtureDifficultyIndicator difficulty={'medium'} label="Difficulty" />
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Fixture Difficulty Chart */}
        <ComingSoonCard
          title="Fixture Difficulty Trend"
          subtitle="Visual fixture difficulty analysis"
        />
      </Stack>
    </Box>
  );
}
