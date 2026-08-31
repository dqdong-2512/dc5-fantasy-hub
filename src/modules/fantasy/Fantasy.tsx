/**
 * Fantasy Game Module
 * Personal FPL workspace for connected users
 * Displays team, picks, and leagues
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useFantasyGame } from './hooks';
import {
  FantasyWorkspace,
  MyTeamPage,
  LeagueStandingsPage,
  GameweekCenterPage,
  TransferPlannerPage,
  GameweekPlannerPage,
  SeasonPlannerPage,
} from './pages';

export const Fantasy: React.FC = () => {
  const gameState = useFantasyGame();
  const location = useLocation();

  // Connected - Show Workspace
  if (gameState.isConnected) {
    return <FantasyWorkspace gameState={gameState} />;
  }

  // Home owns the connection experience; the Gameweek root starts at My Team.
  const isRootPath = location.pathname === '/premier-league/gameweek';
  if (isRootPath) {
    return <Navigate to="/premier-league/gameweek/my-team" replace />;
  }

  // Redirect /leagues (without ID) to primary league
  if (location.pathname === '/premier-league/gameweek/league') {
    const primaryLeagueId = gameState.entry?.joinedLeaguesIds[0];
    return primaryLeagueId ? (
      <Navigate to={`/premier-league/gameweek/league/${primaryLeagueId}`} replace />
    ) : (
      <Navigate to="/premier-league/home" replace />
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

  return <Navigate to="/premier-league/home" replace />;
};
