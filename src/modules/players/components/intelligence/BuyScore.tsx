/**
 * Buy Score Component
 * Displays a prominent calculated score for player evaluation
 */

import React from 'react';
import { Box, Typography, Card, CardContent, Stack } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface BuyScoreProps {
  score: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  reasoning?: string;
}

/**
 * Buy Score
 * Prominent decision support component showing player evaluation
 */
export function BuyScore({ score, recommendation, reasoning }: BuyScoreProps): React.ReactElement {
  const getRecommendationColor = (rec: string): string => {
    const colors: Record<string, string> = {
      strong_buy: '#1db954',
      buy: '#43a047',
      hold: '#fb8c00',
      sell: '#f57c00',
      strong_sell: '#d32f2f',
    };
    return colors[rec] || '#666';
  };

  const getRecommendationLabel = (rec: string): string => {
    const labels: Record<string, string> = {
      strong_buy: 'Strong Buy',
      buy: 'Buy',
      hold: 'Hold',
      sell: 'Sell',
      strong_sell: 'Strong Sell',
    };
    return labels[rec] || rec;
  };

  const scoreColor = getRecommendationColor(recommendation);

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${scoreColor}15 0%, ${scoreColor}05 100%)`,
        border: `2px solid ${scoreColor}40`,
      }}
    >
      <CardContent>
        <Stack spacing={ThemeTokens.spacing.md} sx={{ alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Intelligence Score
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                gap: ThemeTokens.spacing.sm,
                marginY: ThemeTokens.spacing.md,
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: scoreColor,
                  fontSize: '3rem',
                }}
              >
                {score}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>
                /100
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              width: '100%',
              height: 6,
              backgroundColor: 'action.disabledBackground',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${score}%`,
                height: '100%',
                backgroundColor: scoreColor,
                transition: 'width 0.3s ease',
              }}
            />
          </Box>

          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: scoreColor,
                marginBottom: ThemeTokens.spacing.sm,
              }}
            >
              {getRecommendationLabel(recommendation)}
            </Typography>
            {reasoning && (
              <Typography variant="caption" color="text.secondary">
                {reasoning}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
