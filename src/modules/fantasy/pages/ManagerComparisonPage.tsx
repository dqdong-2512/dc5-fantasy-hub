/**
 * Legacy manager-comparison entry point.
 *
 * Runtime squad comparison is rendered by LeagueStandingsPage. Keeping this
 * redirect avoids reintroducing the old fixture-backed comparison screen.
 */

import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

export const ManagerComparisonPage: React.FC = () => {
  const { leagueId, managerId } = useParams<{ leagueId: string; managerId: string }>();

  if (leagueId && managerId) {
    return (
      <Navigate
        to={`/premier-league/gameweek/league/${leagueId}/managers/${managerId}`}
        replace
      />
    );
  }

  return <Navigate to="/premier-league/gameweek/league" replace />;
};
