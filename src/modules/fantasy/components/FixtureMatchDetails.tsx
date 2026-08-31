import React, { useMemo, useState } from 'react';
import { Alert, Box, Chip, Divider, Stack, Tab, Tabs, Typography } from '@mui/material';
import SportsSoccerRoundedIcon from '@mui/icons-material/SportsSoccerRounded';
import { ClubLogo, PlayerAvatar } from '@shared/components/data-display';
import type { Fixture } from '@domain/models';
import type { MatchCenterFixture, MatchPlayerStat, MatchTimelineEvent } from '../services';

interface FixtureMatchDetailsProps {
  fixture: Fixture;
  liveFixture?: MatchCenterFixture;
}

const EVENT_SECTIONS: Array<{ type: MatchTimelineEvent['type']; label: string }> = [
  { type: 'goal', label: 'Goals scored' },
  { type: 'assist', label: 'Assists' },
  { type: 'own_goal', label: 'Own goals' },
  { type: 'yellow', label: 'Yellow cards' },
  { type: 'red', label: 'Red cards' },
  { type: 'penalty_missed', label: 'Penalties missed' },
  { type: 'bonus_change', label: 'Bonus' },
];

function PlayerValue({ event }: { event: MatchTimelineEvent }): React.ReactElement {
  return (
    <Typography variant="body2" sx={{ fontWeight: 750 }}>
      {event.playerName} {event.quantity > 1 ? `(${event.quantity})` : ''}
    </Typography>
  );
}

function EventSection({ fixture, events, label }: { fixture: MatchCenterFixture; events: MatchTimelineEvent[]; label: string }): React.ReactElement | null {
  if (!events.length) return null;
  const home = events.filter((event) => event.teamId === fixture.homeTeamId);
  const away = events.filter((event) => event.teamId === fixture.awayTeamId);
  return (
    <Box sx={{ overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#fff' }}>
      <Typography sx={{ py: 1, px: 1.5, textAlign: 'center', fontWeight: 850, backgroundColor: '#f3e8ff', color: '#4c1d95' }}>{label}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <Stack spacing={0.75} sx={{ p: 1.5, textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>{home.length ? home.map((event) => <PlayerValue key={event.id} event={event} />) : <Typography color="text.secondary">—</Typography>}</Stack>
        <Stack spacing={0.75} sx={{ p: 1.5 }}>{away.length ? away.map((event) => <PlayerValue key={event.id} event={event} />) : <Typography color="text.secondary">—</Typography>}</Stack>
      </Box>
    </Box>
  );
}

function TeamMetric({ label, home, away, max }: { label: string; home: number; away: number; max: number }): React.ReactElement {
  const safeMax = Math.max(max, 1);
  return (
    <Box sx={{ py: 1.25 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Typography sx={{ fontWeight: 850 }}>{home}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography sx={{ fontWeight: 850 }}>{away}</Typography>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
        <Box sx={{ height: 7, display: 'flex', justifyContent: 'flex-end', borderRadius: 99, overflow: 'hidden', backgroundColor: '#e2e8f0' }}><Box sx={{ width: `${(home / safeMax) * 100}%`, backgroundColor: '#7c3aed' }} /></Box>
        <Box sx={{ height: 7, borderRadius: 99, overflow: 'hidden', backgroundColor: '#e2e8f0' }}><Box sx={{ width: `${(away / safeMax) * 100}%`, height: '100%', backgroundColor: '#0284c7' }} /></Box>
      </Box>
    </Box>
  );
}

export const FixtureMatchDetails: React.FC<FixtureMatchDetailsProps> = ({ fixture, liveFixture }) => {
  const [tab, setTab] = useState(0);
  const playerStats = useMemo(() => liveFixture?.playerStats ?? [], [liveFixture?.playerStats]);
  const aggregates = useMemo(() => {
    const sum = (teamId: number, key: keyof MatchPlayerStat) => playerStats.filter((player) => player.teamId === teamId).reduce((total, player) => total + (typeof player[key] === 'number' ? Number(player[key]) : 0), 0);
    const rows = [
      ['Goals', 'goals'], ['Assists', 'assists'], ['Saves', 'saves'], ['Yellow cards', 'yellowCards'],
      ['Red cards', 'redCards'], ['Bonus points', 'bonus'], ['Bonus points system', 'bps'], ['FPL points', 'totalPoints'],
    ] as const;
    return rows.map(([label, key]) => {
      const home = sum(liveFixture?.homeTeamId ?? fixture.homeTeam.id, key);
      const away = sum(liveFixture?.awayTeamId ?? fixture.awayTeam.id, key);
      return { label, home, away, max: Math.max(home, away) };
    });
  }, [fixture.awayTeam.id, fixture.homeTeam.id, liveFixture?.awayTeamId, liveFixture?.homeTeamId, playerStats]);

  return (
    <Box sx={{ backgroundColor: '#f8fafc' }}>
      <Box sx={{ p: { xs: 1.5, md: 2.5 }, color: '#fff', background: 'linear-gradient(120deg, #37003c, #6d0875 60%, #0e7490)' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)', gap: { xs: 1, md: 2 }, alignItems: 'center', maxWidth: 760, mx: 'auto' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end', minWidth: 0 }}><Typography sx={{ fontWeight: 900 }} noWrap>{fixture.homeTeam.name}</Typography><ClubLogo teamCode={fixture.homeTeam.code} clubName={fixture.homeTeam.name} size="large" lazy={false} /></Stack>
          <Box sx={{ px: { xs: 1.25, md: 2 }, py: 1, borderRadius: '10px', backgroundColor: 'rgba(0,0,0,.2)' }}><Typography variant="h5" sx={{ fontWeight: 900, whiteSpace: 'nowrap' }}>{fixture.started || fixture.finished ? `${fixture.homeTeamScore ?? 0} – ${fixture.awayTeamScore ?? 0}` : 'vs'}</Typography></Box>
          <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}><ClubLogo teamCode={fixture.awayTeam.code} clubName={fixture.awayTeam.name} size="large" lazy={false} /><Typography sx={{ fontWeight: 900 }} noWrap>{fixture.awayTeam.name}</Typography></Stack>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_event, value: number) => setTab(value)} variant="scrollable" allowScrollButtonsMobile sx={{ px: { xs: 1, md: 2 }, backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', '& .MuiTab-root': { textTransform: 'none', fontWeight: 800 } }}>
        <Tab label="Match details" />
        <Tab label="Player stats" />
        <Tab label="FPL match stats" />
      </Tabs>

      <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
        {tab === 0 && (
          <Stack spacing={1.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1 }}>
              <Box><Typography variant="caption" color="text.secondary">Kick-off</Typography><Typography sx={{ fontWeight: 750 }}>{new Date(fixture.kickoffTime).toLocaleString([], { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Status</Typography><Typography sx={{ fontWeight: 750 }}>{liveFixture?.period || (fixture.finished ? 'Full time' : 'Not started')}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Venue / referee</Typography><Typography sx={{ fontWeight: 750 }}>{[liveFixture?.venue, liveFixture?.referee].filter(Boolean).join(' · ') || 'Not published by FPL'}</Typography></Box>
            </Box>
            <Divider />
            {liveFixture?.timeline.length ? EVENT_SECTIONS.map((section) => <EventSection key={section.type} fixture={liveFixture} label={section.label} events={liveFixture.timeline.filter((event) => event.type === section.type)} />) : <Alert severity="info">Match events will appear when FPL publishes the live player feed.</Alert>}
          </Stack>
        )}

        {tab === 1 && (
          playerStats.length ? (
            <Stack spacing={1}>
              {playerStats.map((player) => (
                <Stack key={player.playerId} direction="row" spacing={1.25} sx={{ alignItems: 'center', p: 1.25, border: '1px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#fff' }}>
                  <PlayerAvatar playerCode={player.playerCode} name={player.playerName} size="small" />
                  <Box sx={{ minWidth: 0, flex: 1 }}><Typography sx={{ fontWeight: 850 }} noWrap>{player.playerName}</Typography><Typography variant="caption" color="text.secondary">{player.teamShortName} · {player.minutes} min</Typography></Box>
                  <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {player.goals > 0 && <Chip size="small" label={`${player.goals} G`} />}
                    {player.assists > 0 && <Chip size="small" label={`${player.assists} A`} />}
                    {player.saves > 0 && <Chip size="small" label={`${player.saves} saves`} />}
                    {player.yellowCards > 0 && <Chip size="small" label="YC" sx={{ backgroundColor: '#fef08a' }} />}
                    {player.redCards > 0 && <Chip size="small" label="RC" color="error" />}
                    <Chip size="small" label={`${player.totalPoints} pts`} sx={{ color: '#fff', backgroundColor: '#37003c', fontWeight: 800 }} />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          ) : <Alert severity="info">Player statistics are not available before the live feed starts.</Alert>
        )}

        {tab === 2 && (
          playerStats.length ? (
            <Box sx={{ maxWidth: 760, mx: 'auto' }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}><Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}><ClubLogo teamCode={fixture.homeTeam.code} clubName={fixture.homeTeam.name} size="small" /><Typography sx={{ fontWeight: 850 }}>{fixture.homeTeam.shortName}</Typography></Stack><Typography variant="overline" color="text.secondary">FPL performance</Typography><Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}><Typography sx={{ fontWeight: 850 }}>{fixture.awayTeam.shortName}</Typography><ClubLogo teamCode={fixture.awayTeam.code} clubName={fixture.awayTeam.name} size="small" /></Stack></Stack>
              {aggregates.map((metric) => <TeamMetric key={metric.label} {...metric} />)}
              <Alert severity="info" icon={<SportsSoccerRoundedIcon />} sx={{ mt: 2 }}>The public FPL API provides fantasy player metrics, not possession, shots, passes or line-ups. This tab therefore shows complete FPL-derived match statistics without inventing unavailable football data.</Alert>
            </Box>
          ) : <Alert severity="info">FPL match statistics will populate once player live data is published.</Alert>
        )}
      </Box>
    </Box>
  );
};
