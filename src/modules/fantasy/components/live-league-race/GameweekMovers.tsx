/**
 * Gameweek Movers Component
 * Displays biggest riser, biggest faller, and best gameweek score
 */

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { LeagueMovers } from '@domain/models';

export interface GameweekMoversProps {
  movers: LeagueMovers | null;
}

interface MoverCardProps {
  title: string;
  manager: string;
  team: string;
  metric: string;
  color?: string;
}

const MoverCard: React.FC<MoverCardProps> = ({
  title,
  manager,
  team,
  metric,
  color = '#1976d2',
}) => (
  <Paper
    sx={{
      p: ThemeTokens.spacing.md,
      textAlign: 'center',
      backgroundColor: '#fafafa',
    }}
  >
    <Typography
      variant="caption"
      sx={{
        color: '#999',
        fontWeight: 600,
        display: 'block',
        mb: 1,
      }}
    >
      {title}
    </Typography>
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: '1rem',
        mb: 0.5,
      }}
    >
      {manager}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        color: '#999',
        display: 'block',
        mb: 1,
      }}
    >
      {team}
    </Typography>
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: '1.1rem',
        color,
      }}
    >
      {metric}
    </Typography>
  </Paper>
);

const EmptyCard: React.FC<{ title: string }> = ({ title }) => (
  <Paper
    sx={{
      p: ThemeTokens.spacing.md,
      textAlign: 'center',
      backgroundColor: '#fafafa',
    }}
  >
    <Typography
      variant="caption"
      sx={{
        color: '#999',
        fontWeight: 600,
        display: 'block',
        mb: 1,
      }}
    >
      {title}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: '#bbb',
        fontStyle: 'italic',
      }}
    >
      N/A
    </Typography>
  </Paper>
);

export const GameweekMovers: React.FC<GameweekMoversProps> = ({ movers }) => {
  if (!movers) {
    return null;
  }

  return (
    <Box sx={{ mb: ThemeTokens.spacing.lg }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: ThemeTokens.spacing.md,
          fontSize: '0.95rem',
        }}
      >
        Gameweek Movers
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: ThemeTokens.spacing.md,
        }}
      >
        <Box>
          {movers.biggestRiser ? (
            <MoverCard
              title="Biggest Riser"
              manager={movers.biggestRiser.managerName}
              team={movers.biggestRiser.teamName}
              metric={`↑ ${movers.biggestRiser.rankMovement}`}
              color="#4caf50"
            />
          ) : (
            <EmptyCard title="Biggest Riser" />
          )}
        </Box>

        <Box>
          {movers.biggestFaller ? (
            <MoverCard
              title="Biggest Faller"
              manager={movers.biggestFaller.managerName}
              team={movers.biggestFaller.teamName}
              metric={`↓ ${Math.abs(movers.biggestFaller.rankMovement)}`}
              color="#f44336"
            />
          ) : (
            <EmptyCard title="Biggest Faller" />
          )}
        </Box>

        <Box>
          {movers.bestGameweekScore ? (
            <MoverCard
              title="Best GW Score"
              manager={movers.bestGameweekScore.managerName}
              team={movers.bestGameweekScore.teamName}
              metric={`${movers.bestGameweekScore.gameweekPoints} pts`}
              color="#ff9800"
            />
          ) : (
            <EmptyCard title="Best GW Score" />
          )}
        </Box>
      </Box>
    </Box>
  );
};
