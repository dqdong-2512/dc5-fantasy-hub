/**
 * Player Explorer Page
 * Main interface for exploring and analyzing Fantasy Premier League players
 */

import React, { useState, useMemo } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import type { Player } from '@domain/models';
import { BootstrapRepository } from '@repositories/bootstrap';
import { PlayerRepository } from '@repositories/players';
import { PageContent, PageHeader, PageSection, LoadingState, EmptyState } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import {
  PlayerTable,
  PlayerDetailDrawer,
  FilterToolbar,
  PlayersWithFavorableFixtures,
} from '../components';
import { PlayerFiltersUtil } from '../utils/filters';
import type { PlayerFilters } from '../types';

const DEFAULT_FILTERS: PlayerFilters = {
  search: '',
  positions: [],
  clubs: [],
  priceRange: [0, 15],
  availability: 'all',
  sortBy: 'points',
  sortOrder: 'desc',
};

/**
 * Player Explorer
 * Production-quality analytics interface for player exploration
 */
export function PlayerExplorer(): React.ReactElement {
  const [filters, setFilters] = useState<PlayerFilters>(DEFAULT_FILTERS);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Initialize repositories
  const playerRepository = useMemo(() => new PlayerRepository(), []);
  const bootstrapRepository = useMemo(() => new BootstrapRepository(), []);

  // Load data
  const { allPlayers, gameweek, playerCount } = useMemo(() => {
    try {
      const players = playerRepository.getAll();
      const currentGw = bootstrapRepository.getCurrentGameweek();

      return {
        allPlayers: players,
        gameweek: currentGw,
        playerCount: players.length,
      };
    } catch (error) {
      console.error('Error loading player data:', error);
      return {
        allPlayers: [],
        gameweek: null,
        playerCount: 0,
      };
    }
  }, [playerRepository, bootstrapRepository]);

  // Apply filters and sorting
  const filteredPlayers = useMemo(() => {
    const filtered = PlayerFiltersUtil.applyFilters(allPlayers, filters);
    return PlayerFiltersUtil.sortPlayers(filtered, filters.sortBy, filters.sortOrder);
  }, [allPlayers, filters]);

  const handlePlayerSelect = (player: Player): void => {
    setSelectedPlayer(player);
    setDrawerOpen(true);
  };

  const handleDrawerClose = (): void => {
    setDrawerOpen(false);
  };

  const handleResetFilters = (): void => {
    setFilters(DEFAULT_FILTERS);
  };

  if (!gameweek || playerCount === 0) {
    return (
      <PageContent>
        <LoadingState label="Loading player data..." />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PageHeader>
        <Stack spacing={ThemeTokens.spacing.md}>
          <Typography variant={ThemeTokens.typography.pageTitleVariant} sx={{ fontWeight: 700 }}>
            Player Explorer
          </Typography>
          <Stack
            direction="row"
            spacing={ThemeTokens.spacing.xxl}
            sx={{
              flexWrap: 'wrap',
              '& > div': { minWidth: 150 },
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Competition
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Fantasy Premier League
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Season
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                2025/26
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Current Gameweek
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {gameweek.name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Players
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {playerCount}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </PageHeader>

      <PageSection title="Filter & Search" sx={{ marginBottom: ThemeTokens.spacing.xxl }}>
        <FilterToolbar
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleResetFilters}
        />
      </PageSection>

      <PageSection title="Intelligence" sx={{ marginBottom: ThemeTokens.spacing.xxl }}>
        <PlayersWithFavorableFixtures players={allPlayers} onPlayerSelect={handlePlayerSelect} />
      </PageSection>

      <PageSection
        title="Players"
        subtitle={`Showing ${filteredPlayers.length} of ${playerCount} players`}
        sx={{ marginBottom: ThemeTokens.spacing.xxl }}
      >
        {filteredPlayers.length === 0 ? (
          <EmptyState
            title="No players found"
            description="Try adjusting your filters or search query"
            actionLabel="Reset Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <PlayerTable
            players={filteredPlayers}
            onRowClick={handlePlayerSelect}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSort={(field, order) =>
              setFilters({ ...filters, sortBy: field as PlayerFilters['sortBy'], sortOrder: order })
            }
          />
        )}
      </PageSection>

      {/* Player Detail Drawer */}
      <PlayerDetailDrawer player={selectedPlayer} open={drawerOpen} onClose={handleDrawerClose} />
    </PageContent>
  );
}
