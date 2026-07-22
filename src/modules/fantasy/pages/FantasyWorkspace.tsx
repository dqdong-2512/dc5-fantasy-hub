/**
 * Fantasy Workspace
 * Main interface for connected Fantasy Game user
 * Shows personal team, leagues, and overview
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Tabs, Tab, Stack, Alert, FormControl, Select, MenuItem } from '@mui/material';
import type { LiveSquadPerformance } from '@domain/models';
import { FantasyGameRepository } from '@repositories/fantasy';
import { BootstrapRepository } from '@repositories/bootstrap';
import { FantasyGameHeader, FantasyOverview, MyTeam, Leagues } from '../components';
import { PageContent, PageHeader } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import type { UseFantasyGameState } from '../hooks';

export interface FantasyWorkspaceProps {
  gameState: UseFantasyGameState;
}

/**
 * Fantasy Workspace Component
 */
export function FantasyWorkspace({ gameState }: FantasyWorkspaceProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState(0);
  const [liveSquadPerformance, setLiveSquadPerformance] = useState<LiveSquadPerformance | null>(
    null
  );
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [selectedGameweek, setSelectedGameweek] = useState<number | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stable repository instance (memoized to prevent recreation on every render)
  const repository = useMemo(() => new FantasyGameRepository(), []);
  const bootstrapRepository = useMemo(() => new BootstrapRepository(), []);
  const bootstrap = useMemo(() => bootstrapRepository.getBootstrap(), [bootstrapRepository]);

  // Determine initial gameweek (current or most recent finished)
  const initialGameweek = useMemo(() => {
    let gw = bootstrap.gameweeks.find((g) => !g.finished);
    if (!gw && bootstrap.gameweeks.length > 0) {
      gw = bootstrap.gameweeks[bootstrap.gameweeks.length - 1];
    }
    return gw?.id ?? null;
  }, [bootstrap]);

  // Initialize selected gameweek
  useEffect(() => {
    if (selectedGameweek === null && initialGameweek !== null) {
      setSelectedGameweek(initialGameweek);
    }
  }, [initialGameweek, selectedGameweek]);

  // Load live squad performance for selected gameweek
  useEffect(() => {
    if (!gameState.connectedEntryId || selectedGameweek === null) return;

    const loadLiveSquad = async () => {
      try {
        setIsLoadingLive(true);
        setLiveError(null);

        const performance = await repository.getLiveSquadPerformance(
          gameState.connectedEntryId!,
          selectedGameweek,
          new Map() // Could enrich with player map if available
        );

        setLiveSquadPerformance(performance);
        setLastUpdated(new Date());
      } catch (err) {
        setLiveError(err instanceof Error ? err.message : 'Failed to load live data');
      } finally {
        setIsLoadingLive(false);
      }
    };

    loadLiveSquad();
  }, [gameState.connectedEntryId, selectedGameweek, repository]);

  const handleChangeTeam = () => {
    gameState.disconnectEntry();
  };

  const handleDisconnect = () => {
    gameState.disconnectEntry();
  };

  const handleRefreshLive = async () => {
    if (isRefreshing || !gameState.connectedEntryId || selectedGameweek === null) return;

    try {
      setIsRefreshing(true);
      const performance = await repository.getLiveSquadPerformance(
        gameState.connectedEntryId,
        selectedGameweek,
        new Map()
      );
      setLiveSquadPerformance(performance);
      setLastUpdated(new Date());
      setLiveError(null);
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : 'Failed to refresh live data');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <PageContent>
      <PageHeader
        sx={{ paddingBottom: ThemeTokens.spacing.xs, marginBottom: ThemeTokens.spacing.xs }}
      >
        <FantasyGameHeader
          entry={gameState.entry}
          gameweekHistory={gameState.history}
          onChangeTeam={handleChangeTeam}
          onDisconnect={handleDisconnect}
        />
      </PageHeader>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: ThemeTokens.spacing.xs }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
            },
          }}
        >
          <Tab label="Overview" />
          <Tab label="My Team" />
          <Tab label="Leagues" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Stack spacing={ThemeTokens.spacing.sm}>
        {gameState.error && (
          <Alert severity="error" onClose={() => gameState.clearError()}>
            {gameState.error}
          </Alert>
        )}

        {/* Overview Tab */}
        {activeTab === 0 && (
          <FantasyOverview
            entry={gameState.entry}
            history={gameState.history}
            isLoading={gameState.isLoading}
          />
        )}

        {/* My Team Tab */}
        {activeTab === 1 && (
          <Stack spacing={ThemeTokens.spacing.lg}>
            {/* Gameweek Selector */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={selectedGameweek ?? ''}
                onChange={(e) => setSelectedGameweek(Number(e.target.value))}
                displayEmpty
              >
                {bootstrap.gameweeks.map((gw) => (
                  <MenuItem key={gw.id} value={gw.id}>
                    GW {gw.id}
                    {gw.finished && ' — Final'}
                    {!gw.finished && ' — Live'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Live squad performance */}
            <MyTeam
              livePerformance={liveSquadPerformance}
              isLoading={isLoadingLive}
              error={liveError}
              lastUpdated={lastUpdated}
              onRefresh={handleRefreshLive}
              isRefreshing={isRefreshing}
            />
          </Stack>
        )}

        {/* Leagues Tab */}
        {activeTab === 2 && (
          <Leagues
            entry={gameState.entry}
            isLoading={gameState.isLoading}
            connectedEntryId={gameState.connectedEntryId}
            selectedGameweek={selectedGameweek}
          />
        )}
      </Stack>
    </PageContent>
  );
}
