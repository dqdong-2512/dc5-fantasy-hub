/**
 * Player Analytics Table Component
 * Reusable table for displaying player analytics across different views
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  TableSortLabel,
} from '@mui/material';
import type { PlayerAnalyticsRecord } from '@domain/models';
import { ShortlistButton } from './ShortlistButton';

export interface PlayerAnalyticsTableProps {
  players: PlayerAnalyticsRecord[];
  columns?: ('name' | 'price' | 'form' | 'value' | 'differential' | 'fixtures' | 'overall')[];
  onPlayerClick?: (playerId: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string, order: 'asc' | 'desc') => void;
  dense?: boolean;
}

export const PlayerAnalyticsTable: React.FC<PlayerAnalyticsTableProps> = ({
  players,
  columns = ['name', 'price', 'form', 'value', 'fixtures', 'overall'],
  onPlayerClick,
  sortBy = 'overall',
  sortOrder = 'desc',
  onSort,
  dense = false,
}) => {
  const cellPadding = dense ? '8px 12px' : '12px 16px';
  const fontSize = dense ? '0.85rem' : '0.9rem';

  const renderValue = (value: number | string, type: 'number' | 'percentage' | 'price'): string => {
    if (typeof value === 'string') return value;
    switch (type) {
      case 'price':
        return `£${(value / 10).toFixed(1)}m`;
      case 'percentage':
        return `${value.toFixed(0)}%`;
      case 'number':
      default:
        return value.toFixed(1);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 7.5) return '#2e7d32'; // green
    if (score >= 5) return '#ff9800'; // amber
    return '#d32f2f'; // red
  };

  const handleSort = (field: string): void => {
    if (!onSort) return;
    const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    onSort(field, newOrder);
  };

  const columnConfig: Record<
    string,
    { label: string; width?: string; numeric?: boolean; sortable?: boolean }
  > = {
    name: { label: 'Player', width: '180px' },
    price: { label: 'Price', width: '80px', numeric: true, sortable: true },
    form: { label: 'Form', width: '80px', numeric: true, sortable: true },
    value: { label: 'Value', width: '80px', numeric: true, sortable: true },
    differential: { label: 'Differential', width: '100px', numeric: true, sortable: true },
    fixtures: { label: 'Fixtures', width: '80px', numeric: true, sortable: true },
    overall: { label: 'Overall', width: '80px', numeric: true, sortable: true },
  };

  return (
    <Paper sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 800 }} size={dense ? 'small' : 'medium'}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            {columns.map((col) => {
              const config = columnConfig[col];
              const isSortable = config.sortable && onSort;

              return (
                <TableCell
                  key={col}
                  align={config.numeric ? 'right' : 'left'}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    padding: cellPadding,
                    width: config.width,
                  }}
                >
                  {isSortable ? (
                    <TableSortLabel
                      active={sortBy === col}
                      direction={sortBy === col ? sortOrder : 'desc'}
                      onClick={() => handleSort(col)}
                    >
                      {config.label}
                    </TableSortLabel>
                  ) : (
                    config.label
                  )}
                </TableCell>
              );
            })}
            <TableCell
              align="center"
              sx={{ fontSize: '0.85rem', padding: cellPadding, width: '50px' }}
            >
              List
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players.map((player) => (
            <TableRow
              key={player.playerId}
              hover
              onClick={() => onPlayerClick?.(player.playerId)}
              sx={{
                cursor: onPlayerClick ? 'pointer' : 'default',
                backgroundColor: player.isInMyTeam ? '#f9f9f9' : 'transparent',
              }}
            >
              {columns.map((col) => {
                switch (col) {
                  case 'name':
                    return (
                      <TableCell key="name" sx={{ padding: cellPadding, fontSize }}>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize }}>
                            {player.playerName}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#999' }}>
                            {player.club} • {player.position}
                          </Typography>
                        </Box>
                      </TableCell>
                    );

                  case 'price':
                    return (
                      <TableCell key="price" align="right" sx={{ padding: cellPadding, fontSize }}>
                        {renderValue(player.price, 'price')}
                      </TableCell>
                    );

                  case 'form':
                    return (
                      <TableCell key="form" align="right" sx={{ padding: cellPadding, fontSize }}>
                        <Chip
                          label={player.form.toFixed(1)}
                          size="small"
                          sx={{
                            backgroundColor: getScoreColor(player.form),
                            color: '#fff',
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                    );

                  case 'value':
                    return (
                      <TableCell key="value" align="right" sx={{ padding: cellPadding, fontSize }}>
                        {renderValue(player.valueScore, 'number')}
                      </TableCell>
                    );

                  case 'differential':
                    return (
                      <TableCell
                        key="differential"
                        align="right"
                        sx={{ padding: cellPadding, fontSize }}
                      >
                        <Chip
                          label={player.differentialScore.toFixed(1)}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: getScoreColor(player.differentialScore),
                            color: getScoreColor(player.differentialScore),
                          }}
                        />
                      </TableCell>
                    );

                  case 'fixtures':
                    return (
                      <TableCell
                        key="fixtures"
                        align="right"
                        sx={{ padding: cellPadding, fontSize }}
                      >
                        {player.fixtureScore.toFixed(1)}
                      </TableCell>
                    );

                  case 'overall':
                    return (
                      <TableCell
                        key="overall"
                        align="right"
                        sx={{ padding: cellPadding, fontSize }}
                      >
                        <Chip
                          label={player.overallScore.toFixed(1)}
                          size="small"
                          sx={{
                            backgroundColor: getScoreColor(player.overallScore),
                            color: '#fff',
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                    );

                  default:
                    return null;
                }
              })}
              <TableCell align="center" sx={{ padding: cellPadding }}>
                <ShortlistButton
                  playerId={player.playerId}
                  size="small"
                  onToggle={() => {
                    // Optionally refresh or update parent
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};
