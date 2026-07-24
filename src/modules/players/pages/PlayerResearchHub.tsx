import React from 'react';
import { Outlet } from 'react-router-dom';
import { PlayerResearchProvider } from '../context';

export function PlayerResearchHub(): React.ReactElement {
  return (
    <PlayerResearchProvider>
      <Outlet />
    </PlayerResearchProvider>
  );
}
