/**
 * Players with Favorable Fixtures Component
 * Displays players with positive fixture conditions
 * Uses deterministic criteria: form + avg FDR + minutes played
 */

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Avatar,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import type { Player } from '@domain/models';
import type { PlayerWithFixtureIntelligence } from '../types';
import { ThemeTokens } from '@shared/theme/tokens';
import { getPlayerImageUrl, getTeamBadgeUrl } from '@shared/assets';
import { getDifficultyColor } from '@shared/presentation/fixture-formats';
import { PlayerFixtureIntelligenceService } from '../services';
import { Position } from '@domain/enums';

export interface PlayersWithFavorableFixturesProps {
  players: Player[];
  onPlayerSelect?: (player: Player) => void;
}

/**
 * Players with Favorable Fixtures
 * Shows a curated list of players with good upcoming schedules
 */
export function PlayersWithFavorableFixtures({
  players,
  onPlayerSelect,
}: PlayersWithFavorableFixturesProps): React.ReactElement {
  const fixtureService = useMemo(() => new PlayerFixtureIntelligenceService(), []);

  const favorablePlayers = useMemo(
    () => fixtureService.findPlayersWithFavorableFixtures(players, 5),
    [players, fixtureService]
  );

  const getPositionLabel = (position: string): string => {
    const positionMap: Record<string, string> = {
      [Position.Goalkeeper]: 'GK',
      [Position.Defender]: 'DEF',
      [Position.Midfielder]: 'MID',
      [Position.Forward]: 'FWD',
    };
    return positionMap[position] || position;
  };

  const getFormColor = (form: number): string => {
    if (form >= 6) return '#2e7d32'; // dark green
    if (form >= 5) return '#4caf50'; // green
    if (form >= 4) return '#ff9800'; // amber
    return '#d32f2f'; // red
  };

  if (favorablePlayers.length === 0) {
    return (
      <Card>
        <CardHeader
          title="Players with Favorable Fixtures"
          subheader="Curated by form and upcoming fixture difficulty"
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 700 } }}
          subheaderTypographyProps={{ variant: 'caption' }}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No players meet the favorable fixture criteria. Try adjusting filters.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Players with Favorable Fixtures"
        subheader="High form + Favorable upcoming schedule"
        titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 700 } }}
        subheaderTypographyProps={{ variant: 'caption' }}
      />
      <CardContent>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: ThemeTokens.borderRadius.sm, backgroundColor: 'transparent' }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Player</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Position</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Club</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  Form
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  Avg FDR
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Next 3 Fixtures</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {favorablePlayers.map((playerInfo: PlayerWithFixtureIntelligence) => (
                <TableRow
                  key={playerInfo.playerId}
                  hover
                  onClick={() =>
                    onPlayerSelect &&
                    onPlayerSelect(players.find((p) => p.id === playerInfo.playerId)!)
                  }
                  sx={{ cursor: onPlayerSelect ? 'pointer' : 'default' }}
                >
                  <TableCell>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.sm }}
                    >
                      <Avatar
                        src={getPlayerImageUrl(playerInfo.playerId)}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Box>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {playerInfo.playerName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>
                    {getPositionLabel(
                      players.find((p) => p.id === playerInfo.playerId)?.position || ''
                    )}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.xs }}
                    >
                      <Avatar
                        src={getTeamBadgeUrl(playerInfo.club.code)}
                        sx={{ width: 20, height: 20 }}
                      />
                      <Typography sx={{ fontSize: '0.85rem' }}>
                        {playerInfo.club.shortName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={playerInfo.form.toFixed(1)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: getFormColor(playerInfo.form),
                        color: 'white',
                        height: 24,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={playerInfo.avgFdr.toFixed(1)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: getDifficultyColor(Math.round(playerInfo.avgFdr)),
                        color: 'white',
                        height: 24,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', maxWidth: 150 }}>
                    <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                      {playerInfo.nextFixtures
                        .map(
                          (f: (typeof playerInfo.nextFixtures)[0]) =>
                            `${f.opponent.code}(${f.homeAway})`
                        )
                        .join(' · ')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', marginTop: ThemeTokens.spacing.md }}
        >
          Selection criteria: Form ≥ 5.0 · Minutes ≥ 500 · Avg FDR ≤ 2.5
        </Typography>
      </CardContent>
    </Card>
  );
}
