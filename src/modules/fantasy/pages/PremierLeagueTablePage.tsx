import React, { useMemo, useState } from 'react';
import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material';
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
            <MenuItem value="">Latest Completed</MenuItem>
            {allGameweeks.map((gameweek) => (
              <MenuItem key={gameweek.id} value={gameweek.id}>
                {gameweek.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <StandingsTable
        standings={effectiveState.standings}
        isPreSeason={effectiveState.isPreSeason}
        message={effectiveState.message}
      />
    </PageContainer>
  );
};
