/**
 * League Workspace Header Component
 * Shared header for League Detail and Manager Comparison views
 * Includes back button, league switcher, league summary, and workspace navigation
 */

import React from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
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
        position: 'relative',
        overflow: 'hidden',
        mt: ThemeTokens.spacing.lg,
        padding: { xs: 2.5, md: 3.5 },
        borderRadius: ThemeTokens.borderRadius.lg,
        color: '#fff',
        background: 'linear-gradient(125deg, #37003c 0%, #721477 55%, #087fb8 130%)',
        boxShadow: '0 16px 36px rgba(55, 0, 60, 0.18)',
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 240,
          height: 240,
          right: -56,
          top: -148,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.10)',
        },
      }}
    >
      <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/premier-league/gameweek/overview')}
          sx={{
            alignSelf: 'flex-start',
            p: 0,
            textTransform: 'none',
            color: 'rgba(255,255,255,.82)',
            '&:hover': { backgroundColor: 'transparent', color: '#fff' },
          }}
        >
          Back to overview
        </Button>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'flex-end' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="overline" sx={{ opacity: 0.75, letterSpacing: 1.4 }}>
              Classic league
            </Typography>
            <Typography
              variant="h3"
              sx={{ fontWeight: 850, lineHeight: 1.05, fontSize: { xs: '2rem', md: '2.6rem' } }}
            >
              {selectedLeague?.name || `League ${selectedLeagueId ?? ''}`}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.75, opacity: 0.78 }}>
              Follow the standings, compare rivals and track the live race
            </Typography>
          </Box>

          {leagues.length > 1 && (
            <LeagueSwitcher leagues={leagues} selectedLeagueId={selectedLeagueId} />
          )}
        </Stack>

        {currentManagerEntry && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label={`Your rank #${currentManagerEntry.currentRank}`}
              sx={{ color: '#fff', backgroundColor: 'rgba(255,255,255,.14)', fontWeight: 700 }}
            />
            <Chip
              label={`${standingsEntryCount} managers`}
              sx={{ color: '#fff', backgroundColor: 'rgba(255,255,255,.14)' }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
              <RankMovement
                previousRank={currentManagerEntry.previousRank}
                currentRank={currentManagerEntry.currentRank}
                size="small"
              />
            </Box>
          </Stack>
        )}
      </Stack>

      {workspaceNavigation && (
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            mt: 2.5,
            mx: { xs: -2.5, md: -3.5 },
            mb: { xs: -2.5, md: -3.5 },
            px: { xs: 2.5, md: 3.5 },
            backgroundColor: 'rgba(16, 8, 40, .24)',
          }}
        >
          {workspaceNavigation}
        </Box>
      )}
    </Box>
  );
};
