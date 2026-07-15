/**
 * Club Comparison Component
 * Compare up to 3 clubs side-by-side
 */

import React, { useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
  Chip,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { ThemeTokens } from '@shared/theme/tokens';
import { getTeamBadgeUrl } from '@shared/assets';
import { getDifficultyColor } from '@shared/presentation/fixture-formats';
import { ClubIntelligenceService } from '../insights';

export interface ClubComparisonProps {
  selectedClubIds: number[];
  onRemoveClub: (clubId: number) => void;
}

/**
 * Club Comparison - Side-by-side analysis
 */
export function ClubComparison({
  selectedClubIds,
  onRemoveClub,
}: ClubComparisonProps): React.ReactElement | null {
  const service = useMemo(() => new ClubIntelligenceService(), []);

  const comparisons = useMemo(
    () => service.compareClubs(selectedClubIds),
    [selectedClubIds, service]
  );

  if (comparisons.length === 0) {
    return null;
  }

  return (
    <Card sx={{ marginBottom: ThemeTokens.spacing.lg }}>
      <CardContent>
        <Typography
          variant={ThemeTokens.typography.subsectionTitleVariant}
          sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
        >
          Club Comparison
        </Typography>

        <TableContainer
          component={Paper}
          sx={{ backgroundColor: 'transparent', borderRadius: ThemeTokens.borderRadius.sm }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Metric</TableCell>
                {comparisons.map((comp) => (
                  <TableCell key={comp.team.id} align="center" sx={{ fontWeight: 600 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: ThemeTokens.spacing.xs,
                      }}
                    >
                      <Avatar
                        src={getTeamBadgeUrl(comp.team.code)}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {comp.team.shortName}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        onClick={() => onRemoveClub(comp.team.id)}
                        sx={{ minWidth: 'auto', padding: 0 }}
                      >
                        <CloseIcon sx={{ fontSize: '14px' }} />
                      </Button>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Overall Strength</TableCell>
                {comparisons.map((comp) => (
                  <TableCell key={comp.team.id} align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {comp.strengthOverview.overall.toFixed(1)}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Home Strength</TableCell>
                {comparisons.map((comp) => (
                  <TableCell key={comp.team.id} align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {comp.strengthOverview.overallHome.toFixed(1)}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Away Strength</TableCell>
                {comparisons.map((comp) => (
                  <TableCell key={comp.team.id} align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {comp.strengthOverview.overallAway.toFixed(1)}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                <TableCell sx={{ fontWeight: 600 }}>Next 5 Avg FDR</TableCell>
                {comparisons.map((comp) => (
                  <TableCell key={comp.team.id} align="center">
                    <Chip
                      label={comp.fixtureRun.averageFdr.toFixed(1)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: getDifficultyColor(Math.round(comp.fixtureRun.averageFdr)),
                        color: 'white',
                        height: 24,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Total Player Points</TableCell>
                {comparisons.map((comp) => (
                  <TableCell key={comp.team.id} align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {comp.fantasyMetrics.totalPlayerPoints}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Avg Player Form</TableCell>
                {comparisons.map((comp) => (
                  <TableCell key={comp.team.id} align="center">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {comp.fantasyMetrics.averagePlayerForm.toFixed(2)}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', marginTop: ThemeTokens.spacing.md }}
        >
          Comparing {comparisons.length} club{comparisons.length !== 1 ? 's' : ''} • Max 3
        </Typography>
      </CardContent>
    </Card>
  );
}
