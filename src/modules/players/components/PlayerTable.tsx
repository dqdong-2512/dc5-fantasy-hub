/**
 * Player Table Component
 * Displays players in a professional table format with sorting, selection, images, and badges
 */

import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Checkbox,
  Avatar,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import type { Player } from '@domain/models';
import { Position } from '@domain/enums';
import { ThemeTokens } from '@shared/theme/tokens';
import { getPlayerImageUrl, getTeamBadgeUrl } from '@shared/assets';
import { PlayerFixtureIntelligenceService } from '../services';
import { getDifficultyColor } from '@shared/presentation/fixture-formats';

export interface PlayerTableProps {
  players: Player[];
  onRowClick: (player: Player) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string, order: 'asc' | 'desc') => void;
}

/**
 * Player Table
 * Displays players with sorting, selection, images, badges, and fixture information
 */
export function PlayerTable({
  players,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
}: PlayerTableProps): React.ReactElement {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const fixtureService = useMemo(() => new PlayerFixtureIntelligenceService(), []);

  const playerFixtureData = useMemo(() => {
    const data = new Map<number, { nextFixture: string; fixtureRun: string; avgFdr: number }>();
    players.forEach((player) => {
      const summary = fixtureService.getPlayerFixtureSummary(player);
      const nextFixture = summary.upcomingFixtures[0]
        ? `${summary.upcomingFixtures[0].opponent.shortName} (${summary.upcomingFixtures[0].homeAway})`
        : '—';
      const fixtureRun = fixtureService.formatFixtureSequence(summary.upcomingFixtures, 3);
      data.set(player.id, {
        nextFixture,
        fixtureRun: fixtureRun || '—',
        avgFdr: summary.avgDifficulty,
      });
    });
    return data;
  }, [players, fixtureService]);

  const handleSort = (field: string): void => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.checked) {
      setSelectedIds(players.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number): void => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const getPositionDisplay = (position: string): string => {
    const positionMap: Record<string, string> = {
      [Position.Goalkeeper]: 'GK',
      [Position.Defender]: 'DEF',
      [Position.Midfielder]: 'MID',
      [Position.Forward]: 'FWD',
    };
    return positionMap[position] || position;
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: ThemeTokens.borderRadius.md,
        overflow: 'hidden',
        maxHeight: 'calc(100vh - 300px)',
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedIds.length > 0 && selectedIds.length === players.length}
                indeterminate={selectedIds.length > 0 && selectedIds.length < players.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell>Photo</TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'name'}
                direction={sortBy === 'name' ? sortOrder : 'asc'}
                onClick={() => handleSort('name')}
              >
                Player
              </TableSortLabel>
            </TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Club</TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'price'}
                direction={sortBy === 'price' ? sortOrder : 'asc'}
                onClick={() => handleSort('price')}
              >
                Price
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'form'}
                direction={sortBy === 'form' ? sortOrder : 'asc'}
                onClick={() => handleSort('form')}
              >
                Form
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">Next Fixture</TableCell>
            <TableCell>Fixture Run</TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'avgFdr'}
                direction={sortBy === 'avgFdr' ? sortOrder : 'asc'}
                onClick={() => handleSort('avgFdr')}
              >
                Avg FDR
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map((player) => {
            const fixtureInfo = playerFixtureData.get(player.id);
            return (
              <TableRow
                key={player.id}
                hover
                onClick={() => onRowClick(player)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: selectedIds.includes(player.id)
                    ? 'action.selected'
                    : 'transparent',
                }}
              >
                <TableCell
                  padding="checkbox"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectOne(player.id);
                  }}
                >
                  <Checkbox checked={selectedIds.includes(player.id)} />
                </TableCell>
                <TableCell>
                  <Avatar
                    src={getPlayerImageUrl(player.id)}
                    sx={{ width: 40, height: 40 }}
                    alt={player.displayName}
                  >
                    {player.displayName.charAt(0)}
                  </Avatar>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{player.displayName}</TableCell>
                <TableCell>{getPositionDisplay(player.position)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={getTeamBadgeUrl(player.clubCode || player.club)}
                      sx={{ width: 24, height: 24 }}
                      alt={player.club}
                    />
                    <span>{player.club}</span>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  £{(player.price / 10).toFixed(1)}m
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color:
                      player.form && player.form > 5
                        ? 'success.main'
                        : player.form && player.form > 3
                          ? 'warning.main'
                          : 'error.main',
                  }}
                >
                  {player.form?.toFixed(2) || '—'}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {fixtureInfo?.nextFixture}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.8rem', maxWidth: 120 }}>
                  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    {fixtureInfo?.fixtureRun}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {fixtureInfo && fixtureInfo.avgFdr > 0 ? (
                    <Chip
                      label={fixtureInfo.avgFdr.toFixed(1)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: getDifficultyColor(Math.round(fixtureInfo.avgFdr)),
                        color: 'white',
                        height: 24,
                        fontSize: '0.75rem',
                      }}
                    />
                  ) : (
                    <Typography sx={{ fontSize: '0.85rem' }}>—</Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
