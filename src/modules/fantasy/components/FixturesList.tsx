/**
 * Fixtures List Component
 * Displays gameweek fixtures with status
 */

import React, { useMemo } from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { FixtureRepository } from '@repositories/fixtures';
import { ThemeTokens } from '@shared/theme/tokens';

export interface FixturesListProps {
  gameweekId: number;
}

export const FixturesList: React.FC<FixturesListProps> = ({ gameweekId }) => {
  const fixtures = useMemo(() => {
    try {
      const repo = new FixtureRepository();
      return repo.getByGameweek(gameweekId).sort((a, b) => {
        // Sort: finished -> in progress -> upcoming
        const statusOrder = (f: any) => {
          if (f.finished) return 2;
          if (f.started) return 1;
          return 0;
        };
        return statusOrder(b) - statusOrder(a);
      });
    } catch {
      return [];
    }
  }, [gameweekId]);

  const counts = useMemo(() => {
    return {
      finished: fixtures.filter((f) => f.finished).length,
      live: fixtures.filter((f) => f.started && !f.finished).length,
      upcoming: fixtures.filter((f) => !f.started && !f.finished).length,
      total: fixtures.length,
    };
  }, [fixtures]);

  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString);
      const hours = date.getHours().toString().padStart(2, '0');
      const mins = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${mins}`;
    } catch {
      return timeString;
    }
  };

  const getStatusChip = (fixture: any) => {
    if (fixture.finished) {
      return (
        <Chip label="Finished" size="small" sx={{ backgroundColor: '#4caf50', color: '#fff' }} />
      );
    }
    if (fixture.started) {
      return <Chip label="Live" size="small" sx={{ backgroundColor: '#ff9800', color: '#fff' }} />;
    }
    return (
      <Chip label="Upcoming" size="small" sx={{ backgroundColor: '#1976d2', color: '#fff' }} />
    );
  };

  if (fixtures.length === 0) {
    return null;
  }

  return (
    <Box sx={{ marginBottom: ThemeTokens.spacing.md }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          marginBottom: 1.5,
          fontSize: '1rem',
        }}
      >
        Gameweek {gameweekId} Fixtures
      </Typography>

      {/* Fixture Progress Summary */}
      <Box sx={{ marginBottom: 2, padding: 2, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <Typography sx={{ fontSize: '0.9rem', color: '#666', marginBottom: 1 }}>
          {counts.total} Fixtures
        </Typography>
        <Stack direction="row" spacing={1}>
          <Typography sx={{ fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600 }}>{counts.finished}</span> Finished •
          </Typography>
          <Typography sx={{ fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600 }}>{counts.live}</span> Live •
          </Typography>
          <Typography sx={{ fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600 }}>{counts.upcoming}</span> Upcoming
          </Typography>
        </Stack>
      </Box>

      {/* Fixtures List */}
      <Stack spacing={1.5}>
        {fixtures.map((fixture) => (
          <Box
            key={fixture.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 1.5,
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              '&:hover': { backgroundColor: '#fafafa' },
            }}
          >
            {/* Teams and Score */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
                {fixture.homeTeam.name}{' '}
                <span style={{ fontWeight: 700 }}>
                  {fixture.homeTeamScore !== null ? fixture.homeTeamScore : '—'}
                </span>
                {' — '}
                <span style={{ fontWeight: 700 }}>
                  {fixture.awayTeamScore !== null ? fixture.awayTeamScore : '—'}
                </span>{' '}
                {fixture.awayTeam.name}
              </Typography>
            </Box>

            {/* Time / Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {!fixture.started && !fixture.finished && (
                <Typography
                  sx={{ fontSize: '0.85rem', color: '#666', minWidth: '45px', textAlign: 'right' }}
                >
                  {formatTime(fixture.kickoffTime)}
                </Typography>
              )}
              {getStatusChip(fixture)}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};
