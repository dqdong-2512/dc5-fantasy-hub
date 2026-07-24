/**
 * Fantasy Game Module
 * Personal FPL workspace for connected users
 * Displays team, picks, and leagues
 */

import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useFantasyGame } from './hooks';
import {
  FantasyWorkspace,
  FantasyGameOverview,
  MyTeamPage,
  LeagueStandingsPage,
  GameweekCenterPage,
  TransferPlannerPage,
  GameweekPlannerPage,
  SeasonPlannerPage,
} from './pages';
import { fantasyGameFixtures } from './fixtures';

export const Fantasy: React.FC = () => {
  const gameState = useFantasyGame();
  const location = useLocation();
  const fixtures = useMemo(() => fantasyGameFixtures, []);

  // Connected - Show Workspace
  if (gameState.isConnected) {
    return <FantasyWorkspace gameState={gameState} />;
  }

  // Not connected - route rendering falls back to overview, which now contains inline connection.
  const isRootPath = location.pathname === '/premier-league/gameweek';
  if (isRootPath) {
    return <FantasyGameOverview />;
  }

  // Redirect /leagues (without ID) to primary league
  if (location.pathname === '/premier-league/gameweek/league') {
    return (
      <Navigate
        to={`/premier-league/gameweek/league/${fixtures.manager.primaryLeagueId}`}
        replace
      />
    );
  }

  // Check for season planner page
  if (location.pathname.includes('/season-planner')) {
    return <SeasonPlannerPage />;
  }

  // Check for gameweek planner page
  if (location.pathname.includes('/planner')) {
    return <GameweekPlannerPage />;
  }

  // Check for transfer planner page
  if (location.pathname.includes('/transfers')) {
    return <TransferPlannerPage />;
  }

  // Check for gameweek center page
  if (location.pathname.includes('/gameweeks/')) {
    return <GameweekCenterPage />;
  }

  // Check for league workspace (handles both standings and manager comparison)
  if (location.pathname.includes('/leagues/')) {
    return <LeagueStandingsPage />;
  }

  // Check for team page
  if (location.pathname.includes('/team')) {
    return <MyTeamPage />;
  }

  // Show the Fantasy Game Overview with fixture data
  // This allows UI development and testing before real entry connection
  return <FantasyGameOverview />;
};
