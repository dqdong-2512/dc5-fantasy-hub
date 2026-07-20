/**
 * Club Overview Component
 * Displays all Premier League clubs with key metrics in a compact grid/table
 */

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Box,
  Avatar,
  Typography,
  Stack,
  Chip,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { Team } from '@domain/models';
import { ThemeTokens } from '@shared/theme/tokens';
import { getTeamBadgeUrl } from '@shared/assets';
import { getDifficultyColor } from '@shared/presentation/fixture-formats';
import { ClubIntelligenceService } from '../insights';

export interface ClubOverviewProps {
  clubs: Team[];
  onClubSelect: (club: Team) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string, order: 'asc' | 'desc') => void;
}

/**
 * Club Overview - Compact analytics-oriented display
 */
export function ClubOverview({
  clubs,
  onClubSelect,
  sortBy,
  sortOrder,
  onSort,
}: ClubOverviewProps): React.ReactElement {
  const theme = useTheme();
  const service = useMemo(() => new ClubIntelligenceService(), []);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const clubAnalysis = useMemo(
    () =>
      clubs.map((club) => {
        const analysis = service.analyzeClub(club);
        return {
          club,
          strength: club.strength,
          nextFixtureFdr: analysis.nextFixture
            ? analysis.nextFixture.homeTeam.id === club.id
              ? analysis.nextFixture.homeDifficulty
              : analysis.nextFixture.awayDifficulty
            : null,
          avgFdr: analysis.fixtureRun.averageFdr,
          topPlayer: analysis.keyPlayers[0] || null,
        };
      }),
    [clubs, service]
  );

  const handleSort = (field: string): void => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  };

  if (isMobile) {
    // Mobile: Card grid layout
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: ThemeTokens.spacing.md,
        }}
      >
        {clubAnalysis.map((item) => (
          <Card
            key={item.club.id}
            onClick={() => onClubSelect(item.club)}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: ThemeTokens.spacing.md,
                  marginBottom: ThemeTokens.spacing.md,
                }}
              >
                <Avatar src={getTeamBadgeUrl(item.club.code)} sx={{ width: 48, height: 48 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.club.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.club.shortName}
                  </Typography>
                </Box>
              </Box>

              <Stack spacing={ThemeTokens.spacing.sm}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Strength
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.strength.toFixed(1)}
                  </Typography>
                </Box>
                {item.nextFixtureFdr !== null && (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Next FDR
                    </Typography>
                    <Chip
                      label={item.nextFixtureFdr}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: getDifficultyColor(item.nextFixtureFdr),
                        color: 'white',
                        height: 20,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                )}
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Avg FDR (Next 5)
                  </Typography>
                  <Chip
                    label={item.avgFdr.toFixed(1)}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      backgroundColor: getDifficultyColor(Math.round(item.avgFdr)),
                      color: 'white',
                      height: 20,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
                {item.topPlayer && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Top Player
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, textAlign: 'right' }}>
                      {item.topPlayer.name}
                      <br />
                      {item.topPlayer.totalPoints}pts
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // Desktop: Table layout
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            <TableCell sx={{ fontWeight: 600 }}>Club</TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'strength'}
                direction={sortBy === 'strength' ? sortOrder : 'asc'}
                onClick={() => handleSort('strength')}
              >
                Strength
              </TableSortLabel>
            </TableCell>
            <TableCell align="right">Next FDR</TableCell>
            <TableCell align="right">
              <TableSortLabel
                active={sortBy === 'avgFdr'}
                direction={sortBy === 'avgFdr' ? sortOrder : 'asc'}
                onClick={() => handleSort('avgFdr')}
              >
                Avg FDR (Next 5)
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortBy === 'topPlayerPoints'}
                direction={sortBy === 'topPlayerPoints' ? sortOrder : 'asc'}
                onClick={() => handleSort('topPlayerPoints')}
              >
                Top Player
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clubAnalysis.map((item) => (
            <TableRow
              key={item.club.id}
              hover
              onClick={() => onClubSelect(item.club)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.md }}>
                  <Avatar src={getTeamBadgeUrl(item.club.code)} sx={{ width: 32, height: 32 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.club.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.club.shortName}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {item.strength.toFixed(1)}
              </TableCell>
              <TableCell align="right">
                {item.nextFixtureFdr !== null ? (
                  <Chip
                    label={item.nextFixtureFdr}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      backgroundColor: getDifficultyColor(item.nextFixtureFdr),
                      color: 'white',
                      height: 24,
                      fontSize: '0.75rem',
                    }}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell align="right">
                <Chip
                  label={item.avgFdr.toFixed(1)}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: getDifficultyColor(Math.round(item.avgFdr)),
                    color: 'white',
                    height: 24,
                    fontSize: '0.75rem',
                  }}
                />
              </TableCell>
              <TableCell>
                {item.topPlayer ? (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.topPlayer.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.topPlayer.totalPoints}pts
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    —
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
