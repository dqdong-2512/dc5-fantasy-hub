/**
 * Legacy league-list entry point.
 *
 * League discovery, switching and standings now live in the runtime-backed
 * League workspace, so this page only preserves backwards-compatible links.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

export const MyLeaguesPage: React.FC = () => (
  <Navigate to="/premier-league/gameweek/league" replace />
);
