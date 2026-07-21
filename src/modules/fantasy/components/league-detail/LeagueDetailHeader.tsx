/**
 * League Detail Header Component
 * Provides league and gameweek selection
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { BootstrapRepository } from '@repositories/bootstrap';

export interface LeagueDetailHeaderProps {
  leagueName: string;
  selectedLeagueId: number;
  selectedGameweekId: number;
  onLeagueChange: (leagueId: number) => void;
  onGameweekChange: (gameweekId: number) => void;
  leagues?: Array<{ id: number; name: string }>;
  isLoading?: boolean;
}

export const LeagueDetailHeader: React.FC<LeagueDetailHeaderProps> = ({
  leagueName,
  selectedLeagueId,
  selectedGameweekId,
  onLeagueChange,
  onGameweekChange,
  leagues = [],
  isLoading = false,
}) => {
  const bootstrapRepo = useMemo(() => new BootstrapRepository(), []);
  const bootstrap = useMemo(() => {
    try {
      return bootstrapRepo.getBootstrap();
    } catch {
      return { gameweeks: [] };
    }
  }, [bootstrapRepo]);

  const currentGameweek = useMemo(() => {
    return bootstrap.gameweeks.find((gw) => !gw.finished);
  }, [bootstrap.gameweeks]);

  return (
    <Box
      sx={{
        padding: ThemeTokens.spacing.md,
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
      }}
    >
      <Stack spacing={ThemeTokens.spacing.md}>
        {/* League Name */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, marginBottom: ThemeTokens.spacing.sm }}>
            {leagueName || 'League'}
          </Typography>
        </Box>

        {/* Selectors */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={ThemeTokens.spacing.md}>
          {/* League Selector */}
          {leagues.length > 0 && (
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Switch League</InputLabel>
              <Select
                value={selectedLeagueId || ''}
                onChange={(e) => onLeagueChange(Number(e.target.value))}
                label="Switch League"
                disabled={isLoading}
              >
                {leagues.map((league) => (
                  <MenuItem key={league.id} value={league.id}>
                    {league.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Gameweek Selector */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Gameweek</InputLabel>
            <Select
              value={selectedGameweekId || ''}
              onChange={(e) => onGameweekChange(Number(e.target.value))}
              label="Gameweek"
              disabled={isLoading}
            >
              {bootstrap.gameweeks.map((gw) => (
                <MenuItem key={gw.id} value={gw.id}>
                  GW {gw.id} {gw.finished ? '(Finished)' : '(Upcoming)'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Current Gameweek Status */}
          {currentGameweek && (
            <Chip
              label={`Current: GW ${currentGameweek.id}`}
              color="primary"
              variant="outlined"
              sx={{ alignSelf: 'center', height: 32 }}
            />
          )}
        </Stack>
      </Stack>
    </Box>
  );
};
