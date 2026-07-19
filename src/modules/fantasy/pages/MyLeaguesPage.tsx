/**
 * My Leagues Page
 * Displays all leagues joined by the current manager
 */

import React, { useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageContainer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { fantasyGameFixtures } from '../fixtures';
import { MyLeaguesList } from '../components';

export const MyLeaguesPage: React.FC = () => {
  const navigate = useNavigate();
  const fixtures = useMemo(() => fantasyGameFixtures, []);

  if (!fixtures.leagues || fixtures.leagues.length === 0) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No leagues found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Compact Page Header */}
      <Box
        sx={{
          padding: ThemeTokens.spacing.xs,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/premier-league/fantasy-game')}
          sx={{
            textTransform: 'none',
            marginBottom: 1.5,
            color: '#1976d2',
            padding: 0,
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          Back to Fantasy Game
        </Button>

        {/* Page Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            marginBottom: 0.5,
          }}
        >
          My Leagues
        </Typography>
        <Typography variant="body2" color="textSecondary">
          View your leagues and track your position
        </Typography>
      </Box>

      {/* Main Content */}
      <PageContainer
        sx={{
          padding: ThemeTokens.spacing.xs,
        }}
      >
        <MyLeaguesList leagues={fixtures.leagues} />
      </PageContainer>
    </Box>
  );
};
