import React, { useMemo, useState } from 'react';
import { Box, Chip, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material';
import { BootstrapRepository } from '@repositories/bootstrap';
import { PageContainer, StandingsTable } from '@shared/components';
import { useStandings, useStandingsByGameweek } from '@shared/hooks';
import { ThemeTokens } from '@shared/theme/tokens';

export const PremierLeagueTablePage: React.FC = () => {
  const bootstrapRepository = useMemo(() => new BootstrapRepository(), []);
  const allGameweeks = useMemo(
    () => bootstrapRepository.getBootstrap().gameweeks,
    [bootstrapRepository]
  );
  const latestStandings = useStandings();

  const [selectedGameweek, setSelectedGameweek] = useState<number | null>(null);
  const selectedSnapshot = useStandingsByGameweek(
    selectedGameweek ?? latestStandings.gameweekId ?? 1
  );

  const effectiveState = selectedGameweek === null ? latestStandings : selectedSnapshot;

  return (
    <PageContainer sx={{ padding: ThemeTokens.spacing.md }}>
      <Box sx={{ marginBottom: ThemeTokens.spacing.md }}>
        <Typography variant="h6" sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.sm }}>
          Premier League Table
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ marginBottom: ThemeTokens.spacing.md }}
        >
          {effectiveState.isPreSeason || effectiveState.gameweekId === null
            ? 'Standings will appear after the first completed fixtures.'
            : `Snapshot after Gameweek ${effectiveState.gameweekId}`}
        </Typography>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={selectedGameweek ?? ''}
            displayEmpty
            onChange={(event) => {
              const value = event.target.value;
              setSelectedGameweek(typeof value === 'string' && value === '' ? null : Number(value));
            }}
          >
            <MenuItem value="">
              {latestStandings.gameweekId ? `Gameweek ${latestStandings.gameweekId}` : 'Current table'}
            </MenuItem>
            {allGameweeks.map((gameweek) => (
              <MenuItem key={gameweek.id} value={gameweek.id}>
                {gameweek.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}>
          <Chip size="small" label="Champions League" sx={{ color: '#166534', backgroundColor: '#dcfce7' }} />
          <Chip size="small" label="European places" sx={{ color: '#1d4ed8', backgroundColor: '#dbeafe' }} />
          <Chip size="small" label="Relegation" sx={{ color: '#b91c1c', backgroundColor: '#fee2e2' }} />
        </Stack>
      </Box>

      <StandingsTable
        standings={effectiveState.standings}
        isPreSeason={effectiveState.isPreSeason}
        message={effectiveState.message}
      />
    </PageContainer>
  );
};
