/**
 * Team Fixture Matrix
 * Shows fixtures for all teams across planning period
 */

import React from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { SeasonPlan } from '../../domain/SeasonPlan';

interface TeamFixtureMatrixProps {
  plan: SeasonPlan;
}

export const TeamFixtureMatrix: React.FC<TeamFixtureMatrixProps> = ({ plan }) => {
  return (
    <Card sx={{ p: ThemeTokens.spacing.md }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Team Fixture Outlook
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        Multi-gameweek fixture view for squad teams
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'divider' }}>
              <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
              {Array.from({ length: plan.endGameweekId - plan.startGameweekId + 1 }, (_, i) => (
                <TableCell key={i} align="center" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                  GW{plan.startGameweekId + i}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={plan.endGameweekId - plan.startGameweekId + 2}
                sx={{ textAlign: 'center', py: 4 }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Fixture data loading...
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};
