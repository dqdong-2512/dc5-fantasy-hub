/**
 * Player Contribution Comparison Table
 * Shows detailed player-by-player comparison
 */

import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { PlayerComparisonRow } from '@domain/models';

export interface PlayerContributionComparisonTableProps {
  rows: PlayerComparisonRow[];
}

export const PlayerContributionComparisonTable: React.FC<
  PlayerContributionComparisonTableProps
> = ({ rows }) => {
  if (rows.length === 0) {
    return (
      <Box sx={{ mb: ThemeTokens.spacing.lg }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '0.95rem',
            mb: ThemeTokens.spacing.md,
          }}
        >
          Player Contributions
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>
          No player data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: ThemeTokens.spacing.lg }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: '0.95rem',
          mb: ThemeTokens.spacing.md,
        }}
      >
        Player Contributions
      </Typography>

      <Paper sx={{ overflowX: 'auto' }}>
        <Table
          sx={{
            '& td': { padding: '10px 12px', fontSize: '0.85rem' },
            '& th': {
              padding: '10px 12px',
              fontSize: '0.8rem',
              fontWeight: 700,
              backgroundColor: '#f5f5f5',
            },
            minWidth: '100%',
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell align="center">YOU</TableCell>
              <TableCell align="center">RIVAL</TableCell>
              <TableCell align="center">Diff</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.playerId}
                sx={{
                  backgroundColor: row.isShared ? '#f9f9f9' : 'transparent',
                }}
              >
                {/* Player Name */}
                <TableCell>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '0.85rem',
                        fontWeight: row.isCaptain ? 700 : 600,
                      }}
                    >
                      {row.playerName}
                      {row.isCaptain && ' (C)'}
                    </Typography>
                    {row.isShared && (
                      <Typography
                        sx={{
                          fontSize: '0.7rem',
                          color: '#999',
                          mt: 0.25,
                        }}
                      >
                        shared
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                {/* Your Points */}
                <TableCell align="center">
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: row.currentManagerContribution > 0 ? '#4caf50' : '#666',
                    }}
                  >
                    {row.currentManagerContribution}
                  </Typography>
                </TableCell>

                {/* Rival Points */}
                <TableCell align="center">
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: row.opponentManagerContribution > 0 ? '#4caf50' : '#666',
                    }}
                  >
                    {row.opponentManagerContribution}
                  </Typography>
                </TableCell>

                {/* Difference */}
                <TableCell align="center">
                  <Typography
                    sx={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color:
                        row.pointsDifference > 0
                          ? '#4caf50'
                          : row.pointsDifference < 0
                            ? '#f44336'
                            : '#999',
                    }}
                  >
                    {row.pointsDifference > 0 ? '+' : ''}
                    {row.pointsDifference}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Typography
        sx={{
          fontSize: '0.75rem',
          color: '#999',
          mt: ThemeTokens.spacing.sm,
          fontStyle: 'italic',
        }}
      >
        Sorted by absolute point difference. Shared players highlighted.
      </Typography>
    </Box>
  );
};
