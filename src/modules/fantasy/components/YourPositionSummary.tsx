/**
 * Your Position Summary Component
 * Displays current manager's rank and stats in a league
 */

import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

export interface YourPositionSummaryProps {
  currentRank: number;
  totalManagers: number;
  gameweekPoints: number;
  totalPoints: number;
}

export const YourPositionSummary: React.FC<YourPositionSummaryProps> = ({
  currentRank,
  totalManagers,
  gameweekPoints,
  totalPoints,
}) => {
  return (
    <Box sx={{ marginBottom: 3 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          marginBottom: 1.5,
          fontSize: '1rem',
        }}
      >
        Your Position
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 1.5,
        }}
      >
        <Card>
          <CardContent sx={{ padding: '12px !important', textAlign: 'center' }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginBottom: 0.5, fontSize: '0.75rem' }}
            >
              Rank
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {currentRank}
              <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#999' }}>
                {' '}
                / {totalManagers}
              </Typography>
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ padding: '12px !important', textAlign: 'center' }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginBottom: 0.5, fontSize: '0.75rem' }}
            >
              GW Points
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#4caf50' }}
            >
              {gameweekPoints}
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ padding: '12px !important', textAlign: 'center' }}>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginBottom: 0.5, fontSize: '0.75rem' }}
            >
              Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
              {totalPoints}
            </Typography>
          </CardContent>
        </Card>

        {/* Optional 4th stat for larger screens */}
        <Box sx={{ display: { xs: 'none', sm: 'block' } }} />
      </Box>
    </Box>
  );
};
