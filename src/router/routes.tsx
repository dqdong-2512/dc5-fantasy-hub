import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { CompetitionSelection } from '../app/CompetitionSelection';
import { Dashboard } from '../modules/dashboard/Dashboard';
import { Fixtures } from '../modules/fixtures';
import { Players } from '../modules/players';
import { Analytics } from '../modules/analytics';
import { Fantasy } from '../modules/fantasy';
import { AppLayout } from '../layouts/AppLayout';
import { NotFound } from '../shared/pages';

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
            element: <Players />,
          },
          {
            path: 'analytics',
            element: <Analytics />,
          },
          {
            path: 'fantasy',
            element: <Fantasy />,
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
            element: <Dashboard />,
          },
          {
            path: 'fixtures',
            element: <Fixtures />,
          },
          {
            path: 'players',
            element: <Players />,
          },
          {
            path: 'analytics',
            element: <Analytics />,
          },
          {
            path: 'fantasy',
            element: <Fantasy />,
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
