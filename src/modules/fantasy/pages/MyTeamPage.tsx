/**
 * My Team Page
 * Displays the user's selected FPL squad on a football pitch with bench
 */

import React, { useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageContainer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { fantasyGameFixtures } from '../fixtures';
import { FootballPitch, Bench, TeamSummary } from '../components';

export const MyTeamPage: React.FC = () => {
  const navigate = useNavigate();
  const fixtures = useMemo(() => fantasyGameFixtures, []);

  if (!fixtures.squad) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No squad data available
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
          My Team
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {fixtures.manager.teamName}
        </Typography>
      </Box>

      {/* Main Content */}
      <PageContainer
        sx={{
          paddingTop: { xs: ThemeTokens.spacing.xs, md: ThemeTokens.spacing.xs },
          paddingBottom: { xs: ThemeTokens.spacing.lg, md: ThemeTokens.spacing.xl },
        }}
      >
        {/* Team Summary Stats */}
        <TeamSummary
          teamName={fixtures.manager.teamName}
          gameweekNumber={fixtures.currentGameweek.gameweek}
          gameweekPoints={fixtures.currentGameweek.points}
          teamValue={fixtures.manager.teamValue}
          bank={fixtures.manager.bank}
          squad={fixtures.squad.map((p) => ({
            playerId: p.playerId,
            isStarter: p.isStarter,
          }))}
        />

        {/* Football Pitch */}
        <FootballPitch
          squad={fixtures.squad.map((p) => ({
            playerId: p.playerId,
            isStarter: p.isStarter,
            isCaptain: p.isCaptain,
            isViceCaptain: p.isViceCaptain,
            gameweekPoints: p.gameweekPoints,
          }))}
        />

        {/* Bench */}
        <Bench
          squad={fixtures.squad.map((p) => ({
            playerId: p.playerId,
            isStarter: p.isStarter,
            benchOrder: p.benchOrder,
            gameweekPoints: p.gameweekPoints,
          }))}
        />
      </PageContainer>
    </Box>
  );
};
