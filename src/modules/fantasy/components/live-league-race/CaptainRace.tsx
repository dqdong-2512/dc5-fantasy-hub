/**
 * Captain Race Component
 * Displays captain choices and contributions for top managers
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { CaptainRaceEntry } from '@domain/models';

export interface CaptainRaceProps {
  entries: CaptainRaceEntry[];
  isLoading?: boolean;
}

export const CaptainRace: React.FC<CaptainRaceProps> = ({ entries, isLoading = false }) => {
  if (!entries || entries.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: ThemeTokens.spacing.lg }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: ThemeTokens.spacing.md,
          fontSize: '0.95rem',
        }}
      >
        Captain Race
      </Typography>

      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '100%' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', py: 1.5 }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', py: 1.5 }}>
                  Manager / Team
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem', py: 1.5 }}>
                  Captain
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.85rem', py: 1.5 }}>
                  Contribution
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.managerId}>
                  <TableCell sx={{ fontWeight: 700, py: 1, fontSize: '0.9rem' }}>
                    {entry.currentRank}
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {entry.managerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {entry.teamName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 1 }}>
                    <Typography sx={{ fontSize: '0.9rem' }}>
                      {entry.captainPlayerName ? (
                        entry.captainPlayerName
                      ) : (
                        <Typography component="span" sx={{ color: '#bbb', fontStyle: 'italic' }}>
                          N/A
                        </Typography>
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, py: 1, fontSize: '0.9rem' }}>
                    {entry.captainContribution > 0 ? (
                      <Typography sx={{ color: '#4caf50' }}>
                        {entry.captainContribution} pts
                      </Typography>
                    ) : (
                      <Typography sx={{ color: '#bbb' }}>—</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {isLoading && (
        <Typography
          variant="caption"
          sx={{
            color: '#999',
            display: 'block',
            mt: 1,
          }}
        >
          Loading player names...
        </Typography>
      )}
    </Box>
  );
};
