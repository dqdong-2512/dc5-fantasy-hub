import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { CompetitionSelection } from '../app/CompetitionSelection';
import { Dashboard } from '../modules/dashboard/Dashboard';
import { Fixtures } from '../modules/fixtures';
import { PlayerExplorer } from '../modules/players';
import { ClubExplorer } from '../modules/teams';
import { Analytics } from '../modules/analytics';
import { Fantasy } from '../modules/fantasy';
import { AppLayout } from '../layouts/AppLayout';
import { NotFound, ChampionsLeagueComingSoon } from '../shared/pages';

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
            path: 'fixtures',
            element: <Fixtures />,
          },
          {
            path: 'players',
            element: <PlayerExplorer />,
          },
          {
            path: 'teams',
            element: <ClubExplorer />,
          },
          {
            path: 'analytics',
            element: <Analytics />,
          },
          {
            path: 'fantasy-game',
            element: <Fantasy />,
            children: [
              {
                path: 'team',
                element: <Fantasy />,
              },
              {
                path: 'gameweeks',
                element: <Fantasy />,
              },
              {
                path: 'gameweeks/:gameweekId',
                element: <Fantasy />,
              },
              {
                path: 'transfers',
                element: <Fantasy />,
              },
              {
                path: 'planner',
                element: <Fantasy />,
              },
              {
                path: 'leagues',
                element: <Fantasy />,
              },
              {
                path: 'leagues/:leagueId',
                element: <Fantasy />,
              },
              {
                path: 'leagues/:leagueId/managers/:managerId',
                element: <Fantasy />,
              },
            ],
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
