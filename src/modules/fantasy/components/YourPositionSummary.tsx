/**
 * Your Position Summary Component
 * Displays current manager's rank and stats in a league
 */

import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';

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
      <Typography variant="h5" sx={{ fontWeight: 850, marginBottom: 1.5 }}>
        Your league snapshot
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        <Card variant="outlined" sx={{ borderColor: '#ddd6fe', boxShadow: '0 8px 20px rgba(55,0,60,.06)' }}>
          <CardContent sx={{ padding: '20px !important' }}>
            <EmojiEventsOutlinedIcon sx={{ color: '#7c3aed', mb: 1 }} />
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginBottom: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.8 }}
            >
              Rank
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 850 }}>
              #{currentRank}
              <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#999' }}>
                {' '}
                / {totalManagers}
              </Typography>
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderColor: '#bae6fd', boxShadow: '0 8px 20px rgba(2,132,199,.06)' }}>
          <CardContent sx={{ padding: '20px !important' }}>
            <BoltOutlinedIcon sx={{ color: '#00a65a', mb: 1 }} />
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginBottom: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.8 }}
            >
              GW Points
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 850, fontSize: '1.5rem', color: '#00a65a' }}
            >
              {gameweekPoints}
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderColor: '#bfdbfe', boxShadow: '0 8px 20px rgba(37,99,235,.06)' }}>
          <CardContent sx={{ padding: '20px !important' }}>
            <LeaderboardOutlinedIcon sx={{ color: '#087fb8', mb: 1 }} />
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block', marginBottom: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.8 }}
            >
              Total
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 850 }}>
              {totalPoints}
            </Typography>
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
};
