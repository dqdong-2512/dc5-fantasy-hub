/**
 * Fantasy Workspace
 * Main interface for connected Fantasy Game user
 * Shows personal team, leagues, and overview
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Tabs, Tab, Stack, Alert } from '@mui/material';
import type { FantasyGameweekHistory, FantasyGameweekPicks } from '@domain/models';
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
  const [history, setHistory] = useState<FantasyGameweekHistory[] | null>(null);
  const [picks, setPicks] = useState<FantasyGameweekPicks | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingPicks, setIsLoadingPicks] = useState(false);

  const [picksError, setPicksError] = useState<string | null>(null);

  const repository = new FantasyGameRepository();
  const bootstrapRepository = useMemo(() => new BootstrapRepository(), []);

  // Load history
  useEffect(() => {
    if (!gameState.connectedEntryId) return;

    const loadHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const data = await repository.getEntryHistory(gameState.connectedEntryId!);
        setHistory(data);
      } catch (err) {
        // History loading failed silently, will retry on refresh
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [gameState.connectedEntryId, repository]);

  // Load picks for relevant gameweek
  useEffect(() => {
    if (!gameState.connectedEntryId) return;

    const loadPicks = async () => {
      try {
        setIsLoadingPicks(true);
        setPicksError(null);

        // Determine relevant gameweek
        const bootstrap = bootstrapRepository.getBootstrap();
        let targetGameweek = bootstrap.gameweeks.find((gw) => !gw.finished);
        if (!targetGameweek && bootstrap.gameweeks.length > 0) {
          targetGameweek = bootstrap.gameweeks[bootstrap.gameweeks.length - 1];
        }

        if (!targetGameweek) {
          setPicksError('No gameweek data available');
          return;
        }

        const picksData = await repository.getEntryPicks(
          gameState.connectedEntryId!,
          targetGameweek.id
        );
        setPicks(picksData);
      } catch (err) {
        setPicksError(err instanceof Error ? err.message : 'Failed to load picks');
      } finally {
        setIsLoadingPicks(false);
      }
    };

    loadPicks();
  }, [gameState.connectedEntryId, bootstrapRepository, repository]);

  const handleChangeTeam = () => {
    gameState.disconnectEntry();
  };

  const handleDisconnect = () => {
    gameState.disconnectEntry();
  };

  return (
    <PageContent>
      <PageHeader>
        <FantasyGameHeader
          entry={gameState.entry}
          onChangeTeam={handleChangeTeam}
          onDisconnect={handleDisconnect}
        />
      </PageHeader>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: ThemeTokens.spacing.lg }}>
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
      <Stack spacing={ThemeTokens.spacing.xl}>
        {gameState.error && (
          <Alert severity="error" onClose={() => gameState.clearError()}>
            {gameState.error}
          </Alert>
        )}

        {/* Overview Tab */}
        {activeTab === 0 && (
          <FantasyOverview
            entry={gameState.entry}
            history={history}
            isLoading={gameState.isLoading || isLoadingHistory}
          />
        )}

        {/* My Team Tab */}
        {activeTab === 1 && <MyTeam picks={picks} isLoading={isLoadingPicks} error={picksError} />}

        {/* Leagues Tab */}
        {activeTab === 2 && (
          <Leagues
            entry={gameState.entry}
            isLoading={gameState.isLoading}
            connectedEntryId={gameState.connectedEntryId}
          />
        )}
      </Stack>
    </PageContent>
  );
}
