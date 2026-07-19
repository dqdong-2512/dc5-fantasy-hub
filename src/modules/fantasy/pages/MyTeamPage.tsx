/**
 * My Team Page
 * Displays the user's selected FPL squad on a football pitch with bench
 */

import React, { useMemo } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwapCallsIcon from '@mui/icons-material/SwapCalls';
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
        {/* Navigation Buttons */}
        <Stack direction="row" spacing={1} sx={{ marginBottom: 1.5 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/premier-league/fantasy-game')}
            sx={{
              textTransform: 'none',
              color: '#1976d2',
              padding: 0,
              '&:hover': { backgroundColor: 'transparent' },
            }}
          >
            Back
          </Button>

          <Button
            startIcon={<SwapCallsIcon />}
            onClick={() => navigate('/premier-league/fantasy-game/transfers')}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderColor: '#2196f3',
              color: '#2196f3',
            }}
          >
            Plan Transfers
          </Button>
        </Stack>

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
          padding: ThemeTokens.spacing.xs,
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
