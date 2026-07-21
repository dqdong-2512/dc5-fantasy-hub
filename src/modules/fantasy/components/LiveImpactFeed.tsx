/**
 * Live Impact Feed Component
 * Shows recent live changes in fantasy impact
 * Prioritizes useful fantasy impact over raw football events
 */

import React, { useMemo } from 'react';
import {
  Card,
  Box,
  Typography,
  Stack,
  Chip,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Alert,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { LiveGameweekPerformance } from '@shared/services';

export interface DifferentialImpactEvent {
  playerId: number;
  playerName: string;
  teamName: string;
  myMultiplier: number;
  opponentMultiplier: number;
  playerBasePoints: number;
  impact: number; // Positive = helps me
  description: string;
  timestamp: string;
}

export interface LiveImpactFeedProps {
  myPerformance: LiveGameweekPerformance | null;
  opponentPerformance: LiveGameweekPerformance | null;
  isLoading?: boolean;
}

export const LiveImpactFeed: React.FC<LiveImpactFeedProps> = ({
  myPerformance,
  opponentPerformance,
  isLoading = false,
}) => {
  // Generate impact events from performance data
  const impactEvents = useMemo(() => {
    if (!myPerformance || !opponentPerformance) return [];

    // Create player maps for quick lookup
    const myPlayerMap = new Map<
      number,
      { name: string; basePoints: number; multiplier: number; teamName: string }
    >();
    const opponentPlayerMap = new Map<
      number,
      { name: string; basePoints: number; multiplier: number; teamName: string }
    >();

    // Populate maps
    [...myPerformance.starters.players, ...myPerformance.bench.players].forEach((p) => {
      myPlayerMap.set(p.playerId, {
        name: p.playerName,
        basePoints: p.basePoints,
        multiplier: p.multiplier,
        teamName: p.teamName,
      });
    });

    [...opponentPerformance.starters.players, ...opponentPerformance.bench.players].forEach((p) => {
      opponentPlayerMap.set(p.playerId, {
        name: p.playerName,
        basePoints: p.basePoints,
        multiplier: p.multiplier,
        teamName: p.teamName,
      });
    });

    // Find all players
    const allPlayerIds = new Set([...myPlayerMap.keys(), ...opponentPlayerMap.keys()]);

    // Calculate impact for each player
    const events: DifferentialImpactEvent[] = Array.from(allPlayerIds)
      .map((playerId) => {
        const myData = myPlayerMap.get(playerId) || {
          name: 'Unknown',
          basePoints: 0,
          multiplier: 0,
          teamName: 'Unknown',
        };
        const opponentData = opponentPlayerMap.get(playerId) || {
          name: 'Unknown',
          basePoints: 0,
          multiplier: 0,
          teamName: 'Unknown',
        };

        const impact = (myData.multiplier - opponentData.multiplier) * myData.basePoints;

        return {
          playerId,
          playerName: myData.name,
          teamName: myData.teamName,
          myMultiplier: myData.multiplier,
          opponentMultiplier: opponentData.multiplier,
          playerBasePoints: myData.basePoints,
          impact,
          description: getImpactDescription(
            myData.name,
            myData.multiplier,
            opponentData.multiplier,
            myData.basePoints,
            impact
          ),
          timestamp: new Date().toISOString(),
        };
      })
      .filter((e) => e.impact !== 0)
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
      .slice(0, 10); // Top 10 impacts

    return events;
  }, [myPerformance, opponentPerformance]);

  // Calculate net impact
  const totalImpact = useMemo(
    () => impactEvents.reduce((sum, e) => sum + e.impact, 0),
    [impactEvents]
  );

  if (isLoading) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md }}>
        <Typography color="textSecondary">Loading live impact...</Typography>
      </Card>
    );
  }

  if (!myPerformance || !opponentPerformance) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md }}>
        <Typography color="textSecondary">Select an opponent to see live impact</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ padding: 0, overflow: 'hidden' }}>
      <Box sx={{ padding: ThemeTokens.spacing.md, borderBottom: '1px solid #e0e0e0' }}>
        <Stack sx={{ direction: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Live Impact Feed
          </Typography>
          <Chip
            label={`${totalImpact > 0 ? '+' : ''}${totalImpact}`}
            color={totalImpact > 0 ? 'success' : totalImpact < 0 ? 'error' : 'default'}
            variant="outlined"
          />
        </Stack>
        <Typography variant="caption" color="textSecondary" sx={{ marginTop: 0.5 }}>
          {myPerformance.gameStatus === 'live'
            ? 'Live points update'
            : myPerformance.isFinished
              ? 'Gameweek finished'
              : 'Upcoming gameweek'}
        </Typography>
      </Box>

      {impactEvents.length === 0 ? (
        <Box sx={{ padding: ThemeTokens.spacing.md, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            No differential impact yet
          </Typography>
        </Box>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableBody>
              {impactEvents.map((event) => (
                <TableRow key={event.playerId} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  {/* Player name and team */}
                  <TableCell sx={{ padding: '12px 8px', minWidth: '150px' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {event.playerName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {event.teamName}
                    </Typography>
                  </TableCell>

                  {/* My team multiplier */}
                  <TableCell sx={{ padding: '12px 8px', textAlign: 'center', minWidth: '80px' }}>
                    <Stack sx={{ alignItems: 'center', spacing: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getMultiplierLabel(event.myMultiplier)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        My Team
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Opponent multiplier */}
                  <TableCell sx={{ padding: '12px 8px', textAlign: 'center', minWidth: '80px' }}>
                    <Stack sx={{ alignItems: 'center', spacing: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getMultiplierLabel(event.opponentMultiplier)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Opp
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Points */}
                  <TableCell sx={{ padding: '12px 8px', textAlign: 'center', minWidth: '70px' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {event.playerBasePoints} pts
                    </Typography>
                  </TableCell>

                  {/* Net impact */}
                  <TableCell sx={{ padding: '12px 8px', textAlign: 'right', minWidth: '70px' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: event.impact > 0 ? '#4caf50' : '#d32f2f',
                      }}
                    >
                      {event.impact > 0 ? '+' : ''}
                      {event.impact}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Impact explanation */}
      {totalImpact !== 0 && (
        <Box sx={{ padding: ThemeTokens.spacing.md, backgroundColor: '#f9f9f9' }}>
          <Alert severity={totalImpact > 0 ? 'success' : 'warning'} sx={{ marginBottom: 1 }}>
            {totalImpact > 0
              ? `You're ahead by ${totalImpact} points from differential ownership and captaincy`
              : `You're behind by ${Math.abs(totalImpact)} points from differential ownership and captaincy`}
          </Alert>
          <Typography variant="caption" color="textSecondary">
            <strong>How this works:</strong> Impact = (Your multiplier - Opponent's multiplier) ×
            Player's points
          </Typography>
        </Box>
      )}
    </Card>
  );
};

/**
 * Helper: Format multiplier as label
 */
function getMultiplierLabel(multiplier: number): string {
  if (multiplier === 3) return '×3';
  if (multiplier === 2) return '×2';
  if (multiplier === 1) return '×1';
  if (multiplier === 0) return 'Bench';
  return '-';
}

/**
 * Helper: Generate human-readable impact description
 */
function getImpactDescription(
  playerName: string,
  myMultiplier: number,
  opponentMultiplier: number,
  _points: number,
  impact: number
): string {
  const myLabel = getMultiplierLabel(myMultiplier);
  const oppLabel = getMultiplierLabel(opponentMultiplier);

  if (impact > 0) {
    return `${playerName}: ${myLabel} (you) vs ${oppLabel} (opp) = +${impact}`;
  } else {
    return `${playerName}: ${myLabel} (you) vs ${oppLabel} (opp) = ${impact}`;
  }
}
