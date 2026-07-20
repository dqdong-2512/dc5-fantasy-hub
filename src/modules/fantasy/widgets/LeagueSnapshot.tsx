/**
 * League Snapshot Widget
 * Displays user's joined leagues with rank, member count
 * Supports league switching and navigation
 */

import React, { useState } from 'react';
import { Box, Card, Stack, Typography, Button, Select, MenuItem, FormControl } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { ThemeTokens } from '@shared/theme/tokens';
import type { LeagueSnapshotData } from '../services/fantasy-dashboard.service';

interface LeagueSnapshotProps {
  leagues: LeagueSnapshotData;
  onLeagueClick: (leagueId: number) => void;
}

export const LeagueSnapshot: React.FC<LeagueSnapshotProps> = ({ leagues, onLeagueClick }) => {
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(
    leagues.primaryLeagueId ??
      (leagues.joinedLeagues.length > 0 ? leagues.joinedLeagues[0].id : null)
  );

  const selectedLeague = leagues.joinedLeagues.find((l: any) => l.id === selectedLeagueId);

  if (!selectedLeague || leagues.joinedLeagues.length === 0) {
    return (
      <Card
        sx={{
          p: ThemeTokens.spacing.md,
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 1 }}>
          <EmojiEventsIcon sx={{ color: '#ffc107' }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              paddingBottom: 0,
              borderBottom: '2px solid #7c3aed',
              flex: 1,
            }}
          >
            Leagues
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', marginTop: ThemeTokens.spacing.md }}
        >
          No joined leagues
        </Typography>

        <Button
          variant="contained"
          size="small"
          sx={{
            marginTop: ThemeTokens.spacing.md,
            textTransform: 'none',
            backgroundColor: '#f59e0b',
            color: '#fff',
            '&:hover': { backgroundColor: '#d97706' },
          }}
        >
          Explore Leagues
        </Button>
      </Card>
    );
  }

  const handleLeagueChange = (leagueId: number) => {
    setSelectedLeagueId(leagueId);
  };

  const handleViewLeague = () => {
    if (selectedLeagueId) {
      onLeagueClick(selectedLeagueId);
    }
  };

  return (
    <Card
      sx={{
        p: ThemeTokens.spacing.md,
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
      }}
    >
      {/* Header */}
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: ThemeTokens.spacing.md }}
      >
        <EmojiEventsIcon sx={{ color: '#ffc107' }} />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            paddingBottom: 0,
            borderBottom: '2px solid #7c3aed',
            flex: 1,
          }}
        >
          My Leagues
        </Typography>
      </Box>

      {/* League Selection */}
      {leagues.joinedLeagues.length > 1 && (
        <FormControl fullWidth size="small" sx={{ marginBottom: ThemeTokens.spacing.md }}>
          <Select
            value={selectedLeagueId ?? ''}
            onChange={(e) => handleLeagueChange(e.target.value as number)}
            sx={{ fontSize: '0.875rem' }}
          >
            {leagues.joinedLeagues.map((league: any) => (
              <MenuItem key={league.id} value={league.id}>
                {league.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* League Info */}
      {selectedLeague && (
        <Stack spacing={2}>
          {/* League Name */}
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              LEAGUE
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {selectedLeague.name}
            </Typography>
          </Box>

          {/* Rank & Members */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {selectedLeague.rank !== undefined && (
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  YOUR RANK
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  #{selectedLeague.rank}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                MEMBERS
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {selectedLeague.totalMembers}
              </Typography>
            </Box>
          </Box>

          {/* Action */}
          <Button
            variant="contained"
            size="small"
            onClick={handleViewLeague}
            sx={{
              textTransform: 'none',
              backgroundColor: '#f59e0b',
              color: '#fff',
              '&:hover': { backgroundColor: '#d97706' },
              marginTop: ThemeTokens.spacing.sm,
            }}
          >
            View League
          </Button>
        </Stack>
      )}
    </Card>
  );
};
