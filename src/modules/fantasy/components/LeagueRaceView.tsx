/**
 * League Race View Component
 * Displays manager progression across gameweeks
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { FplClient } from '@shared/services/fpl-client';
import { LeagueRaceChart } from './LeagueRaceChart';
import type { ChartDataPoint } from './LeagueRaceChart';

export interface LeagueRaceViewProps {
  myEntryId: number;
  opponentEntryId: number;
  myManagerName: string;
  opponentManagerName: string;
  currentGameweek: number;
}

type MetricType = 'totalPoints' | 'rank' | 'gwPoints';

/**
 * League Race visualization showing manager progression
 */
export const LeagueRaceView: React.FC<LeagueRaceViewProps> = ({
  myEntryId,
  opponentEntryId,
  myManagerName,
  opponentManagerName,
  currentGameweek,
}) => {
  const [metric, setMetric] = useState<MetricType>('totalPoints');
  const [myHistory, setMyHistory] = useState<Array<{
    event: number;
    points: number;
    totalPoints: number;
    rank: number;
  }> | null>(null);
  const [opponentHistory, setOpponentHistory] = useState<Array<{
    event: number;
    points: number;
    totalPoints: number;
    rank: number;
  }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load manager history on mount
  useEffect(() => {
    const loadHistory = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const fplClient = new FplClient();

        // Fetch both histories in parallel
        const [myHistoryData, opponentHistoryData] = await Promise.all([
          fplClient.getEntryHistory(myEntryId),
          fplClient.getEntryHistory(opponentEntryId),
        ]);

        // Transform the raw history data
        const transformHistory = (history: typeof myHistoryData) => {
          return history.current.map((h) => ({
            event: h.event,
            points: h.points,
            totalPoints: h.total_points,
            rank: h.overall_rank || h.rank_sort || h.rank || 999999,
          }));
        };

        setMyHistory(transformHistory(myHistoryData));
        setOpponentHistory(transformHistory(opponentHistoryData));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load manager history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [myEntryId, opponentEntryId]);

  // Prepare chart data based on selected metric
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!myHistory || !opponentHistory) return [];

    return myHistory
      .filter((h) => h.event <= currentGameweek)
      .map((myH) => {
        const oppH = opponentHistory.find((h) => h.event === myH.event);

        if (!oppH) {
          return null;
        }

        return {
          gameweek: myH.event,
          myValue:
            metric === 'totalPoints' ? myH.totalPoints : metric === 'rank' ? myH.rank : myH.points,
          opponentValue:
            metric === 'totalPoints'
              ? oppH.totalPoints
              : metric === 'rank'
                ? oppH.rank
                : oppH.points,
        };
      })
      .filter((d): d is ChartDataPoint => d !== null);
  }, [myHistory, opponentHistory, metric, currentGameweek]);

  if (loading) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: ThemeTokens.spacing.lg }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="textSecondary">No history data available</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={ThemeTokens.spacing.lg}>
      {/* Metric Selector */}
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={ThemeTokens.spacing.md}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Race Metric
            </Typography>
            <ToggleButtonGroup
              value={metric}
              exclusive
              onChange={(_, newMetric) => {
                if (newMetric !== null) {
                  setMetric(newMetric);
                }
              }}
              size="small"
            >
              <ToggleButton value="totalPoints">Total Points</ToggleButton>
              <ToggleButton value="gwPoints">Gameweek Points</ToggleButton>
              <ToggleButton value="rank">Rank</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card variant="outlined">
        <CardContent>
          <LeagueRaceChart
            data={chartData}
            metric={metric}
            myManagerName={myManagerName}
            opponentManagerName={opponentManagerName}
          />
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={ThemeTokens.spacing.md}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Final Standings
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: ThemeTokens.spacing.md,
              }}
            >
              {/* My Manager Stats */}
              {myHistory && myHistory.length > 0 && (
                <Box
                  sx={{
                    padding: ThemeTokens.spacing.md,
                    backgroundColor: '#e8f5e9',
                    borderRadius: '4px',
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    {myManagerName}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {myHistory[myHistory.length - 1].totalPoints} pts
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Rank: {myHistory[myHistory.length - 1].rank}
                  </Typography>
                </Box>
              )}

              {/* Opponent Manager Stats */}
              {opponentHistory && opponentHistory.length > 0 && (
                <Box
                  sx={{
                    padding: ThemeTokens.spacing.md,
                    backgroundColor: '#ffebee',
                    borderRadius: '4px',
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    {opponentManagerName}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {opponentHistory[opponentHistory.length - 1].totalPoints} pts
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Rank: {opponentHistory[opponentHistory.length - 1].rank}
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
