/**
 * Manager Comparison Page
 * Displays detailed comparison between current manager and selected opponent
 */

import React, { useMemo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageContainer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { fantasyGameFixtures, leagueStandingsFixtures, opponentSquadsFixtures } from '../fixtures';
import {
  ComparisonHeader,
  HeadToHeadSummary,
  CaptainComparison,
  TeamPitchComparison,
  DifferentialSummary,
} from '../components';
import type { LeagueStandingEntry } from '../types';

export const ManagerComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const { leagueId, managerId } = useParams<{ leagueId: string; managerId: string }>();
  const fixtures = useMemo(() => fantasyGameFixtures, []);

  // Parse IDs as numbers
  const leagueIdNum = useMemo(() => (leagueId ? parseInt(leagueId, 10) : null), [leagueId]);
  const managerIdNum = useMemo(() => (managerId ? parseInt(managerId, 10) : null), [managerId]);

  // Find league
  const league = useMemo(
    () => (leagueIdNum ? fixtures.leagues.find((l) => l.id === leagueIdNum) : null),
    [leagueIdNum, fixtures.leagues]
  );

  // Find league standings
  const standings = useMemo(
    () => (leagueIdNum ? leagueStandingsFixtures[leagueIdNum] : null),
    [leagueIdNum]
  );

  // Find opponent manager in standings
  const opponentManager = useMemo(
    () => standings?.entries.find((e: LeagueStandingEntry) => e.managerId === managerIdNum) || null,
    [standings, managerIdNum]
  );

  // Get opponent squad - gracefully handle missing data
  const opponentSquad = useMemo(
    () => (managerIdNum ? opponentSquadsFixtures[managerIdNum] || null : null),
    [managerIdNum]
  );

  // Check for self-comparison (trying to compare against self)
  const isSelfComparison = managerIdNum === fixtures.manager.id;

  // Get current squad - should always exist but add safety check
  const currentSquad = fixtures.squad || [];

  // Error states
  if (!league || !standings || !opponentManager) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          League or manager not found
        </Typography>
        <Button onClick={() => navigate('/premier-league/gameweek')} sx={{ marginTop: 2 }}>
          Back to Fantasy Game
        </Button>
      </Box>
    );
  }

  if (isSelfComparison) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          You cannot compare your team against yourself
        </Typography>
        <Button
          onClick={() => navigate(`/premier-league/gameweek/league/${leagueId}`)}
          sx={{ marginTop: 2 }}
        >
          Back to League Standings
        </Button>
      </Box>
    );
  }

  if (!opponentSquad) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          Team data is not available for this manager
        </Typography>
        <Button
          onClick={() => navigate(`/premier-league/gameweek/league/${leagueId}`)}
          sx={{ marginTop: 2 }}
        >
          Back to League Standings
        </Button>
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
          onClick={() => navigate(`/premier-league/gameweek/league/${leagueId}`)}
          sx={{
            textTransform: 'none',
            marginBottom: 1.5,
            color: '#1976d2',
            padding: 0,
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          Back to {league.name}
        </Button>

        {/* Page Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            marginBottom: 0.5,
          }}
        >
          Team Comparison
        </Typography>

        {/* Breadcrumb */}
        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
          {opponentManager.managerName} vs {fixtures.manager.name}
        </Typography>
      </Box>

      {/* Main Content */}
      <PageContainer
        sx={{
          padding: ThemeTokens.spacing.xs,
        }}
      >
        {/* Comparison Header */}
        <ComparisonHeader currentManager={fixtures.manager} opponentManager={opponentManager} />

        {/* Head-to-Head Summary */}
        <HeadToHeadSummary currentManager={fixtures.manager} opponentManager={opponentManager} />

        {/* Captain Comparison */}
        <CaptainComparison mySquad={currentSquad} opponentSquad={opponentSquad} />

        {/* Team Pitch Comparison */}
        <TeamPitchComparison
          mySquad={currentSquad}
          myTeamName={fixtures.manager.teamName}
          opponentSquad={opponentSquad}
          opponentTeamName={opponentManager.teamName}
        />

        {/* Differential Summary */}
        <DifferentialSummary mySquad={currentSquad} opponentSquad={opponentSquad} />
      </PageContainer>
    </Box>
  );
};


