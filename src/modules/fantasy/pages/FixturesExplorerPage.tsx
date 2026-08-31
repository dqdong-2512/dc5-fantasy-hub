import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import SportsSoccerOutlinedIcon from '@mui/icons-material/SportsSoccerOutlined';
import { BootstrapRepository } from '@repositories/bootstrap';
import { FixtureRepository } from '@repositories/fixtures';
import { PageContainer } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { FixturesList } from '../components';
import { useLiveMatchCenter } from '../hooks';
import { useGameweekHubState } from '../context';
import { getStoredLeagueId } from '../components/FplConnectionGate';

export const FixturesExplorerPage: React.FC = () => {
  const gameState = useGameweekHubState();
  const gameweeks = useMemo(() => new BootstrapRepository().getBootstrap().gameweeks, []);
  const initialGameweek = useMemo(() => {
    return gameweeks.find((gameweek) => !gameweek.finished)?.id ?? gameweeks.at(-1)?.id ?? 1;
  }, [gameweeks]);
  const [selectedGameweek, setSelectedGameweek] = useState(initialGameweek);

  const selected = gameweeks.find((gameweek) => gameweek.id === selectedGameweek);
  const fixtureRepository = useMemo(() => new FixtureRepository(), []);
  const fixtures = fixtureRepository.getByGameweek(selectedGameweek);
  const live = useLiveMatchCenter({
    gameweekId: selectedGameweek,
    connectedEntryId: gameState.connectedEntryId,
    connectedLeagueId: getStoredLeagueId(),
    autoRefresh: true,
  });

  return (
    <PageContainer
      sx={{
        paddingTop: ThemeTokens.spacing.lg,
        paddingBottom: ThemeTokens.spacing.xxl,
      }}
    >
      <Stack spacing={ThemeTokens.spacing.lg}>
        <Card
          sx={{
            color: '#fff',
            background: 'linear-gradient(125deg, #0f172a, #1e3a8a 65%, #0284c7)',
            boxShadow: '0 14px 30px rgba(15, 23, 42, 0.16)',
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
            >
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                  <SportsSoccerOutlinedIcon />
                  <Typography variant="overline" sx={{ letterSpacing: 1.3, opacity: 0.78 }}>
                    Fixtures & results
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 850 }}>
                  Gameweek {selectedGameweek}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
                  <CalendarMonthOutlinedIcon sx={{ fontSize: 18, opacity: 0.75 }} />
                  <Typography variant="body2" sx={{ opacity: 0.82 }}>
                    {selected
                      ? new Date(selected.deadline).toLocaleString([], {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Schedule unavailable'}
                  </Typography>
                </Stack>
              </Box>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={selectedGameweek}
                  onChange={(event) => setSelectedGameweek(Number(event.target.value))}
                  sx={{ color: '#0f172a', backgroundColor: '#fff', fontWeight: 700 }}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },
                    slotProps: {
                      paper: {
                        sx: {
                          mt: 1,
                          maxHeight: 304,
                          minWidth: 150,
                          borderRadius: '8px',
                          boxShadow: '0 14px 32px rgba(15, 23, 42, 0.18)',
                          '& .MuiMenu-list': {
                            py: 0.75,
                          },
                          '& .MuiMenuItem-root': {
                            minHeight: 40,
                          },
                        },
                      },
                    },
                  }}
                >
                  {gameweeks.map((gameweek) => (
                    <MenuItem key={gameweek.id} value={gameweek.id}>
                      Gameweek {gameweek.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Chip label={`${fixtures.length} matches`} />
          <Chip
            label={`${fixtures.filter((fixture) => fixture.finished).length} finished`}
            sx={{ color: '#166534', backgroundColor: '#dcfce7' }}
          />
          <Chip
            label={`${fixtures.filter((fixture) => fixture.started && !fixture.finished).length} live`}
            sx={{ color: '#b91c1c', backgroundColor: '#fee2e2' }}
          />
        </Stack>

        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <FixturesList
              gameweekId={selectedGameweek}
              title="Full match schedule"
              liveFixtures={live.snapshot?.fixtures}
            />
          </CardContent>
        </Card>
      </Stack>
    </PageContainer>
  );
};
