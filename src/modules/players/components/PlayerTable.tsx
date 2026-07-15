/**
 * Player Table Component
 * Displays players in a professional table format with sorting and selection
 */

import React, { useState } from 'react';
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
} from '@mui/material';
import type { Player } from '@domain/models';
import { Position } from '@domain/enums';
import { ThemeTokens } from '@shared/theme/tokens';

export interface PlayerTableProps {
  players: Player[];
  onRowClick: (player: Player) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string, order: 'asc' | 'desc') => void;
}

/**
 * Player Table
 * Displays players with sorting, selection, and interactive rows
 */
export function PlayerTable({
  players,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
}: PlayerTableProps): React.ReactElement {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
      sx={{ borderRadius: ThemeTokens.borderRadius.md, overflow: 'hidden' }}
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
            <TableCell>
              <TableSortLabel
                active={sortBy === 'name'}
                direction={sortBy === 'name' ? sortOrder : 'asc'}
                onClick={() => handleSort('name')}
              >
                Name
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'position'}
                direction={sortBy === 'position' ? sortOrder : 'asc'}
                onClick={() => handleSort('position')}
              >
                Position
              </TableSortLabel>
            </TableCell>
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
                active={sortBy === 'ownership'}
                direction={sortBy === 'ownership' ? sortOrder : 'asc'}
                onClick={() => handleSort('ownership')}
              >
                Selected %
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
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'points'}
                direction={sortBy === 'points' ? sortOrder : 'asc'}
                onClick={() => handleSort('points')}
              >
                Total Pts
              </TableSortLabel>
            </TableCell>
            <TableCell>Next Fixture</TableCell>
            <TableCell align="center">Difficulty</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map((player) => (
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
              <TableCell sx={{ fontWeight: 600 }}>{player.displayName}</TableCell>
              <TableCell>{getPositionDisplay(player.position)}</TableCell>
              <TableCell>{player.club}</TableCell>
              <TableCell align="right">£{(player.price / 10).toFixed(1)}m</TableCell>
              <TableCell align="right">{player.ownership.toFixed(1)}%</TableCell>
              <TableCell align="right" sx={{ color: player.form > 5 ? 'success.main' : 'inherit' }}>
                {player.form.toFixed(2)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {player.minutesPlayed > 0 ? 'N/A' : '—'}
              </TableCell>
              <TableCell>—</TableCell>
              <TableCell align="center">—</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
