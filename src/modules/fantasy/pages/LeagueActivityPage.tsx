import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import { getBootstrapRepository } from '@repositories/index';
import { PageContainer } from '@shared/components';
import { getStoredLeagueId } from '../components/FplConnectionGate';
import { useGameweekHubState } from '../context';
import { useManagerLeagues } from '../hooks';

function formatChip(chip?: string | null): string {
  if (!chip) return '—';
  const labels: Record<string, string> = {
    bboost: 'Bench Boost',
    '3xc': 'Triple Captain',
    freehit: 'Free Hit',
    wildcard: 'Wildcard',
  };
  return labels[chip.toLowerCase()] ?? chip;
}

export const LeagueActivityPage: React.FC = () => {
  const gameState = useGameweekHubState();
  const gameweeks = useMemo(() => getBootstrapRepository().getBootstrap().gameweeks, []);
  const [gameweek, setGameweek] = useState(
    gameState.displayGameweek ?? gameweeks.find((item) => !item.finished)?.id ?? gameweeks.at(-1)?.id ?? 1
  );
  const leagueIds = useMemo(() => {
    const preferred = getStoredLeagueId();
    const joined = gameState.entry?.joinedLeaguesIds ?? [];
    return preferred ? [preferred, ...joined.filter((id) => id !== preferred)] : joined;
  }, [gameState.entry?.joinedLeaguesIds]);
  const league = useManagerLeagues(
    gameState.connectedEntryId,
    leagueIds,
    gameweek,
    gameState.entry?.joinedLeagues
  );

  return (
    <PageContainer sx={{ py: { xs: 2, md: 3 } }}>
      <Stack spacing={2.5}>
        <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, color: '#fff', background: 'linear-gradient(120deg, #37003c, #6d0875 58%, #007a57)' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CompareArrowsRoundedIcon />
                <Typography variant="h4" sx={{ fontWeight: 900 }}>League transfer & chip activity</Typography>
              </Stack>
              <Typography sx={{ mt: 0.5, opacity: 0.76 }}>Every manager&apos;s deadline moves in one compact table.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <FormControl size="small" sx={{ minWidth: 210 }}>
                <Select value={league.currentLeagueId ?? ''} onChange={(event) => void league.selectLeague(Number(event.target.value))} sx={{ bgcolor: '#fff', fontWeight: 800 }}>
                  {(league.leagues ?? []).map((item) => <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 135 }}>
                <Select value={gameweek} onChange={(event) => setGameweek(Number(event.target.value))} sx={{ bgcolor: '#fff', fontWeight: 800 }}>
                  {gameweeks.map((item) => <MenuItem key={item.id} value={item.id}>Gameweek {item.id}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </Box>

        {league.error && <Alert severity="warning">{league.error}</Alert>}
        <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: 0 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ p: 2, alignItems: { sm: 'center' }, justifyContent: 'space-between', bgcolor: '#151d35', color: '#fff' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>{league.leagueName ?? 'League activity'}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>Points are gross GW points; hit is shown separately.</Typography>
              </Box>
              <Chip label={gameweeks.find((item) => item.id === gameweek)?.finished ? 'Final activity' : 'Live activity'} sx={{ bgcolor: '#00ff87', fontWeight: 900 }} />
            </Stack>
            {league.isLoadingStandings ? (
              <Box sx={{ minHeight: 280, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
            ) : (
              <TableContainer>
                <Table size="small" sx={{ minWidth: 720 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                      <TableCell>#</TableCell>
                      <TableCell>Manager</TableCell>
                      <TableCell align="right">GW pts</TableCell>
                      <TableCell align="right">Transfers</TableCell>
                      <TableCell align="right">Hit</TableCell>
                      <TableCell>Chip</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(league.standings ?? []).map((row, index) => (
                      <TableRow key={row.entryId} hover sx={{ bgcolor: row.entryId === gameState.connectedEntryId ? '#e6fff3' : undefined }}>
                        <TableCell sx={{ fontWeight: 800 }}>{index + 1}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 850, fontSize: '0.9rem' }}>{row.entryName}</Typography>
                          <Typography variant="caption" color="text.secondary">{row.entryId === gameState.connectedEntryId ? 'You' : row.playerName}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 900 }}>{row.eventPoints}</TableCell>
                        <TableCell align="right">{row.transfersMade ?? 0}</TableCell>
                        <TableCell align="right" sx={{ color: row.transferCost ? '#dc2626' : 'text.primary', fontWeight: 800 }}>{row.transferCost ? `-${row.transferCost}` : '0'}</TableCell>
                        <TableCell>{row.activeChip ? <Chip size="small" label={formatChip(row.activeChip)} sx={{ bgcolor: '#e90052', color: '#fff', fontWeight: 800 }} /> : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Stack direction="row" sx={{ justifyContent: 'space-between', p: 1.5, borderTop: '1px solid #e2e8f0' }}>
              <Button disabled={league.pageNumber <= 1} onClick={() => void league.previousPage()}>Previous</Button>
              <Button disabled={!league.hasNextPage} onClick={() => void league.nextPage()}>Next</Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </PageContainer>
  );
};
