import React, { useMemo } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState, PageContent } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { getPlayerImageUrl, getTeamBadgeUrl } from '@shared/assets';
import {
  formatDifficulty,
  formatKickoffDate,
  formatKickoffTime,
  getDifficultyLabel,
} from '@shared/presentation/fixture-formats';
import { PlayerFixtureIntelligenceService } from '../services';
import { usePlayerResearchData } from '../context';
import { getPlayerStatusLabel } from '../utils';

interface MetricItemProps {
  label: string;
  value: string;
}

function MetricItem({ label, value }: MetricItemProps): React.ReactElement {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.4 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function PlayerDetailPage(): React.ReactElement {
  const navigate = useNavigate();
  const { playerId } = useParams<{ playerId: string }>();
  const { playerById, totalPlayers, errorMessage, hasTransferTrendData, hasPriceMovementData } =
    usePlayerResearchData();

  const parsedPlayerId = Number(playerId);
  const player = Number.isFinite(parsedPlayerId) ? (playerById.get(parsedPlayerId) ?? null) : null;

  const fixtureService = useMemo(() => new PlayerFixtureIntelligenceService(), []);
  const fixtureSummary = useMemo(() => {
    if (!player) {
      return null;
    }

    return fixtureService.getPlayerFixtureSummary(player);
  }, [fixtureService, player]);

  if (errorMessage) {
    return (
      <PageContent>
        <EmptyState
          title="Data unavailable"
          description={errorMessage}
          actionLabel="Back to Player Explorer"
          onAction={() => navigate('/premier-league/players')}
        />
      </PageContent>
    );
  }

  if (totalPlayers === 0) {
    return (
      <PageContent>
        <EmptyState
          title="No players available"
          description="Player detail cannot be shown because no player dataset is loaded."
          actionLabel="Back to Player Explorer"
          onAction={() => navigate('/premier-league/players')}
        />
      </PageContent>
    );
  }

  if (!player) {
    return (
      <PageContent>
        <EmptyState
          title="Player not found"
          description="The requested player ID does not exist in the active season dataset."
          actionLabel="Back to Player Explorer"
          onAction={() => navigate('/premier-league/players')}
        />
      </PageContent>
    );
  }

  const statusLabel = getPlayerStatusLabel(player.status);

  return (
    <PageContent>
      <Stack spacing={ThemeTokens.spacing.md}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/premier-league/players')}
            sx={{ textTransform: 'none' }}
          >
            Back to Explorer
          </Button>
          <Button
            startIcon={<CompareArrowsIcon />}
            onClick={() => navigate(`/premier-league/players/compare?players=${player.id}`)}
            sx={{ textTransform: 'none' }}
          >
            Compare
          </Button>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Avatar
                src={getPlayerImageUrl(player.clubCode)}
                alt={player.displayName}
                sx={{ width: 88, height: 88 }}
              >
                {player.displayName.charAt(0)}
              </Avatar>
              <Box sx={{ minWidth: 240 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {player.displayName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.6 }}>
                  <Avatar
                    src={getTeamBadgeUrl(player.teamCode)}
                    alt={player.club}
                    sx={{ width: 20, height: 20 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {player.club} · {player.position}
                  </Typography>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={statusLabel} size="small" />
                  <Chip
                    label={`£${(player.price / 10).toFixed(1)}m`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.4 }}>
              Key FPL Metrics
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              }}
            >
              <MetricItem label="Total Points" value={`${player.totalPoints}`} />
              <MetricItem label="Form" value={player.form.toFixed(1)} />
              <MetricItem label="Ownership" value={`${player.ownership.toFixed(1)}%`} />
              <MetricItem label="Minutes" value={`${player.minutesPlayed}`} />
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.4 }}>
              Performance
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              }}
            >
              <MetricItem label="Goals" value={`${player.goalsScored ?? 0}`} />
              <MetricItem label="Assists" value={`${player.assists ?? 0}`} />
              <MetricItem label="Clean Sheets" value={`${player.cleanSheets ?? 0}`} />
              <MetricItem label="Bonus" value="Unavailable in synced dataset" />
            </Box>
            <Alert severity="info" sx={{ mt: 1.5 }}>
              Gameweek-level player history is not currently synchronized, so trend charts are not
              shown. This view uses official aggregate active-season metrics only.
            </Alert>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.4 }}>
              Upcoming Fixtures
            </Typography>
            {fixtureSummary && fixtureSummary.hasUpcomingFixtures ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>GW</TableCell>
                      <TableCell>Opponent</TableCell>
                      <TableCell>H/A</TableCell>
                      <TableCell>Kickoff</TableCell>
                      <TableCell>Difficulty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fixtureSummary.upcomingFixtures.slice(0, 5).map((fixture) => (
                      <TableRow key={`${fixture.fixture.id}-${fixture.gameweek}`}>
                        <TableCell>{fixture.gameweek}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Avatar
                              src={getTeamBadgeUrl(fixture.opponentBadge)}
                              alt={fixture.opponent.shortName}
                              sx={{ width: 18, height: 18 }}
                            />
                            <Typography variant="body2">{fixture.opponent.shortName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{fixture.homeAway}</TableCell>
                        <TableCell>
                          {formatKickoffDate(fixture.kickoffTime)}{' '}
                          {formatKickoffTime(fixture.kickoffTime)}
                        </TableCell>
                        <TableCell>
                          {formatDifficulty(fixture.difficulty)} (
                          {getDifficultyLabel(fixture.difficulty)})
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No upcoming fixtures available for this player.</Alert>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.4 }}>
              Transfer Trends (FPL Managers)
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              }}
            >
              <MetricItem
                label="Transfers In (Event)"
                value={
                  hasTransferTrendData && typeof player.transfersInEvent === 'number'
                    ? `${player.transfersInEvent}`
                    : 'Unavailable'
                }
              />
              <MetricItem
                label="Transfers Out (Event)"
                value={
                  hasTransferTrendData && typeof player.transfersOutEvent === 'number'
                    ? `${player.transfersOutEvent}`
                    : 'Unavailable'
                }
              />
              <MetricItem label="Ownership" value={`${player.ownership.toFixed(1)}%`} />
              <MetricItem
                label="Price Movement"
                value={
                  hasPriceMovementData && typeof player.costChangeEvent === 'number'
                    ? `${player.costChangeEvent / 10 >= 0 ? '+' : ''}${(player.costChangeEvent / 10).toFixed(1)}m`
                    : 'Unavailable'
                }
              />
            </Box>
            {!hasTransferTrendData && !hasPriceMovementData && (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                Event transfer and price-movement fields are not present in the synced active-season
                player file, so this section shows available ownership only.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Stack>
    </PageContent>
  );
}
