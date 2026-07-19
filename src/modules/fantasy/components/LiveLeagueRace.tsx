/**
 * Live League Race Main Component
 * Orchestrates league race data and renders all sections
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Box, Alert, CircularProgress, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { ThemeTokens } from '@shared/theme/tokens';
import { GameweekCenterService } from '../services/GameweekCenterService';
import { LeagueRaceService } from '../services/LeagueRaceService';
import {
  MyRaceSummary,
  NearestRivals,
  LeagueRaceTable,
  GameweekMovers,
  CaptainRace,
  LiveLeagueRaceGameweekSelector,
} from './live-league-race';
import type { LeagueStandingEntry } from '../types';
import type { CaptainRaceEntry } from '@domain/models';
import { GameweekStatus } from '@domain/models';

export interface LiveLeagueRaceProps {
  leagueId: number;
  standings: LeagueStandingEntry[];
  currentManagerId: number;
}

export const LiveLeagueRace: React.FC<LiveLeagueRaceProps> = ({
  leagueId,
  standings,
  currentManagerId,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [captainRaceEntries, setCaptainRaceEntries] = useState<CaptainRaceEntry[]>([]);
  const [isCaptainLoading, setIsCaptainLoading] = useState(false);

  const gameweekCenterService = useMemo(() => new GameweekCenterService(), []);
  const leagueRaceService = useMemo(() => new LeagueRaceService(), []);

  // Get gameweek from query parameter or use latest
  const selectedGameweek = useMemo(() => {
    const gw = searchParams.get('gw');
    if (gw) {
      const gwNum = parseInt(gw, 10);
      if (!isNaN(gwNum)) {
        return gwNum;
      }
    }

    // Fall back to latest available gameweek with race data
    const availableGameweekIds = leagueRaceService.getAvailableGameweeks(
      [37, 38] // Hardcoded available gameweeks with snapshot data
    );

    return availableGameweekIds.length > 0
      ? availableGameweekIds[availableGameweekIds.length - 1]
      : null;
  }, [searchParams, leagueRaceService]);

  // Update URL if gameweek parameter missing
  useEffect(() => {
    if (selectedGameweek && !searchParams.get('gw')) {
      setSearchParams({ gw: String(selectedGameweek) });
    }
  }, [selectedGameweek, searchParams, setSearchParams]);

  // Get gameweek data and status
  const gameweekData = useMemo(() => {
    if (!selectedGameweek) {
      return null;
    }

    return gameweekCenterService.getGameweekCenterData(selectedGameweek, currentManagerId);
  }, [selectedGameweek, gameweekCenterService, currentManagerId]);

  const dataStatus = useMemo((): 'live' | 'final' | 'snapshot' | 'upcoming' => {
    if (!gameweekData) {
      return 'upcoming';
    }

    // Map GameweekStatus to LeagueRace status
    if (gameweekData.status === GameweekStatus.Finished) {
      return 'final';
    }
    if (gameweekData.status === GameweekStatus.InProgress) {
      return 'live';
    }
    return 'upcoming';
  }, [gameweekData]);

  // Build league race entries
  const raceEntries = useMemo(() => {
    if (!selectedGameweek) {
      return [];
    }

    return leagueRaceService.buildLeagueRaceEntries(standings, selectedGameweek, dataStatus);
  }, [standings, selectedGameweek, dataStatus, leagueRaceService]);

  // Get current manager metrics
  const myMetrics = useMemo(() => {
    return leagueRaceService.getManagerMetrics(raceEntries, currentManagerId);
  }, [raceEntries, currentManagerId, leagueRaceService]);

  // Get nearest rivals
  const nearestRivals = useMemo(() => {
    return leagueRaceService.getNearestRivals(raceEntries, currentManagerId, 2);
  }, [raceEntries, currentManagerId, leagueRaceService]);

  // Get gameweek movers
  const movers = useMemo(() => {
    return leagueRaceService.getGameweekMovers(raceEntries);
  }, [raceEntries, leagueRaceService]);

  // Load captain race entries
  useEffect(() => {
    const loadCaptainRace = async (): Promise<void> => {
      setIsCaptainLoading(true);
      try {
        const entries = await leagueRaceService.buildCaptainRaceEntries(raceEntries, 5);
        setCaptainRaceEntries(entries);
      } catch {
        // Silently fail if captain data unavailable
      } finally {
        setIsCaptainLoading(false);
      }
    };

    if (raceEntries.length > 0) {
      loadCaptainRace();
    }
  }, [raceEntries, leagueRaceService]);

  // Handle invalid gameweek
  if (!selectedGameweek) {
    return (
      <Box sx={{ p: ThemeTokens.spacing.md }}>
        <Alert severity="warning">
          Race data is not available for the selected gameweek. Please select another gameweek.
        </Alert>
      </Box>
    );
  }

  // Handle no standings
  if (standings.length === 0) {
    return (
      <Box sx={{ p: ThemeTokens.spacing.md }}>
        <Alert severity="info">League standings data is not available.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: ThemeTokens.spacing.lg }}>
      {/* Gameweek Selector Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: ThemeTokens.spacing.md,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          Live League Race
        </Typography>
        <LiveLeagueRaceGameweekSelector
          selectedGameweek={selectedGameweek}
          dataStatus={dataStatus}
        />
      </Box>

      {/* My Race Summary */}
      {myMetrics && <MyRaceSummary metrics={myMetrics} />}

      {/* Desktop: Nearest Rivals and Gameweek Movers side-by-side */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: ThemeTokens.spacing.lg,
        }}
      >
        {/* Nearest Rivals */}
        <Box>
          <NearestRivals rivals={nearestRivals} />
        </Box>

        {/* Gameweek Movers */}
        <Box>
          <GameweekMovers movers={movers} />
        </Box>
      </Box>

      {/* League Race Table */}
      <LeagueRaceTable
        entries={raceEntries}
        currentManagerId={currentManagerId}
        leagueId={leagueId}
      />

      {/* Captain Race */}
      {isCaptainLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: ThemeTokens.spacing.lg }}>
          <CircularProgress />
        </Box>
      ) : (
        <CaptainRace entries={captainRaceEntries} />
      )}
    </Box>
  );
};
