/**
 * Head-to-Head Summary Component
 * Displays comparison metrics between two managers
 */

import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import type { FantasyGameManagerFixture, LeagueStandingEntry } from '../types';

export interface HeadToHeadSummaryProps {
  currentManager: FantasyGameManagerFixture;
  opponentManager: LeagueStandingEntry;
}

export const HeadToHeadSummary: React.FC<HeadToHeadSummaryProps> = ({
  currentManager,
  opponentManager,
}) => {
  return (
    <Box sx={{ marginBottom: 3 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          marginBottom: 1.5,
          fontSize: '1rem',
        }}
      >
        Head-to-Head
      </Typography>

      <TableContainer>
        <Table
          sx={{
            '& td': { padding: '12px', fontSize: '0.95rem' },
            '& th': {
              padding: '12px',
              fontSize: '0.875rem',
              fontWeight: 700,
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          <TableBody>
            <TableRow sx={{ borderBottom: '1px solid #e0e0e0' }}>
              <TableCell sx={{ width: '50%' }}>Gameweek Points</TableCell>
              <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: '#4caf50' }}>
                {currentManager.overallPoints}
              </TableCell>
              <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: '#ef5350' }}>
                {opponentManager.gameweekPoints}
              </TableCell>
            </TableRow>

            <TableRow sx={{ borderBottom: '1px solid #e0e0e0' }}>
              <TableCell>Total Points</TableCell>
              <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
                {currentManager.overallPoints}
              </TableCell>
              <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
                {opponentManager.totalPoints}
              </TableCell>
            </TableRow>

            <TableRow sx={{ borderBottom: '1px solid #e0e0e0' }}>
              <TableCell>League Rank</TableCell>
              <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
                #{currentManager.overallRank}
              </TableCell>
              <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
                #{opponentManager.currentRank}
              </TableCell>
            </TableRow>

            <TableRow sx={{ borderBottom: '1px solid #e0e0e0' }}>
              <TableCell>Team Value (£m)</TableCell>
              <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
                {currentManager.teamValue.toFixed(1)}
              </TableCell>
              <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>£101.0</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Bank (£m)</TableCell>
              <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>
                {currentManager.bank.toFixed(1)}
              </TableCell>
              <TableCell sx={{ textAlign: 'center', fontWeight: 600 }}>£1.5</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
