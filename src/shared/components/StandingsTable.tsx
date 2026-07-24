/**
 * Standings Table Component
 * Shared standings view for gameweek and clubs experiences.
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
} from '@mui/material';
import type { StandingsRow } from '@shared/services/standings-calculator.service';
import { StandingsCalculatorService } from '@shared/services/standings-calculator.service';
import { ThemeTokens } from '@shared/theme/tokens';
import { getTeamBadgeUrl } from '@shared/assets';

export interface StandingsTableProps {
  standings: StandingsRow[] | null;
  isPreSeason: boolean;
  message: string | null;
}

export function StandingsTable({
  standings,
  isPreSeason,
  message,
}: StandingsTableProps): React.ReactElement {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (isPreSeason || !standings || standings.length === 0) {
    return (
      <Card sx={{ backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
        <CardContent sx={{ textAlign: 'center', py: ThemeTokens.spacing.lg }}>
          <Typography color="textSecondary" variant="body2">
            {message || 'Standings not available'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: ThemeTokens.spacing.md }}>
        {standings.map((row) => (
          <Card
            key={row.team.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: ThemeTokens.spacing.md,
              gap: ThemeTokens.spacing.md,
            }}
          >
            <Box sx={{ minWidth: 40, textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  color: getPositionColor(row.position),
                }}
              >
                {row.position}
              </Typography>
              {row.prevPosition && row.position !== row.prevPosition && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.25,
                    fontWeight: 600,
                    color:
                      row.position < row.prevPosition
                        ? 'success.main'
                        : row.position > row.prevPosition
                          ? 'error.main'
                          : 'textSecondary',
                  }}
                >
                  {StandingsCalculatorService.getMovementIndicator(row.prevPosition, row.position)}
                </Typography>
              )}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.sm }}>
                <Avatar
                  src={getTeamBadgeUrl(row.team.code)}
                  sx={{ width: 32, height: 32 }}
                  alt={row.team.name}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden' }}
                  >
                    {row.team.shortName}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {row.played}P
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'right', minWidth: 50 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {row.points}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {row.won}W {row.drawn}D {row.lost}L
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>
    );
  }

  if (isTablet) {
    return (
      <TableContainer component={Paper}>
        <Table size="small" sx={{ '& .MuiTableCell-root': { py: 1, px: 1 } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'action.hover' }}>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                Pos
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Club</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                P
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                GD
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                Pts
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {standings.map((row) => (
              <TableRow
                key={row.team.id}
                sx={{
                  backgroundColor:
                    row.position <= 4
                      ? '#e8f5e9'
                      : row.position <= 6
                        ? '#e3f2fd'
                        : row.position >= 18
                          ? '#ffebee'
                          : 'transparent',
                  borderLeft: `4px solid ${getPositionColor(row.position)}`,
                }}
              >
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  <Box>
                    <div>{row.position}</div>
                    {row.prevPosition && row.position !== row.prevPosition && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          fontWeight: 600,
                          color:
                            row.position < row.prevPosition
                              ? 'success.main'
                              : row.position > row.prevPosition
                                ? 'error.main'
                                : 'textSecondary',
                        }}
                      >
                        {StandingsCalculatorService.getMovementIndicator(
                          row.prevPosition,
                          row.position
                        )}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontSize: '0.85rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.xs }}>
                    <Avatar
                      src={getTeamBadgeUrl(row.team.code)}
                      sx={{ width: 24, height: 24 }}
                      alt={row.team.name}
                    />
                    <span>{row.team.shortName}</span>
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {row.played}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {row.goalDifference > 0 ? '+' : ''}
                  {row.goalDifference}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {row.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            <TableCell align="center" sx={{ fontWeight: 600, width: 60 }}>
              Pos
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600, width: 50 }}>
              Move
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Club</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              P
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              W
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              D
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              L
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              GF
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              GA
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              GD
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Pts
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {standings.map((row) => (
            <TableRow
              key={row.team.id}
              sx={{
                backgroundColor:
                  row.position <= 4
                    ? '#e8f5e9'
                    : row.position === 5 || row.position === 6
                      ? '#e3f2fd'
                      : row.position >= 18
                        ? '#ffebee'
                        : 'transparent',
                borderLeft: `4px solid ${getPositionColor(row.position)}`,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                {row.position}
              </TableCell>
              <TableCell align="center">
                {row.prevPosition && row.position !== row.prevPosition ? (
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color:
                          row.position < row.prevPosition
                            ? 'success.main'
                            : row.position > row.prevPosition
                              ? 'error.main'
                              : 'textSecondary',
                        fontSize: '1rem',
                      }}
                    >
                      {StandingsCalculatorService.getMovementIndicator(
                        row.prevPosition,
                        row.position
                      )}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {Math.abs(row.position - row.prevPosition)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography sx={{ fontWeight: 600 }}>—</Typography>
                )}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.md }}>
                  <Avatar
                    src={getTeamBadgeUrl(row.team.code)}
                    sx={{ width: 32, height: 32 }}
                    alt={row.team.name}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.team.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {row.team.shortName}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                {row.played}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                {row.won}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                {row.drawn}
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                {row.lost}
              </TableCell>
              <TableCell align="center">{row.goalsFor}</TableCell>
              <TableCell align="center">{row.goalsAgainst}</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                {row.goalDifference > 0 ? '+' : ''}
                {row.goalDifference}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {row.points}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function getPositionColor(position: number): string {
  if (position <= 4) return '#1b5e20';
  if (position === 5 || position === 6) return '#0d47a1';
  if (position >= 18) return '#b71c1c';
  return '#424242';
}
