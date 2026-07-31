/**
 * League Workspace Page
 * Central workspace for all league-related features
 * Handles Standings, Manager Comparison, and future Live Race features
 * Supports both real FPL data (when connected) and fixture data (for development)
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import { ThemeTokens } from '@shared/theme/tokens';
import { fantasyGameFixtures, leagueStandingsFixtures, opponentSquadsFixtures } from '../fixtures';
import {
  LeagueWorkspaceHeader,
  WorkspaceNavigation,
  LeagueStandingsTable,
  YourPositionSummary,
  OpponentSelector,
  LiveLeagueRace,
  ManagerHeadToHeadPage,
} from '../components';
import { useGameweekHubState } from '../context';
import { FantasyGameRepository } from '@repositories/fantasy';
import { getStoredLeagueId } from '../components/FplConnectionGate';

export const LeagueStandingsPage: React.FC = () => {
  const { leagueId, managerId } = useParams<{ leagueId: string; managerId?: string }>();
  const location = useLocation();
  const fixtures = useMemo(() => fantasyGameFixtures, []);
  const gameState = useGameweekHubState();

  // Parse IDs as numbers
  const leagueIdNum = useMemo(() => (leagueId ? parseInt(leagueId, 10) : null), [leagueId]);
  const managerIdNum = useMemo(() => (managerId ? parseInt(managerId, 10) : null), [managerId]);
  const resolvedLeagueId =
    leagueIdNum ??
    (gameState.isConnected
      ? getStoredLeagueId() ?? gameState.entry?.joinedLeaguesIds?.[0] ?? null
      : fixtures.manager.primaryLeagueId);

  // Detect if on Live Race view
  const isLiveRaceView = useMemo(() => location.pathname.includes('/live'), [location.pathname]);

  // Load real league standings if connected
  const [realStandings, setRealStandings] = useState<any>(null);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [standingsError, setStandingsError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameState.isConnected || !leagueIdNum) return;

    const loadStandings = async () => {
      try {
        setStandingsLoading(true);
        setStandingsError(null);
        const repo = new FantasyGameRepository();
        const data = await repo.getLeagueStandings(leagueIdNum, 1);
        setRealStandings(data);
      } catch (err) {
        setStandingsError(err instanceof Error ? err.message : 'Failed to load standings');
      } finally {
        setStandingsLoading(false);
      }
    };

    loadStandings();
  }, [gameState.isConnected, leagueIdNum]);

  // Use real data if connected, otherwise use fixtures
  const standings =
    gameState.isConnected && realStandings
      ? realStandings
      : leagueStandingsFixtures[leagueIdNum || 0];
  const leagueData =
    gameState.isConnected && realStandings
      ? { id: leagueIdNum, name: realStandings.leagueName }
      : fixtures.leagues.find((l) => l.id === leagueIdNum);

  // Find current manager entry in standings
  const currentManagerEntry = useMemo(() => {
    if (!standings) return null;

    const entries = realStandings ? standings.standings : standings.entries;
    const currentId = gameState.isConnected ? gameState.connectedEntryId : fixtures.manager.id;

    if (!entries) return null;

    const entry = entries.find((e: any) =>
      gameState.isConnected ? e.entryId === currentId : e.managerId === currentId
    );

    if (!entry) return null;

    // Map to expected format if from real API
    if (gameState.isConnected && realStandings) {
      return {
        managerId: entry.entryId,
        currentRank: entry.rank,
        previousRank: entry.prevRank,
        gameweekPoints: entry.eventPoints || 0,
        totalPoints: entry.points || entry.totalPoints,
        managerName: entry.playerName,
        teamName: entry.entryName,
      };
    }

    return entry;
  }, [
    standings,
    gameState.isConnected,
    gameState.connectedEntryId,
    realStandings,
    fixtures.manager.id,
  ]);

  // Find opponent manager in standings (if comparing)
  const opponentManager = useMemo(() => {
    if (!managerIdNum || !standings) return null;

    const entries = realStandings ? standings.standings : standings.entries;
    if (!entries) return null;

    return (
      entries.find((e: any) =>
        gameState.isConnected ? e.entryId === managerIdNum : e.managerId === managerIdNum
      ) || null
    );
  }, [managerIdNum, standings, gameState.isConnected, realStandings]);

  // Get opponent squad (if comparing)
  const opponentSquad = useMemo(
    () =>
      managerIdNum && !gameState.isConnected ? opponentSquadsFixtures[managerIdNum] || null : null,
    [managerIdNum, gameState.isConnected]
  );

  // Prepare standings entries for table (must be before early returns)
  const standingsEntries = useMemo(() => {
    if (!standings) return [];

    if (gameState.isConnected && realStandings) {
      // Map real API standings to LeagueStandingEntry format
      return (realStandings.standings || []).map((s: any) => ({
        managerId: s.entryId,
        currentRank: s.rank,
        previousRank: s.prevRank,
        gameweekPoints: s.eventPoints || 0,
        totalPoints: s.points || s.totalPoints,
        managerName: s.playerName,
        teamName: s.entryName,
      }));
    }

    return standings.entries || [];
  }, [standings, gameState.isConnected, realStandings]);

  // Get current squad
  const currentSquad = fixtures.squad || [];

  // Check for self-comparison (use entryId if connected)
  const currentId = gameState.isConnected ? gameState.connectedEntryId : fixtures.manager.id;
  const isSelfComparison = managerIdNum === currentId;

  // Show loading state
  if (standingsLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }
  if (standingsError && gameState.isConnected) {
    return (
      <Box sx={{ py: ThemeTokens.spacing.lg }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load league standings: {standingsError}
        </Alert>
      </Box>
    );
  }

  // Default route without league id
  if (leagueIdNum === null) {
    if (!resolvedLeagueId) {
      return (
        <Alert severity="info" sx={{ mt: ThemeTokens.spacing.lg }}>
          Connect a Classic League ID to open your league workspace.
        </Alert>
      );
    }
    return <Navigate to={`/premier-league/gameweek/league/${resolvedLeagueId}`} replace />;
  }

  // Error: Invalid league
  if (!leagueData || !standings) {
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
    return <Navigate to={`/premier-league/gameweek/league/${leagueIdNum}`} replace />;
  }

  // Error: Invalid manager
  if (managerIdNum && !opponentManager) {
    return <Navigate to={`/premier-league/gameweek/league/${leagueIdNum}`} replace />;
  }

  // Error: Missing opponent squad data (fixture mode only)
  if (managerIdNum && !gameState.isConnected && !opponentSquad) {
    return (
      <Box>
        <LeagueWorkspaceHeader
          leagues={fixtures.leagues}
          selectedLeagueId={leagueIdNum}
          currentManagerEntry={currentManagerEntry}
          standingsEntryCount={standings.entries?.length || 0}
          workspaceNavigation={<WorkspaceNavigation leagueId={leagueIdNum || 0} />}
        />
        <Box sx={{ py: ThemeTokens.spacing.lg }}>
          <Box sx={{ padding: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              Team data is not available for this manager
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  // LIVE RACE VIEW
  if (isLiveRaceView) {
    return (
      <Box>
        <LeagueWorkspaceHeader
          leagues={gameState.isConnected ? [] : fixtures.leagues}
          selectedLeagueId={leagueIdNum}
          currentManagerEntry={currentManagerEntry}
          standingsEntryCount={standingsEntries.length}
          workspaceNavigation={<WorkspaceNavigation leagueId={leagueIdNum || 0} />}
        />

        <Box sx={{ py: ThemeTokens.spacing.lg }}>
          <LiveLeagueRace
            leagueId={leagueIdNum || 0}
            standings={standings.entries}
            currentManagerId={fixtures.manager.id}
          />
        </Box>
      </Box>
    );
  }

  // STANDINGS VIEW
  if (!managerIdNum) {
    return (
      <Box>
        <LeagueWorkspaceHeader
          leagues={gameState.isConnected ? [] : fixtures.leagues}
          selectedLeagueId={leagueIdNum}
          currentManagerEntry={currentManagerEntry}
          standingsEntryCount={standingsEntries.length}
          workspaceNavigation={<WorkspaceNavigation leagueId={leagueIdNum || 0} />}
        />

        <Box sx={{ py: ThemeTokens.spacing.lg }}>
          {/* Your Position Summary */}
          {currentManagerEntry ? (
            <YourPositionSummary
              currentRank={currentManagerEntry.currentRank}
              totalManagers={standingsEntries.length}
              gameweekPoints={currentManagerEntry.gameweekPoints}
              totalPoints={currentManagerEntry.totalPoints}
            />
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              Your team is outside the currently loaded standings page. The league table is still
              available below.
            </Alert>
          )}

          {/* League Standings Table */}
          <Box sx={{ marginTop: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 850,
                marginBottom: 1.5,
              }}
            >
              League standings
            </Typography>
            <LeagueStandingsTable
              standings={standingsEntries}
              currentManagerId={currentId || fixtures.manager.id}
            />
          </Box>

          {/* Compare Section - Quick Access */}
          <Box
            sx={{
              marginTop: 3,
              padding: { xs: 2, md: 2.5 },
              marginBottom: ThemeTokens.spacing.xxl,
              border: '1px solid #e2e8f0',
              borderRadius: ThemeTokens.borderRadius.lg,
              backgroundColor: '#fff',
              boxShadow: '0 10px 28px rgba(15, 23, 42, 0.06)',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 850,
                marginBottom: 1.5,
              }}
            >
              Compare with a rival
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select another manager to compare squads, captaincy and gameweek performance.
            </Typography>
            <OpponentSelector
              standings={standingsEntries}
              currentManagerId={currentId || fixtures.manager.id}
              leagueId={leagueIdNum || 0}
            />
          </Box>
        </Box>
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
          standingsEntryCount={standingsEntries.length}
          workspaceNavigation={<WorkspaceNavigation leagueId={leagueIdNum || 0} />}
        />

        <Box sx={{ py: ThemeTokens.spacing.lg }}>
          <ManagerHeadToHeadPage
            leagueId={leagueIdNum || 0}
            currentManagerId={currentId || fixtures.manager.id}
            opponentManagerId={managerIdNum}
            standings={standingsEntries}
            currentManagerName={currentManagerEntry.managerName}
            opponentManagerName={opponentManager?.managerName || 'Unknown'}
            currentSquad={currentSquad}
            opponentSquad={opponentSquad || []}
          />
        </Box>
      </Box>
    );
  }

  return null;
};
