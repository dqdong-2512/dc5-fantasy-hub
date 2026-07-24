/**
 * League Workspace Header Component
 * Shared header for League Detail and Manager Comparison views
 * Includes back button, league switcher, league summary, and workspace navigation
 */

import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ThemeTokens } from '@shared/theme/tokens';
import { LeagueSwitcher, RankMovement } from './';
import type { FantasyLeagueFixture, LeagueStandingEntry } from '../types';

export interface LeagueWorkspaceHeaderProps {
  leagues: FantasyLeagueFixture[];
  selectedLeagueId: number | null;
  currentManagerEntry: LeagueStandingEntry | null;
  standingsEntryCount: number;
  workspaceNavigation?: React.ReactNode;
}

export const LeagueWorkspaceHeader: React.FC<LeagueWorkspaceHeaderProps> = ({
  leagues,
  selectedLeagueId,
  currentManagerEntry,
  standingsEntryCount,
  workspaceNavigation,
}) => {
  const navigate = useNavigate();
  const selectedLeague = selectedLeagueId ? leagues.find((l) => l.id === selectedLeagueId) : null;

  return (
    <Box
      sx={{
        padding: ThemeTokens.spacing.xs,
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/premier-league/gameweek')}
        sx={{
          textTransform: 'none',
          marginBottom: 1.5,
          color: '#1976d2',
          padding: 0,
          '&:hover': { backgroundColor: 'transparent' },
        }}
      >
        Back to Fantasy Game
      </Button>

      {/* League Header Row - Title and Switcher */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 1.5, sm: 2 },
          marginBottom: 1,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            flex: 1,
          }}
        >
          {selectedLeague?.name || 'League'}
        </Typography>

        {/* League Switcher */}
        <LeagueSwitcher leagues={leagues} selectedLeagueId={selectedLeagueId} />
      </Box>

      {/* League Summary Info - Compact Row */}
      {currentManagerEntry && (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: workspaceNavigation ? 2 : 0,
          }}
        >
          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
            Rank{' '}
            <Typography component="span" sx={{ fontWeight: 600, color: '#333' }}>
              #{currentManagerEntry.currentRank}
            </Typography>
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
            -
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
            {standingsEntryCount} Managers
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
            -
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <RankMovement
              previousRank={currentManagerEntry.previousRank}
              currentRank={currentManagerEntry.currentRank}
              size="small"
            />
          </Box>
        </Box>
      )}

      {/* Workspace Navigation */}
      {workspaceNavigation && <Box>{workspaceNavigation}</Box>}
    </Box>
  );
};
