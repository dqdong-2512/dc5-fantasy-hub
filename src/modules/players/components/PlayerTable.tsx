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
  Typography,
} from '@mui/material';
import type { Player } from '@domain/models';
import { Position } from '@domain/enums';
import { ThemeTokens } from '@shared/theme/tokens';
import { getPlayerImageUrl, getTeamBadgeUrl } from '@shared/assets';
import { PlayerFixtureIntelligenceService } from '../services';

export interface PlayerTableProps {
  players: Player[];
  onRowClick: (player: Player) => void;
  onClubClick?: (clubCode: number) => void;
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
  onClubClick,
  sortBy,
  sortOrder,
  onSort,
}: PlayerTableProps): React.ReactElement {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const fixtureService = useMemo(() => new PlayerFixtureIntelligenceService(), []);

  // Only calculate fixture data for visible players (paginated set)
  // This prevents expensive calculations on full 841-player dataset
  const playerFixtureData = useMemo(() => {
    const data = new Map<number, { nextFixture: string; fixtureRun: string; avgFdr: number }>();
    try {
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
    } catch (err) {
      console.error('Error calculating fixture data:', err);
    }
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
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            <TableCell padding="checkbox" sx={{ width: 44 }}>
              <Checkbox
                checked={selectedIds.length > 0 && selectedIds.length === players.length}
                indeterminate={selectedIds.length > 0 && selectedIds.length < players.length}
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell sx={{ width: 48 }}>Photo</TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'displayName'}
                direction={sortBy === 'displayName' ? sortOrder : 'asc'}
                onClick={() => handleSort('displayName')}
              >
                Player
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ width: 70 }}>Position</TableCell>
            <TableCell sx={{ width: 100 }}>Club</TableCell>
            <TableCell align="right" sx={{ width: 70 }}>
              <TableSortLabel
                active={sortBy === 'price'}
                direction={sortBy === 'price' ? sortOrder : 'asc'}
                onClick={() => handleSort('price')}
              >
                Price
              </TableSortLabel>
            </TableCell>
            <TableCell align="right" sx={{ width: 60 }}>
              <TableSortLabel
                active={sortBy === 'form'}
                direction={sortBy === 'form' ? sortOrder : 'asc'}
                onClick={() => handleSort('form')}
              >
                Form
              </TableSortLabel>
            </TableCell>
            <TableCell align="right" sx={{ width: 120 }}>
              Next Fixture
            </TableCell>
            <TableCell sx={{ width: 100 }}>Fixture Run</TableCell>
            <TableCell align="right" sx={{ width: 70 }}>
              <TableSortLabel
                active={sortBy === 'totalPoints'}
                direction={sortBy === 'totalPoints' ? sortOrder : 'asc'}
                onClick={() => handleSort('totalPoints')}
              >
                Pts
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
                  height: 44,
                  backgroundColor: selectedIds.includes(player.id)
                    ? 'action.selected'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: selectedIds.includes(player.id)
                      ? 'action.selected'
                      : 'action.hover',
                  },
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
                <TableCell padding="none" sx={{ pl: 1, pr: 0.5 }}>
                  <Avatar
                    src={getPlayerImageUrl(player.id)}
                    sx={{ width: 36, height: 36 }}
                    alt={player.displayName}
                  >
                    {player.displayName.charAt(0)}
                  </Avatar>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {player.displayName}
                </TableCell>
                <TableCell sx={{ fontSize: '0.9rem' }}>
                  {getPositionDisplay(player.position)}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      cursor: onClubClick ? 'pointer' : 'default',
                      '&:hover': onClubClick
                        ? {
                            opacity: 0.7,
                          }
                        : {},
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onClubClick && player.clubCode) {
                        onClubClick(player.clubCode);
                      }
                    }}
                  >
                    <Avatar
                      src={getTeamBadgeUrl(player.clubCode || player.club)}
                      sx={{ width: 24, height: 24 }}
                      alt={player.club}
                    />
                    <Typography sx={{ fontSize: '0.9rem' }} noWrap>
                      {player.club}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
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
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  {player.form?.toFixed(1) || '—'}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                    {fixtureInfo?.nextFixture}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: '0.8rem' }}>
                  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    {fixtureInfo?.fixtureRun}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {player.totalPoints}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
