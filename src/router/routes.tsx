import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useLocation } from 'react-router-dom';
import { Box, Skeleton, Stack } from '@mui/material';
import { CompetitionSelection } from '../app/CompetitionSelection';
import {
  CaptainPage,
  DifferentialsPage,
  FixturesPage,
  FormPage,
  OverviewPage,
  TeamPage,
  TransfersPage,
  ValuePage,
} from '../modules/analytics/pages';
import { FplConnectionGate } from '../modules/fantasy/components';
import { GameweekHubProvider } from '../modules/fantasy/context';
import { AppLayout } from '../layouts/AppLayout';
import { NotFound, ChampionsLeagueComingSoon } from '../shared/pages';

const Dashboard = React.lazy(() =>
  import('../modules/dashboard/Dashboard').then((module) => ({ default: module.Dashboard }))
);
const PlayerResearchHub = React.lazy(() =>
  import('../modules/players').then((module) => ({ default: module.PlayerResearchHub }))
);
const PlayerExplorer = React.lazy(() =>
  import('../modules/players').then((module) => ({ default: module.PlayerExplorer }))
);
const PlayerComparePage = React.lazy(() =>
  import('../modules/players').then((module) => ({ default: module.PlayerComparePage }))
);
const PlayerDetailPage = React.lazy(() =>
  import('../modules/players').then((module) => ({ default: module.PlayerDetailPage }))
);
const ClubExplorer = React.lazy(() =>
  import('../modules/teams').then((module) => ({ default: module.ClubExplorer }))
);

const GameweekHubShell = React.lazy(() =>
  import('../modules/fantasy/pages').then((module) => ({ default: module.GameweekHubShell }))
);
const FantasyGameOverview = React.lazy(() =>
  import('../modules/fantasy/pages').then((module) => ({ default: module.FantasyGameOverview }))
);
const MyTeamPage = React.lazy(() =>
  import('../modules/fantasy/pages').then((module) => ({ default: module.MyTeamPage }))
);
const LeagueStandingsPage = React.lazy(() =>
  import('../modules/fantasy/pages').then((module) => ({ default: module.LeagueStandingsPage }))
);
const GameweekCenterPage = React.lazy(() =>
  import('../modules/fantasy/pages').then((module) => ({ default: module.GameweekCenterPage }))
);
const LiveMatchCenterPage = React.lazy(() =>
  import('../modules/fantasy/pages').then((module) => ({ default: module.LiveMatchCenterPage }))
);
const TransferPlannerPage = React.lazy(() =>
  import('../modules/fantasy/pages').then((module) => ({ default: module.TransferPlannerPage }))
);
const GameweekPlannerPage = React.lazy(() =>
  import('../modules/fantasy/pages').then((module) => ({ default: module.GameweekPlannerPage }))
);
const SeasonPlannerPage = React.lazy(() =>
  import('../modules/fantasy/pages').then((module) => ({ default: module.SeasonPlannerPage }))
);
const PremierLeagueTablePage = React.lazy(() =>
  import('../modules/fantasy/pages').then((module) => ({ default: module.PremierLeagueTablePage }))
);

// Lazy load Analytics module to reduce initial bundle size
const Analytics = React.lazy(() =>
  import('../modules/analytics/Analytics').then((module) => ({ default: module.Analytics }))
);

const RouteLoadingFallback = () => (
  <Box sx={{ minHeight: '400px', p: 2 }}>
    <Stack spacing={1}>
      <Skeleton variant="text" width="28%" height={40} />
      <Skeleton variant="text" width="42%" />
      <Skeleton variant="rounded" height={120} />
      <Skeleton variant="rounded" height={120} />
      <Skeleton variant="rounded" height={120} />
    </Stack>
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
            element: (
              <Suspense fallback={<RouteLoadingFallback />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: 'players',
            element: (
              <Suspense fallback={<RouteLoadingFallback />}>
                <PlayerResearchHub />
              </Suspense>
            ),
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <PlayerExplorer />
                  </Suspense>
                ),
              },
              {
                path: 'compare',
                element: (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <PlayerComparePage />
                  </Suspense>
                ),
              },
              {
                path: ':playerId',
                element: (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <PlayerDetailPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'analytics',
            element: (
              <Suspense fallback={<RouteLoadingFallback />}>
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
                path: 'form',
                element: <FormPage />,
              },
              {
                path: 'differentials',
                element: <DifferentialsPage />,
              },
              {
                path: 'value',
                element: <ValuePage />,
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
                <Suspense fallback={<RouteLoadingFallback />}>
                  <GameweekHubShell />
                </Suspense>
              </GameweekHubProvider>
            ),
            children: [
              {
                index: true,
                element: <Navigate to="overview" replace />,
              },
              {
                path: 'overview',
                element: (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <FantasyGameOverview />
                  </Suspense>
                ),
              },
              {
                path: 'connect',
                element: <Navigate to="../overview" replace />,
              },
              {
                path: 'my-team',
                element: (
                  <FplConnectionGate>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <MyTeamPage />
                    </Suspense>
                  </FplConnectionGate>
                ),
              },
              {
                path: 'league',
                element: (
                  <FplConnectionGate>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <LeagueStandingsPage />
                    </Suspense>
                  </FplConnectionGate>
                ),
              },
              {
                path: 'league/:leagueId',
                element: (
                  <FplConnectionGate>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <LeagueStandingsPage />
                    </Suspense>
                  </FplConnectionGate>
                ),
              },
              {
                path: 'league/:leagueId/live',
                element: (
                  <FplConnectionGate>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <LeagueStandingsPage />
                    </Suspense>
                  </FplConnectionGate>
                ),
              },
              {
                path: 'league/:leagueId/managers/:managerId',
                element: (
                  <FplConnectionGate>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <LeagueStandingsPage />
                    </Suspense>
                  </FplConnectionGate>
                ),
              },
              {
                path: 'fixtures',
                element: (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <LiveMatchCenterPage />
                  </Suspense>
                ),
              },
              {
                path: 'clubs',
                element: (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <ClubExplorer />
                  </Suspense>
                ),
              },
              {
                path: 'table',
                element: (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <PremierLeagueTablePage />
                  </Suspense>
                ),
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
                element: (
                  <Suspense fallback={<RouteLoadingFallback />}>
                    <GameweekCenterPage />
                  </Suspense>
                ),
              },
              {
                path: 'transfers',
                element: (
                  <FplConnectionGate>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <TransferPlannerPage />
                    </Suspense>
                  </FplConnectionGate>
                ),
              },
              {
                path: 'planner',
                element: (
                  <FplConnectionGate>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <GameweekPlannerPage />
                    </Suspense>
                  </FplConnectionGate>
                ),
              },
              {
                path: 'season-planner',
                element: (
                  <FplConnectionGate>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <SeasonPlannerPage />
                    </Suspense>
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
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <LeagueStandingsPage />
                    </Suspense>
                  </FplConnectionGate>
                ),
              },
              {
                path: 'leagues/:leagueId/live',
                element: (
                  <FplConnectionGate>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <LeagueStandingsPage />
                    </Suspense>
                  </FplConnectionGate>
                ),
              },
              {
                path: 'leagues/:leagueId/managers/:managerId',
                element: (
                  <FplConnectionGate>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <LeagueStandingsPage />
                    </Suspense>
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
