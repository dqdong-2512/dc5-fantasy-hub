/**
 * League Standings Page
 * Displays standings for a selected league
 * Central workspace for league features with league switcher
 */

import React, { useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageContainer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { fantasyGameFixtures, leagueStandingsFixtures } from '../fixtures';
import {
  LeagueStandingsTable,
  YourPositionSummary,
  LeagueSwitcher,
  RankMovement,
} from '../components';
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

        {/* League Header Row - Title and Switcher */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 1.5, sm: 2 },
            marginBottom: 1,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              flex: 1,
            }}
          >
            {league.name}
          </Typography>

          {/* League Switcher */}
          <LeagueSwitcher leagues={fixtures.leagues} selectedLeagueId={leagueIdNum} />
        </Box>

        {/* League Summary Info - Compact Row */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
            Rank{' '}
            <Typography component="span" sx={{ fontWeight: 600, color: '#333' }}>
              #{currentManagerEntry.currentRank}
            </Typography>
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
            •
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
            {standings.entries.length} Managers
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
            •
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <RankMovement
              previousRank={currentManagerEntry.previousRank}
              currentRank={currentManagerEntry.currentRank}
              size="small"
            />
          </Box>
        </Box>
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
