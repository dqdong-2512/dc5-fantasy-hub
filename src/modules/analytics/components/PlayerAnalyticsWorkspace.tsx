/**
 * Main Analytics Workspace Component
 * Orchestrates all analytics views and player intelligence
 */

import React, { useMemo, useState, useCallback } from 'react';
import { Box, Tabs, Tab, Typography, CircularProgress, Alert } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { PageContainer, PageHeader, PageContent } from '@shared/components';
import type { Player } from '@domain/models';
import { PlayerRepository } from '@repositories/players';
import { BootstrapRepository } from '@repositories/bootstrap';
import { PlayerAnalyticsService } from '../services/player-analytics.service';
import { ShortlistService } from '../services/shortlist.service';
import { PlayerFilterBar } from './PlayerFilterBar';
import { PlayerAnalyticsTable } from './PlayerAnalyticsTable';
import { PlayerInsight } from './PlayerInsight';
import { PlayerComparison } from './PlayerComparison';
import type { PlayerFilterConfig } from '../types';

const DEFAULT_FILTERS: PlayerFilterConfig = {
  search: '',
  sortBy: 'overall',
  sortOrder: 'desc',
};

type ViewType =
  'overview' | 'form' | 'value' | 'differentials' | 'fixtures' | 'shortlist' | 'transfer_targets';

interface ViewConfig {
  id: ViewType;
  label: string;
  description: string;
}

const VIEWS: ViewConfig[] = [
  { id: 'overview', label: 'Overview', description: 'Top players across all metrics' },
  { id: 'form', label: 'Form', description: 'Players in hot form' },
  { id: 'value', label: 'Value', description: 'Best points per pound' },
  { id: 'differentials', label: 'Differentials', description: 'High performers, low ownership' },
  { id: 'fixtures', label: 'Fixtures', description: 'Good fixture runs ahead' },
  { id: 'shortlist', label: 'Shortlist', description: 'Saved players' },
  { id: 'transfer_targets', label: 'Transfer Targets', description: 'Recommended signings' },
];

export const PlayerAnalyticsWorkspace: React.FC = () => {
  const playerRepository = useMemo(() => new PlayerRepository(), []);
  const bootstrapRepository = useMemo(() => new BootstrapRepository(), []);
  const shortlistService = useMemo(() => new ShortlistService(), []);

  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [filters, setFilters] = useState<PlayerFilterConfig>(DEFAULT_FILTERS);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [insightOpen, setInsightOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [currentManagerSquadIds] = useState<Set<number>>(new Set());

  // Load data
  const { allPlayers, isLoading, error } = useMemo(() => {
    try {
      const players = playerRepository.getAll();
      // const gw = bootstrapRepository.getCurrentGameweek();
      return {
        allPlayers: players,
        isLoading: false,
        error: null,
      };
    } catch (err) {
      console.error('Error loading player data:', err);
      return {
        allPlayers: [],
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }, [playerRepository, bootstrapRepository]);

  // Build analytics for current view
  const analyticsService = useMemo(
    () => new PlayerAnalyticsService(Array.from(currentManagerSquadIds)),
    [currentManagerSquadIds]
  );

  const viewData = useMemo(() => {
    if (allPlayers.length === 0) return { players: [], count: 0 };

    let players = [...allPlayers];

    // Apply filters
    if (filters.search) {
      const query = filters.search.toLowerCase();
      players = players.filter(
        (p) => p.displayName.toLowerCase().includes(query) || p.club.toLowerCase().includes(query)
      );
    }

    if (filters.position) {
      players = players.filter((p) => p.position === filters.position);
    }

    if (filters.team) {
      players = players.filter((p) => p.club === filters.team);
    }

    if (filters.priceMin !== undefined) {
      players = players.filter((p) => p.price / 10 >= filters.priceMin!);
    }

    if (filters.priceMax !== undefined) {
      players = players.filter((p) => p.price / 10 <= filters.priceMax!);
    }

    if (filters.minutesMin) {
      players = players.filter((p) => p.minutesPlayed >= filters.minutesMin!);
    }

    // Build analytics for filtered players
    const analytics = analyticsService.buildAllAnalytics(players);

    // Filter by view
    let viewFiltered = analytics;

    switch (activeView) {
      case 'form':
        viewFiltered = analytics.sort((a, b) => b.formScore - a.formScore).slice(0, 20);
        break;

      case 'value':
        viewFiltered = analytics.sort((a, b) => b.valueScore - a.valueScore).slice(0, 20);
        break;

      case 'differentials':
        viewFiltered = analytics
          .filter((a) => a.isDifferential && a.minutesPlayed >= 500)
          .sort((a, b) => b.differentialScore - a.differentialScore)
          .slice(0, 20);
        break;

      case 'fixtures':
        viewFiltered = analytics.sort((a, b) => b.fixtureScore - a.fixtureScore).slice(0, 20);
        break;

      case 'shortlist':
        const shortlistedIds = shortlistService.getShortlistedPlayerIds();
        viewFiltered = analytics.filter((a) => shortlistedIds.includes(a.playerId));
        break;

      case 'transfer_targets':
        viewFiltered = analyticsService
          .findTransferTargets(players, 5.5, 20)
          .map((p) => analyticsService.buildAnalyticsRecord(playerRepository.getById(p.playerId)!))
          .filter((a) => !!a);
        break;

      case 'overview':
      default:
        viewFiltered = analytics.sort((a, b) => b.overallScore - a.overallScore).slice(0, 20);
        break;
    }

    // Apply sorting
    if (filters.sortBy && filters.sortOrder) {
      viewFiltered = [...viewFiltered].sort((a, b) => {
        let aVal = 0;
        let bVal = 0;

        switch (filters.sortBy) {
          case 'form':
            aVal = a.formScore;
            bVal = b.formScore;
            break;
          case 'value':
            aVal = a.valueScore;
            bVal = b.valueScore;
            break;
          case 'differential':
            aVal = a.differentialScore;
            bVal = b.differentialScore;
            break;
          case 'fixtures':
            aVal = a.fixtureScore;
            bVal = b.fixtureScore;
            break;
          case 'overall':
          default:
            aVal = a.overallScore;
            bVal = b.overallScore;
            break;
        }

        return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return { players: viewFiltered, count: analytics.length };
  }, [allPlayers, activeView, filters, analyticsService, playerRepository, shortlistService]);

  const handlePlayerSelect = useCallback(
    (playerId: number) => {
      const player = playerRepository.getById(playerId);
      if (player) {
        setSelectedPlayer(player);
        setInsightOpen(true);
      }
    },
    [playerRepository]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  return (
    <Box>
      {/* Header */}
      <PageHeader>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Player Analytics & Transfer Intelligence
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ marginTop: ThemeTokens.spacing.sm }}
        >
          Comprehensive player analysis for transfer planning
        </Typography>
      </PageHeader>

      <PageContent sx={{ padding: ThemeTokens.spacing.xs }}>
        {/* View Tabs */}
        <Box sx={{ borderBottom: '1px solid #e0e0e0', marginBottom: ThemeTokens.spacing.md }}>
          <Tabs
            value={activeView}
            onChange={(_, value) => setActiveView(value as ViewType)}
            sx={{
              '& .MuiTab-root': {
                fontSize: '0.9rem',
                fontWeight: 600,
                textTransform: 'none',
                minWidth: '120px',
              },
            }}
          >
            {VIEWS.map((view) => (
              <Tab key={view.id} label={view.label} value={view.id} />
            ))}
          </Tabs>
        </Box>

        {/* Filters */}
        <Box sx={{ marginBottom: ThemeTokens.spacing.lg }}>
          <PlayerFilterBar
            filters={filters}
            onFiltersChange={setFilters}
            onReset={handleResetFilters}
            compact
          />
        </Box>

        {/* Player Table */}
        <Box sx={{ marginBottom: ThemeTokens.spacing.xs }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ marginBottom: ThemeTokens.spacing.md }}
          >
            Showing {viewData.players.length} of {viewData.count} players
          </Typography>

          {viewData.players.length === 0 ? (
            <Alert severity="info">
              No players match your filters. Try adjusting your criteria.
            </Alert>
          ) : (
            <PlayerAnalyticsTable
              players={viewData.players}
              onPlayerClick={handlePlayerSelect}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSort={(field, order) =>
                setFilters({
                  ...filters,
                  sortBy: field as PlayerFilterConfig['sortBy'],
                  sortOrder: order,
                })
              }
            />
          )}
        </Box>
      </PageContent>

      {/* Player Insight Drawer */}
      {selectedPlayer && (
        <PlayerInsight
          player={selectedPlayer}
          open={insightOpen}
          onClose={() => setInsightOpen(false)}
          isInMyTeam={currentManagerSquadIds.has(selectedPlayer.id)}
          onCompare={() => {
            setInsightOpen(false);
            setComparisonOpen(true);
          }}
        />
      )}

      {/* Player Comparison Dialog */}
      <PlayerComparison
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        players={allPlayers}
      />
    </Box>
  );
};
