import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { CompetitionSelection } from '../app/CompetitionSelection';
import { Dashboard } from '../modules/dashboard/Dashboard';
import { Fixtures } from '../modules/fixtures';
import {
  PlayerComparePage,
  PlayerDetailPage,
  PlayerExplorer,
  PlayerResearchHub,
} from '../modules/players';
import {
  CaptainPage,
  FixturesPage,
  OverviewPage,
  TeamPage,
  TransfersPage,
} from '../modules/analytics/pages';
import { ClubExplorer } from '../modules/teams';
import {
  FantasyGameOverview,
  MyTeamPage,
  LeagueStandingsPage,
  GameweekCenterPage,
  TransferPlannerPage,
  GameweekPlannerPage,
  SeasonPlannerPage,
  GameweekHubShell,
  PremierLeagueTablePage,
} from '../modules/fantasy/pages';
import { FplConnectionGate } from '../modules/fantasy/components';
import { GameweekHubProvider } from '../modules/fantasy/context';
import { AppLayout } from '../layouts/AppLayout';
import { NotFound, ChampionsLeagueComingSoon } from '../shared/pages';

// Lazy load Analytics module to reduce initial bundle size
const Analytics = React.lazy(() =>
  import('../modules/analytics/Analytics').then((module) => ({ default: module.Analytics }))
);

// Loading fallback component
const AnalyticsLoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
    <CircularProgress size={40} />
  </Box>
);

const LegacyFantasyRedirect: React.FC = () => {
  const location = useLocation();
  const nextPath = location.pathname.replace(
    '/premier-league/fantasy-game',
    '/premier-league/gameweek'
  );

  return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <CompetitionSelection />,
      },
      {
        path: 'premier-league',
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'players',
            element: <PlayerResearchHub />,
            children: [
              {
                index: true,
                element: <PlayerExplorer />,
              },
              {
                path: 'compare',
                element: <PlayerComparePage />,
              },
              {
                path: ':playerId',
                element: <PlayerDetailPage />,
              },
            ],
          },
          {
            path: 'analytics',
            element: (
              <Suspense fallback={<AnalyticsLoadingFallback />}>
                <Analytics />
              </Suspense>
            ),
            children: [
              {
                index: true,
                element: <Navigate to="overview" replace />,
              },
              {
                path: 'overview',
                element: <OverviewPage />,
              },
              {
                path: 'captain',
                element: <CaptainPage />,
              },
              {
                path: 'transfers',
                element: <TransfersPage />,
              },
              {
                path: 'fixtures',
                element: <FixturesPage />,
              },
              {
                path: 'team',
                element: <TeamPage />,
              },
            ],
          },
          {
            path: 'gameweek',
            element: (
              <GameweekHubProvider>
                <GameweekHubShell />
              </GameweekHubProvider>
            ),
            children: [
              {
                index: true,
                element: <Navigate to="overview" replace />,
              },
              {
                path: 'overview',
                element: <FantasyGameOverview />,
              },
              {
                path: 'connect',
                element: <Navigate to="../overview" replace />,
              },
              {
                path: 'my-team',
                element: (
                  <FplConnectionGate>
                    <MyTeamPage />
                  </FplConnectionGate>
                ),
              },
              {
                path: 'league',
                element: (
                  <FplConnectionGate>
                    <LeagueStandingsPage />
                  </FplConnectionGate>
                ),
              },
              {
                path: 'league/:leagueId',
                element: (
                  <FplConnectionGate>
                    <LeagueStandingsPage />
                  </FplConnectionGate>
                ),
              },
              {
                path: 'league/:leagueId/live',
                element: (
                  <FplConnectionGate>
                    <LeagueStandingsPage />
                  </FplConnectionGate>
                ),
              },
              {
                path: 'league/:leagueId/managers/:managerId',
                element: (
                  <FplConnectionGate>
                    <LeagueStandingsPage />
                  </FplConnectionGate>
                ),
              },
              {
                path: 'fixtures',
                element: <Fixtures />,
              },
              {
                path: 'clubs',
                element: <ClubExplorer />,
              },
              {
                path: 'table',
                element: <PremierLeagueTablePage />,
              },
              {
                path: 'gameweeks',
                element: <Navigate to=".." replace />,
              },
              {
                path: 'team',
                element: <Navigate to="../my-team" replace />,
              },
              {
                path: 'gameweeks/:gameweekId',
                element: <GameweekCenterPage />,
              },
              {
                path: 'transfers',
                element: (
                  <FplConnectionGate>
                    <TransferPlannerPage />
                  </FplConnectionGate>
                ),
              },
              {
                path: 'planner',
                element: (
                  <FplConnectionGate>
                    <GameweekPlannerPage />
                  </FplConnectionGate>
                ),
              },
              {
                path: 'season-planner',
                element: (
                  <FplConnectionGate>
                    <SeasonPlannerPage />
                  </FplConnectionGate>
                ),
              },
              {
                path: 'transfer-planner',
                element: <Navigate to="../transfers" replace />,
              },
              {
                path: 'gameweek-planner',
                element: <Navigate to="../planner" replace />,
              },
              {
                path: 'leagues',
                element: <Navigate to="../league" replace />,
              },
              {
                path: 'leagues/:leagueId',
                element: (
                  <FplConnectionGate>
                    <LeagueStandingsPage />
                  </FplConnectionGate>
                ),
              },
              {
                path: 'leagues/:leagueId/live',
                element: (
                  <FplConnectionGate>
                    <LeagueStandingsPage />
                  </FplConnectionGate>
                ),
              },
              {
                path: 'leagues/:leagueId/managers/:managerId',
                element: (
                  <FplConnectionGate>
                    <LeagueStandingsPage />
                  </FplConnectionGate>
                ),
              },
            ],
          },
          {
            path: 'fixtures',
            element: <Navigate to="gameweek/fixtures" replace />,
          },
          {
            path: 'teams',
            element: <Navigate to="gameweek/clubs" replace />,
          },
          {
            path: 'fantasy-game/*',
            element: <LegacyFantasyRedirect />,
          },
        ],
      },
      {
        path: 'champions-league',
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <ChampionsLeagueComingSoon />,
          },
          {
            path: 'fixtures',
            element: <ChampionsLeagueComingSoon />,
          },
          {
            path: 'players',
            element: <ChampionsLeagueComingSoon />,
          },
          {
            path: 'analytics',
            element: <ChampionsLeagueComingSoon />,
          },
          {
            path: 'fantasy',
            element: <ChampionsLeagueComingSoon />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export const Router: React.FC = () => <RouterProvider router={router} />;
