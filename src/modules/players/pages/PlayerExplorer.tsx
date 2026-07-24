import React, { useMemo, useState } from 'react';
import { Alert, Box, Pagination, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageContent, EmptyState } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { FilterToolbar, PlayerTable } from '../components';
import { usePlayerResearchData } from '../context';
import type { PlayerFilters } from '../types';
import { applyPlayerFilters, hasActivePlayerFilters, sortPlayers } from '../utils';

const PLAYERS_PER_PAGE = 50;

const DEFAULT_FILTERS: PlayerFilters = {
  search: '',
  position: 'all',
  clubId: 'all',
  priceBand: 'all',
  availability: 'all',
  sortBy: 'totalPoints',
  sortOrder: 'desc',
};

export function PlayerExplorer(): React.ReactElement {
  const navigate = useNavigate();
  const { players, teams, teamById, totalPlayers, seasonState, errorMessage } =
    usePlayerResearchData();

  const [filters, setFilters] = useState<PlayerFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const filteredPlayers = useMemo(
    () => applyPlayerFilters(players, filters, teamById),
    [players, filters, teamById]
  );

  const sortedPlayers = useMemo(
    () => sortPlayers(filteredPlayers, filters.sortBy, filters.sortOrder),
    [filteredPlayers, filters.sortBy, filters.sortOrder]
  );

  const hasActiveFiltersState = useMemo(() => hasActivePlayerFilters(filters), [filters]);

  const totalPages = Math.max(1, Math.ceil(sortedPlayers.length / PLAYERS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PLAYERS_PER_PAGE;
  const paginatedPlayers = sortedPlayers.slice(startIndex, startIndex + PLAYERS_PER_PAGE);

  const handleFiltersChange = (nextFilters: PlayerFilters): void => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handleCompareClick = (playerId: number): void => {
    navigate(`/premier-league/players/compare?players=${playerId}`);
  };

  if (errorMessage) {
    return (
      <PageContent>
        <EmptyState
          title="Data unavailable"
          description={errorMessage}
          actionLabel="Back to Dashboard"
          onAction={() => navigate('/premier-league/dashboard')}
        />
      </PageContent>
    );
  }

  if (totalPlayers === 0) {
    return (
      <PageContent>
        <EmptyState
          title="No players available"
          description="The active season player dataset is empty. Sync data and try again."
        />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <Stack spacing={ThemeTokens.spacing.md}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Player Explorer
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Discover and evaluate players for your next transfer decision.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Season mode: {seasonState === 'pre-season' ? 'Pre-season' : 'In season'}
          </Typography>
        </Box>

        <FilterToolbar
          filters={filters}
          teams={teams}
          hasActiveFilters={hasActiveFiltersState}
          onFiltersChange={handleFiltersChange}
          onReset={() => handleFiltersChange(DEFAULT_FILTERS)}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Showing {sortedPlayers.length} of {totalPlayers} players
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Sort: {filters.sortBy} ({filters.sortOrder})
          </Typography>
        </Box>

        {sortedPlayers.length === 0 ? (
          <EmptyState
            title="No players match filters"
            description="Adjust search or filters to widen the player pool."
            actionLabel="Clear filters"
            onAction={() => handleFiltersChange(DEFAULT_FILTERS)}
          />
        ) : (
          <>
            <PlayerTable
              players={paginatedPlayers}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSort={(field, order) =>
                handleFiltersChange({ ...filters, sortBy: field, sortOrder: order })
              }
              onRowClick={(player) => navigate(`/premier-league/players/${player.id}`)}
              onCompareClick={(player) => handleCompareClick(player.id)}
            />

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  page={currentPage}
                  count={totalPages}
                  size="small"
                  onChange={(_, nextPage) => setPage(nextPage)}
                />
              </Box>
            )}
          </>
        )}

        {seasonState === 'pre-season' && (
          <Alert severity="info">
            Pre-season data can include many players with zero form or points. This is expected and
            still useful for researching price, position, club, ownership, and availability.
          </Alert>
        )}

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Alert severity="info" sx={{ flex: 1, minWidth: 240 }}>
            Tip: open a player to inspect fixtures and trends before comparing options.
          </Alert>
          <Alert severity="info" sx={{ flex: 1, minWidth: 240 }}>
            Compare route supports shareable URLs for two-player research.
          </Alert>
        </Stack>
      </Stack>
    </PageContent>
  );
}
