import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  useMediaQuery,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import type { Theme } from '@mui/material/styles';
import type { Player } from '@domain/models';
import { Position } from '@domain/enums';
import { ThemeTokens } from '@shared/theme/tokens';
import { getPlayerImageUrl, getTeamBadgeUrl } from '@shared/assets';
import { getPlayerStatusLabel } from '../utils';
import type { PlayerFilters } from '../types';

export interface PlayerTableProps {
  players: Player[];
  sortBy: PlayerFilters['sortBy'];
  sortOrder: PlayerFilters['sortOrder'];
  onSort: (field: PlayerFilters['sortBy'], order: PlayerFilters['sortOrder']) => void;
  onRowClick: (player: Player) => void;
  onCompareClick: (player: Player) => void;
}

function getPositionShort(position: Position): string {
  if (position === Position.Goalkeeper) {
    return 'GK';
  }

  if (position === Position.Defender) {
    return 'DEF';
  }

  if (position === Position.Midfielder) {
    return 'MID';
  }

  return 'FWD';
}

function statusChipColor(statusLabel: string): 'success' | 'warning' | 'default' {
  if (statusLabel === 'Available') {
    return 'success';
  }

  if (statusLabel === 'Doubtful') {
    return 'warning';
  }

  return 'default';
}

export function PlayerTable({
  players,
  sortBy,
  sortOrder,
  onSort,
  onRowClick,
  onCompareClick,
}: PlayerTableProps): React.ReactElement {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const handleSort = (field: PlayerFilters['sortBy']): void => {
    const nextOrder: PlayerFilters['sortOrder'] =
      sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    onSort(field, nextOrder);
  };

  if (isMobile) {
    return (
      <Box sx={{ display: 'grid', gap: ThemeTokens.spacing.sm }}>
        {players.map((player) => {
          const statusLabel = getPlayerStatusLabel(player.status);

          return (
            <Card key={player.id} variant="outlined">
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    minWidth: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => onRowClick(player)}
                >
                  <Avatar src={getPlayerImageUrl(player.clubCode)} alt={player.displayName}>
                    {player.displayName.charAt(0)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                      {player.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {player.club} · {getPositionShort(player.position)} · £
                      {(player.price / 10).toFixed(1)}m
                    </Typography>
                    <Box sx={{ mt: 0.6, display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${player.totalPoints} pts`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 22 }}
                      />
                      <Chip
                        label={`Form ${player.form.toFixed(1)}`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 22 }}
                      />
                      <Chip
                        label={`${player.ownership.toFixed(1)}%`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 22 }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 0.6,
                  }}
                >
                  <Chip label={statusLabel} size="small" color={statusChipColor(statusLabel)} />
                  <Button
                    size="small"
                    startIcon={<CompareArrowsIcon fontSize="small" />}
                    onClick={() => onCompareClick(player)}
                    sx={{ textTransform: 'none', minWidth: 0, p: 0.5 }}
                  >
                    Compare
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: ThemeTokens.borderRadius.md }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'displayName'}
                direction={sortBy === 'displayName' ? sortOrder : 'asc'}
                onClick={() => handleSort('displayName')}
              >
                Player
              </TableSortLabel>
            </TableCell>
            <TableCell>Club</TableCell>
            <TableCell>Pos</TableCell>
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
                active={sortBy === 'totalPoints'}
                direction={sortBy === 'totalPoints' ? sortOrder : 'desc'}
                onClick={() => handleSort('totalPoints')}
              >
                Total Points
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'form'}
                direction={sortBy === 'form' ? sortOrder : 'desc'}
                onClick={() => handleSort('form')}
              >
                Form
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'ownership'}
                direction={sortBy === 'ownership' ? sortOrder : 'desc'}
                onClick={() => handleSort('ownership')}
              >
                Ownership
              </TableSortLabel>
            </TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map((player) => {
            const statusLabel = getPlayerStatusLabel(player.status);

            return (
              <TableRow key={player.id} hover>
                <TableCell>
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer' }}
                    onClick={() => onRowClick(player)}
                  >
                    <Avatar
                      src={getPlayerImageUrl(player.clubCode)}
                      alt={player.displayName}
                      sx={{ width: 32, height: 32 }}
                    >
                      {player.displayName.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {player.displayName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9 }}>
                    <Avatar
                      src={getTeamBadgeUrl(player.teamCode)}
                      sx={{ width: 18, height: 18 }}
                      alt={player.club}
                    />
                    <Typography variant="body2">{player.club}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{getPositionShort(player.position)}</TableCell>
                <TableCell align="right">£{(player.price / 10).toFixed(1)}m</TableCell>
                <TableCell align="right">{player.totalPoints}</TableCell>
                <TableCell align="right">{player.form.toFixed(1)}</TableCell>
                <TableCell align="right">{player.ownership.toFixed(1)}%</TableCell>
                <TableCell>
                  <Chip label={statusLabel} size="small" color={statusChipColor(statusLabel)} />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    startIcon={<CompareArrowsIcon fontSize="small" />}
                    onClick={() => onCompareClick(player)}
                    sx={{ textTransform: 'none' }}
                  >
                    Compare
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
