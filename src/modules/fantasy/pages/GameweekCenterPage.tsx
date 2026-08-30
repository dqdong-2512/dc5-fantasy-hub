import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { LiveMatchCenterPage } from './LiveMatchCenterPage';

export const GameweekCenterPage: React.FC = () => {
  const { gameweekId } = useParams<{ gameweekId: string }>();
  const selectedGameweek = useMemo(() => {
    const parsed = Number(gameweekId);
    return Number.isInteger(parsed) && parsed > 0 && parsed <= 38 ? parsed : undefined;
  }, [gameweekId]);

  return <LiveMatchCenterPage gameweekId={selectedGameweek} />;
};
