import React, { useMemo, useState } from 'react';
import { Box, Chip, Collapse, Divider, Stack, Typography } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { FixtureRepository } from '@repositories/fixtures';
import { ClubLogo } from '@shared/components/data-display';
import { ThemeTokens } from '@shared/theme/tokens';
import type { MatchCenterFixture } from '../services';
import { FixtureMatchDetails } from './FixtureMatchDetails';

export interface FixturesListProps {
  gameweekId: number;
  limit?: number;
  compact?: boolean;
  title?: string;
  liveFixtures?: MatchCenterFixture[] | null;
}

export const FixturesList: React.FC<FixturesListProps> = ({
  gameweekId,
  limit,
  compact = false,
  title,
  liveFixtures,
}) => {
  const [expandedFixtureId, setExpandedFixtureId] = useState<number | null>(null);
  const fixtures = useMemo(() => {
    try {
      return new FixtureRepository().getByGameweek(gameweekId).sort((left, right) => {
        return new Date(left.kickoffTime).getTime() - new Date(right.kickoffTime).getTime();
      });
    } catch {
      return [];
    }
  }, [gameweekId]);

  const counts = useMemo(
    () => ({
      finished: fixtures.filter((fixture) => fixture.finished).length,
      live: fixtures.filter((fixture) => fixture.started && !fixture.finished).length,
      upcoming: fixtures.filter((fixture) => !fixture.started && !fixture.finished).length,
      total: fixtures.length,
    }),
    [fixtures]
  );

  const displayedFixtures = limit ? fixtures.slice(0, limit) : fixtures;

  if (fixtures.length === 0) {
    return null;
  }

  return (
    <Box sx={{ marginBottom: ThemeTokens.spacing.md }}>
      {title !== '' && (
        <Typography variant="h6" sx={{ fontWeight: 750, mb: 1.5, fontSize: '1rem' }}>
          {title ?? `Gameweek ${gameweekId} Fixtures`}
        </Typography>
      )}

      {!compact && (
        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 2 }}
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: '8px',
            backgroundColor: '#f8fafc',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {counts.total} matches
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {counts.finished} finished
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {counts.live} live
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {counts.upcoming} upcoming
          </Typography>
        </Stack>
      )}

      <Stack spacing={compact ? 1 : 1.5}>
        {displayedFixtures.map((fixture) => {
          const isLive = fixture.started && !fixture.finished;
          const kickoff = new Date(fixture.kickoffTime);
          const liveFixture = liveFixtures?.find((item) => item.id === fixture.id);
          const isExpanded = expandedFixtureId === fixture.id;

          return (
            <Box
              key={fixture.id}
              sx={{
                overflow: 'hidden',
                backgroundColor: '#fff',
                border: '1px solid',
                borderColor: isLive ? '#fca5a5' : 'divider',
                borderRadius: '8px',
                transition: 'transform 160ms ease, box-shadow 160ms ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
                },
              }}
            >
              <Box
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onClick={() => setExpandedFixtureId(isExpanded ? null : fixture.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setExpandedFixtureId(isExpanded ? null : fixture.id);
                  }
                }}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
                  alignItems: 'center',
                  gap: 1.5,
                  p: compact ? 1.25 : 1.5,
                  cursor: 'pointer',
                }}
              >
                <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 1fr) auto minmax(80px, 1fr)', alignItems: 'center', gap: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                  <ClubLogo
                    teamCode={fixture.homeTeam.code}
                    clubName={fixture.homeTeam.shortName}
                    size="small"
                  />
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }} noWrap>
                    {fixture.homeTeam.shortName}
                  </Typography>
                  </Stack>

                  <Typography sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                  {fixture.started || fixture.finished
                    ? `${fixture.homeTeamScore ?? 0} — ${fixture.awayTeamScore ?? 0}`
                    : 'vs'}
                  </Typography>

                  <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', justifyContent: 'flex-end', minWidth: 0 }}
                >
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }} noWrap>
                    {fixture.awayTeam.shortName}
                  </Typography>
                  <ClubLogo
                    teamCode={fixture.awayTeam.code}
                    clubName={fixture.awayTeam.shortName}
                    size="small"
                  />
                  </Stack>
                </Box>

                <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: { xs: 'flex-end', sm: 'initial' } }}
                >
                {!fixture.started && !fixture.finished && (
                  <Typography variant="caption" color="text.secondary">
                    {kickoff.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                )}
                <Chip
                  size="small"
                  label={fixture.finished ? 'FT' : isLive ? 'LIVE' : 'Upcoming'}
                  sx={{
                    height: 24,
                    fontWeight: 750,
                    color: fixture.finished ? '#166534' : isLive ? '#b91c1c' : '#1d4ed8',
                    backgroundColor: fixture.finished ? '#dcfce7' : isLive ? '#fee2e2' : '#dbeafe',
                  }}
                />
                  <KeyboardArrowDownRoundedIcon sx={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease', color: '#64748b' }} />
                </Stack>
              </Box>

              <Collapse in={isExpanded} unmountOnExit>
                <Divider />
                <FixtureMatchDetails fixture={fixture} liveFixture={liveFixture} />
              </Collapse>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};
