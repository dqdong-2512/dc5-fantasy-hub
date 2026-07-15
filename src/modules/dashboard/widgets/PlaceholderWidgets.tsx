/**
 * Placeholder Widgets
 * Coming soon sections
 */

import React from 'react';
import { Box, Typography } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { DashboardWidget } from '../components/DashboardWidget';
import { ThemeTokens } from '@shared/theme/tokens';

/**
 * Price Changes Widget (Placeholder)
 */
export const PriceChanges: React.FC = () => {
  return (
    <DashboardWidget
      title="Price Changes"
      subtitle="Coming Soon"
      icon={<TrendingUpIcon sx={{ color: '#2196f3' }} />}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: ThemeTokens.spacing.xl,
          textAlign: 'center',
          color: '#999',
        }}
      >
        <BuildIcon sx={{ fontSize: 48, marginBottom: 2, opacity: 0.5 }} />
        <Typography variant="body2" color="textSecondary">
          Price tracking and change analysis coming soon
        </Typography>
      </Box>
    </DashboardWidget>
  );
};

/**
 * Latest News Widget (Placeholder)
 */
export const LatestNews: React.FC = () => {
  return (
    <DashboardWidget
      title="Latest News"
      subtitle="Coming Soon"
      icon={<NewspaperIcon sx={{ color: '#ff9800' }} />}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: ThemeTokens.spacing.xl,
          textAlign: 'center',
          color: '#999',
        }}
      >
        <NewspaperIcon sx={{ fontSize: 48, marginBottom: 2, opacity: 0.5 }} />
        <Typography variant="body2" color="textSecondary">
          Fantasy Premier League news and updates coming soon
        </Typography>
      </Box>
    </DashboardWidget>
  );
};
