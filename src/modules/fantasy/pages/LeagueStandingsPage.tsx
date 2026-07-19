/**
 * League Standings Page
 * Displays standings for a selected league
 */

import React, { useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageContainer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { fantasyGameFixtures, leagueStandingsFixtures } from '../fixtures';
import { LeagueStandingsTable, YourPositionSummary } from '../components';
import type { LeagueStandingEntry } from '../types';

export const LeagueStandingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { leagueId } = useParams<{ leagueId: string }>();
  const fixtures = useMemo(() => fantasyGameFixtures, []);

  // Parse leagueId as number
  const leagueIdNum = useMemo(() => (leagueId ? parseInt(leagueId, 10) : null), [leagueId]);

  // Find league details
  const league = useMemo(
    () => (leagueIdNum ? fixtures.leagues.find((l) => l.id === leagueIdNum) : null),
    [leagueIdNum, fixtures.leagues]
  );

  // Find league standings
  const standings = useMemo(
    () => (leagueIdNum ? leagueStandingsFixtures[leagueIdNum] : null),
    [leagueIdNum]
  );

  // Find current manager entry in standings
  const currentManagerEntry = useMemo(
    () =>
      standings?.entries.find((e: LeagueStandingEntry) => e.managerId === fixtures.manager.id) ||
      null,
    [standings, fixtures.manager.id]
  );

  if (!league || !standings || !currentManagerEntry) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          League not found
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
          onClick={() => navigate('/premier-league/fantasy-game/leagues')}
          sx={{
            textTransform: 'none',
            marginBottom: 1.5,
            color: '#1976d2',
            padding: 0,
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          Back to My Leagues
        </Button>

        {/* Page Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            marginBottom: 0.5,
          }}
        >
          {league.name}
        </Typography>

        {/* Subtitle with member count */}
        <Typography variant="body2" color="textSecondary">
          {standings.entries.length} managers
        </Typography>
      </Box>

      {/* Main Content */}
      <PageContainer
        sx={{
          padding: ThemeTokens.spacing.xs,
        }}
      >
        {/* Your Position Summary */}
        <YourPositionSummary
          currentRank={currentManagerEntry.currentRank}
          totalManagers={standings.entries.length}
          gameweekPoints={currentManagerEntry.gameweekPoints}
          totalPoints={currentManagerEntry.totalPoints}
        />

        {/* League Standings Table */}
        <Box sx={{ marginTop: 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              marginBottom: 1.5,
              fontSize: '1rem',
            }}
          >
            Standings
          </Typography>
          <LeagueStandingsTable
            standings={standings.entries}
            currentManagerId={fixtures.manager.id}
          />
        </Box>
      </PageContainer>
    </Box>
  );
};
