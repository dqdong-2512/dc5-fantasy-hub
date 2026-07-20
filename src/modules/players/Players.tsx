/**
 * Players Page
 * Browse all FPL players with search, filtering, and sorting
 */

import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Typography,
  Stack,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { PageContainer } from '@shared/components';
import { PlayerRepository } from '@repositories/players';
import { TeamRepository } from '@repositories/teams';
import { PlayerTable } from './components/PlayerTable';
import type { CompetitionType } from '../../types/competition';
import { COMPETITIONS } from '../../types/competition';
import { Position } from '@domain/enums';

type SortField = 'displayName' | 'price' | 'form' | 'totalPoints';

export const Players: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const competition = pathSegments[0] as CompetitionType;
  const competitionInfo = COMPETITIONS[competition];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortField>('totalPoints');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Initialize repositories
  const playerRepo = useMemo(() => new PlayerRepository(), []);
  const teamRepo = useMemo(() => new TeamRepository(), []);

  // Load data
  const allPlayers = useMemo(() => {
    try {
      return playerRepo.getAll();
    } catch (err) {
      console.error('[Players] Error loading players:', err);
      return [];
    }
  }, [playerRepo]);

  const teams = useMemo(() => {
    try {
      return teamRepo.getAll();
    } catch (err) {
      console.error('[Players] Error loading teams:', err);
      return [];
    }
  }, [teamRepo]);

  // Filter and sort players
  const filteredPlayers = useMemo(() => {
    if (!Array.isArray(allPlayers) || allPlayers.length === 0) {
      console.log('[Players] No players to filter');
      return [];
    }

    // Create a copy to avoid mutating the original
    let result: typeof allPlayers = [...allPlayers];

    // Search by name
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.displayName.toLowerCase().includes(query) ||
          p.firstName.toLowerCase().includes(query) ||
          p.lastName.toLowerCase().includes(query)
      );
    }

    // Filter by team
    if (selectedTeam && selectedTeam.trim()) {
      result = result.filter((p) => p.club === selectedTeam);
    }

    // Filter by position
    if (selectedPosition && selectedPosition.trim()) {
      result = result.filter((p) => p.position === selectedPosition);
    }

    // Sort
    if (Array.isArray(result) && result.length > 0) {
      try {
        result = result.sort((a, b) => {
          let aVal: any;
          let bVal: any;

          if (sortBy === 'displayName') {
            aVal = a.displayName;
            bVal = b.displayName;
          } else if (sortBy === 'price') {
            aVal = a.price;
            bVal = b.price;
          } else if (sortBy === 'form') {
            aVal = a.form;
            bVal = b.form;
          } else if (sortBy === 'totalPoints') {
            aVal = a.totalPoints;
            bVal = b.totalPoints;
          }

          // Handle null/undefined values
          if (aVal == null && bVal == null) return 0;
          if (aVal == null) return sortOrder === 'asc' ? 1 : -1;
          if (bVal == null) return sortOrder === 'asc' ? -1 : 1;

          // String comparison
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const comparison = aVal.localeCompare(bVal);
            return sortOrder === 'asc' ? comparison : -comparison;
          }

          // Numeric comparison
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      } catch (err) {
        console.error('[Players] Sort error:', err);
      }
    }

    return result;
  }, [allPlayers, searchQuery, selectedTeam, selectedPosition, sortBy, sortOrder]);

  const handleSort = (field: string, order: 'asc' | 'desc'): void => {
    setSortBy(field as SortField);
    setSortOrder(order);
  };

  // Show loading state if no data yet
  if (allPlayers.length === 0) {
    return (
      <PageContainer>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading players...</Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Players
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {competitionInfo?.name} - Browse and filter all players
        </Typography>
      </Box>

      {/* Filters */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr', md: '2fr 1fr 1fr' },
            gap: 2,
          }}
        >
          {/* Search */}
          <TextField
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            size="small"
            variant="outlined"
          />

          {/* Team Filter */}
          <FormControl size="small">
            <Select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value as string)}
              displayEmpty
            >
              <MenuItem value="">All Teams</MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.name}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Position Filter */}
          <FormControl size="small">
            <Select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Positions</MenuItem>
              <MenuItem value={Position.Goalkeeper}>Goalkeeper</MenuItem>
              <MenuItem value={Position.Defender}>Defender</MenuItem>
              <MenuItem value={Position.Midfielder}>Midfielder</MenuItem>
              <MenuItem value={Position.Forward}>Forward</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Results Summary */}
        <Typography variant="caption" color="textSecondary">
          Showing {filteredPlayers.length} of {allPlayers.length} players
        </Typography>
      </Stack>

      {/* Players Table */}
      {filteredPlayers.length === 0 ? (
        <Alert severity="info">No players match your filters. Try adjusting your search.</Alert>
      ) : (
        <PlayerTable
          players={filteredPlayers}
          onRowClick={(player) => {
            console.log('Clicked player:', player.id);
            // Future: navigate to player detail page
          }}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}
    </PageContainer>
  );
};
