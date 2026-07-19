/**
 * League Workspace Page
 * Central workspace for all league-related features
 * Handles Standings, Manager Comparison, and future Live Race features
 */

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { PageContainer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { fantasyGameFixtures, leagueStandingsFixtures, opponentSquadsFixtures } from '../fixtures';
import {
  LeagueWorkspaceHeader,
  WorkspaceNavigation,
  LeagueStandingsTable,
  YourPositionSummary,
  OpponentSelector,
  ComparisonHeader,
  HeadToHeadSummary,
  CaptainComparison,
  TeamPitchComparison,
  DifferentialSummary,
} from '../components';
import type { LeagueStandingEntry } from '../types';

export const LeagueStandingsPage: React.FC = () => {
  const { leagueId, managerId } = useParams<{ leagueId: string; managerId?: string }>();
  const location = useLocation();
  const fixtures = useMemo(() => fantasyGameFixtures, []);

  // Parse IDs as numbers
  const leagueIdNum = useMemo(() => (leagueId ? parseInt(leagueId, 10) : null), [leagueId]);
  const managerIdNum = useMemo(() => (managerId ? parseInt(managerId, 10) : null), [managerId]);

  // Detect if on Live Race view
  const isLiveRaceView = useMemo(() => location.pathname.includes('/live'), [location.pathname]);

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

  // Find opponent manager in standings (if comparing)
  const opponentManager = useMemo(
    () =>
      managerIdNum && standings
        ? standings.entries.find((e: LeagueStandingEntry) => e.managerId === managerIdNum) || null
        : null,
    [managerIdNum, standings]
  );

  // Get opponent squad (if comparing)
  const opponentSquad = useMemo(
    () => (managerIdNum ? opponentSquadsFixtures[managerIdNum] || null : null),
    [managerIdNum]
  );

  // Get current squad
  const currentSquad = fixtures.squad || [];

  // Check for self-comparison
  const isSelfComparison = managerIdNum === fixtures.manager.id;

  // Error: Invalid league
  if (!league || !standings || !currentManagerEntry) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          League not found
        </Typography>
      </Box>
    );
  }

  // Error: Self-comparison
  if (isSelfComparison) {
    return <Navigate to={`/premier-league/fantasy-game/leagues/${leagueId}`} replace />;
  }

  // Error: Invalid manager
  if (managerIdNum && !opponentManager) {
    return <Navigate to={`/premier-league/fantasy-game/leagues/${leagueId}`} replace />;
  }

  // Error: Missing opponent squad data
  if (managerIdNum && !opponentSquad) {
    return (
      <Box>
        <LeagueWorkspaceHeader
          leagues={fixtures.leagues}
          selectedLeagueId={leagueIdNum}
          currentManagerEntry={currentManagerEntry}
          standingsEntryCount={standings.entries.length}
          workspaceNavigation={<WorkspaceNavigation leagueId={leagueIdNum || 0} />}
        />
        <PageContainer sx={{ padding: ThemeTokens.spacing.xs }}>
          <Box sx={{ padding: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Team data is not available for this manager
            </Typography>
          </Box>
        </PageContainer>
      </Box>
    );
  }

  // STANDINGS VIEW
  if (!managerIdNum) {
    return (
      <Box>
        <LeagueWorkspaceHeader
          leagues={fixtures.leagues}
          selectedLeagueId={leagueIdNum}
          currentManagerEntry={currentManagerEntry}
          standingsEntryCount={standings.entries.length}
          workspaceNavigation={<WorkspaceNavigation leagueId={leagueIdNum || 0} />}
        />

        <PageContainer sx={{ padding: ThemeTokens.spacing.xs }}>
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

          {/* Compare Section - Quick Access */}
          <Box sx={{ marginTop: 3, paddingBottom: ThemeTokens.spacing.xs }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                marginBottom: 1.5,
                fontSize: '1rem',
              }}
            >
              Compare Teams
            </Typography>
            <OpponentSelector
              standings={standings.entries}
              currentManagerId={fixtures.manager.id}
              leagueId={leagueIdNum || 0}
            />
          </Box>
        </PageContainer>
      </Box>
    );
  }

  // MANAGER COMPARISON VIEW
  if (managerIdNum && opponentManager && opponentSquad) {
    return (
      <Box>
        <LeagueWorkspaceHeader
          leagues={fixtures.leagues}
          selectedLeagueId={leagueIdNum}
          currentManagerEntry={currentManagerEntry}
          standingsEntryCount={standings.entries.length}
          workspaceNavigation={<WorkspaceNavigation leagueId={leagueIdNum || 0} />}
        />

        <PageContainer sx={{ padding: ThemeTokens.spacing.xs }}>
          {/* Comparison Header */}
          <ComparisonHeader currentManager={fixtures.manager} opponentManager={opponentManager} />

          {/* Head-to-Head Summary */}
          <Box sx={{ marginTop: 3 }}>
            <HeadToHeadSummary
              currentManager={fixtures.manager}
              opponentManager={opponentManager}
            />
          </Box>

          {/* Captain Comparison */}
          <Box sx={{ marginTop: 3 }}>
            <CaptainComparison mySquad={currentSquad} opponentSquad={opponentSquad} />
          </Box>

          {/* Team Pitch Comparison */}
          <Box sx={{ marginTop: 3 }}>
            <TeamPitchComparison
              mySquad={currentSquad}
              myTeamName={fixtures.manager.teamName}
              opponentSquad={opponentSquad}
              opponentTeamName={opponentManager.teamName}
            />
          </Box>

          {/* Differential Summary */}
          <Box sx={{ marginTop: 3, paddingBottom: ThemeTokens.spacing.xs }}>
            <DifferentialSummary mySquad={currentSquad} opponentSquad={opponentSquad} />
          </Box>
        </PageContainer>
      </Box>
    );
  }

  // LIVE RACE VIEW
  if (isLiveRaceView) {
    return (
      <Box>
        <LeagueWorkspaceHeader
          leagues={fixtures.leagues}
          selectedLeagueId={leagueIdNum}
          currentManagerEntry={currentManagerEntry}
          standingsEntryCount={standings.entries.length}
          workspaceNavigation={<WorkspaceNavigation leagueId={leagueIdNum || 0} />}
        />

        <PageContainer sx={{ padding: ThemeTokens.spacing.xs }}>
          <Box sx={{ padding: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: 2 }}>
              Live League Race
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Live rankings and projected league positions will be available here. Coming soon.
            </Typography>
          </Box>
        </PageContainer>
      </Box>
    );
  }

  return null;
};
