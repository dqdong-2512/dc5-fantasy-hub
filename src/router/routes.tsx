import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CompetitionSelection } from '../app/CompetitionSelection';
import { Dashboard } from '../modules/dashboard/Dashboard';
import { AppLayout } from '../layouts/AppLayout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <CompetitionSelection />,
  },
  {
    path: '/:competition',
    element: <AppLayout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
    ],
  },
]);

export const Router: React.FC = () => <RouterProvider router={router} />;
