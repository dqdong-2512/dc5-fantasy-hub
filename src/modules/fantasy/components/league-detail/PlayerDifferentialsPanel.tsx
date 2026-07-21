/**
 * Player Differentials Panel Component
 * Analyzes differences between My Team and Opponent
 * Shows which players create/destroy league position advantage
 */

import React, { useMemo } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Alert,
  Chip,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { PlayerRepository } from '@repositories/players';
import { DifferentialsService, type PlayerDifferential } from '@modules/fantasy/services';

export interface PlayerDifferentialsPanelProps {
  myPicks: any;
  opponentPicks: any;
  myEnrichedPicks: any;
  opponentEnrichedPicks: any;
}

export const PlayerDifferentialsPanel: React.FC<PlayerDifferentialsPanelProps> = ({
  myPicks,
  opponentPicks,
  myEnrichedPicks,
  opponentEnrichedPicks,
}) => {
  const [tabValue, setTabValue] = React.useState(0);
  const playerRepo = useMemo(() => new PlayerRepository(), []);

  const analysis = useMemo(() => {
    if (!myPicks || !opponentPicks) return null;
    return DifferentialsService.analyzeDifferentials(
      myPicks,
      opponentPicks,
      myEnrichedPicks,
      opponentEnrichedPicks
    );
  }, [myPicks, opponentPicks, myEnrichedPicks, opponentEnrichedPicks]);

  const enrichDifferential = (diff: PlayerDifferential): PlayerDifferential => {
    const player = playerRepo.getById(diff.playerId);
    return {
      ...diff,
      playerName: player?.displayName || `Player ${diff.playerId}`,
      team: player?.club || '—',
    };
  };

  if (!analysis) {
    return (
      <Card sx={{ padding: ThemeTokens.spacing.md }}>
        <Typography color="textSecondary">Select an opponent to compare</Typography>
      </Card>
    );
  }

  const commonPlayers = analysis.commonPlayers.map(enrichDifferential);
  const myDifferentials = analysis.myDifferentials.map(enrichDifferential);
  const opponentDifferentials = analysis.opponentDifferentials.map(enrichDifferential);

  const DifferentialRow = ({
    diff,
    showBoth = true,
  }: {
    diff: PlayerDifferential;
    showBoth?: boolean;
  }) => (
    <TableRow
      sx={{
        backgroundColor:
          diff.pointsDifference > 0 ? '#f1f8e9' : diff.pointsDifference < 0 ? '#ffebee' : '#fff',
      }}
    >
      <TableCell>
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{diff.playerName}</Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#666' }}>{diff.team}</Typography>
        </Box>
      </TableCell>
      {showBoth && (
        <>
          <TableCell align="center">
            <Box>
              <Typography sx={{ fontWeight: 600 }}>{diff.myEffectivePoints}</Typography>
              {diff.myIsCaptain && <Chip label="C" size="small" sx={{ mt: 0.25 }} />}
              {diff.myIsViceCaptain && <Chip label="V" size="small" sx={{ mt: 0.25 }} />}
            </Box>
          </TableCell>
          <TableCell align="center">
            <Box>
              <Typography sx={{ fontWeight: 600 }}>{diff.opponentEffectivePoints}</Typography>
              {diff.opponentIsCaptain && <Chip label="C" size="small" sx={{ mt: 0.25 }} />}
              {diff.opponentIsViceCaptain && <Chip label="V" size="small" sx={{ mt: 0.25 }} />}
            </Box>
          </TableCell>
          <TableCell align="center">
            <Typography
              sx={{
                fontWeight: 700,
                color:
                  diff.pointsDifference > 0
                    ? '#4caf50'
                    : diff.pointsDifference < 0
                      ? '#d32f2f'
                      : '#666',
              }}
            >
              {diff.pointsDifference > 0 ? '+' : ''}
              {diff.pointsDifference}
            </Typography>
          </TableCell>
        </>
      )}
      {!showBoth && (
        <TableCell align="center">
          <Typography
            sx={{ fontWeight: 700, color: diff.pointsDifference > 0 ? '#4caf50' : '#d32f2f' }}
          >
            {diff.pointsDifference > 0 ? '+' : ''}
            {diff.pointsDifference}
          </Typography>
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <Card sx={{ padding: ThemeTokens.spacing.md }}>
      <Stack spacing={ThemeTokens.spacing.md}>
        {/* Header */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.sm }}>
            Player Comparison
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Analyzing player selection and captain choices
          </Typography>
        </Box>

        {/* Summary */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: ThemeTokens.spacing.md,
            padding: ThemeTokens.spacing.md,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
          }}
        >
          <Box>
            <Typography variant="caption" color="textSecondary">
              My Total Points
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#4caf50' }}>
              {analysis.totalMyPoints}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Opponent Points
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#d32f2f' }}>
              {analysis.totalOpponentPoints}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary">
              Advantage
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1.5rem',
                color:
                  analysis.totalMyPoints > analysis.totalOpponentPoints ? '#4caf50' : '#d32f2f',
              }}
            >
              {analysis.totalMyPoints - analysis.totalOpponentPoints > 0 ? '+' : ''}
              {analysis.totalMyPoints - analysis.totalOpponentPoints}
            </Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: '1px solid #e0e0e0' }}>
          <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
            <Tab label={`Common Players (${commonPlayers.length})`} />
            <Tab label={`My Differentials (${myDifferentials.length})`} />
            <Tab label={`Opponent Differentials (${opponentDifferentials.length})`} />
          </Tabs>
        </Box>

        {/* Common Players Tab */}
        {tabValue === 0 && (
          <Box sx={{ overflowX: 'auto' }}>
            {commonPlayers.length === 0 ? (
              <Alert severity="info">No common players between teams</Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Player</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      My Points
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Opponent
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Difference
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commonPlayers.map((diff: PlayerDifferential) => (
                    <DifferentialRow key={diff.playerId} diff={diff} showBoth={true} />
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}

        {/* My Differentials Tab */}
        {tabValue === 1 && (
          <Box sx={{ overflowX: 'auto' }}>
            {myDifferentials.length === 0 ? (
              <Alert severity="info">No players helping your league position</Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Player</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      My Points
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Advantage
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myDifferentials.map((diff: PlayerDifferential) => (
                    <DifferentialRow key={diff.playerId} diff={diff} showBoth={false} />
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}

        {/* Opponent Differentials Tab */}
        {tabValue === 2 && (
          <Box sx={{ overflowX: 'auto' }}>
            {opponentDifferentials.length === 0 ? (
              <Alert severity="info">No players hurting your league position</Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Player</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Their Points
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Your Disadvantage
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opponentDifferentials.map((diff: PlayerDifferential) => (
                    <TableRow key={diff.playerId} sx={{ backgroundColor: '#ffebee' }}>
                      <TableCell>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {diff.playerName}
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: '#666' }}>
                            {diff.team}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>
                            {diff.opponentEffectivePoints}
                          </Typography>
                          {diff.opponentIsCaptain && (
                            <Chip label="C" size="small" sx={{ mt: 0.25 }} />
                          )}
                          {diff.opponentIsViceCaptain && (
                            <Chip label="V" size="small" sx={{ mt: 0.25 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontWeight: 700, color: '#d32f2f' }}>
                          -{Math.abs(diff.pointsDifference)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
        )}
      </Stack>
    </Card>
  );
};
