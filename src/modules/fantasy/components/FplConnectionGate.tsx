import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { FantasyGameRepository } from '@repositories/fantasy';
import { useGameweekHubState } from '../context';

export const CONNECTED_LEAGUE_STORAGE_KEY = 'fpl:connected_league_id';

export function getStoredLeagueId(): number | null {
  try {
    const value = localStorage.getItem(CONNECTED_LEAGUE_STORAGE_KEY);
    if (!value) {
      return null;
    }

    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
  } catch {
    return null;
  }
}

function setStoredLeagueId(leagueId: number | null): void {
  try {
    if (!leagueId) {
      localStorage.removeItem(CONNECTED_LEAGUE_STORAGE_KEY);
      return;
    }

    localStorage.setItem(CONNECTED_LEAGUE_STORAGE_KEY, leagueId.toString());
  } catch {
    console.error('Failed to persist connected league id');
  }
}

export interface FplConnectionGateProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  showConnectedSummary?: boolean;
}

export function FplConnectionGate({
  children,
  title = 'Connect your FPL team',
  description = 'Enter your FPL Entry ID to unlock authenticated features.',
  showConnectedSummary = true,
}: FplConnectionGateProps): React.ReactElement {
  const gameState = useGameweekHubState();
  const repository = useMemo(() => new FantasyGameRepository(), []);
  const [entryIdInput, setEntryIdInput] = useState('');
  const [leagueIdInput, setLeagueIdInput] = useState(() => {
    const stored = getStoredLeagueId();
    return stored ? stored.toString() : '';
  });
  const [entryValidationError, setEntryValidationError] = useState('');
  const [leagueValidationError, setLeagueValidationError] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [isEditingConnection, setIsEditingConnection] = useState(false);

  const effectiveConnectedLeagueId = useMemo(() => {
    const storedLeagueId = getStoredLeagueId();
    if (storedLeagueId) {
      return storedLeagueId;
    }

    if (gameState.entry?.joinedLeaguesIds && gameState.entry.joinedLeaguesIds.length > 0) {
      return gameState.entry.joinedLeaguesIds[0];
    }

    return null;
  }, [gameState.entry]);

  const validateEntryId = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      setEntryValidationError('Team ID is required');
      return null;
    }

    const parsed = parseInt(trimmed, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setEntryValidationError('Team ID must be a positive number');
      return null;
    }

    return parsed;
  };

  const validateLeagueId = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      setLeagueValidationError('');
      return null;
    }

    const parsed = parseInt(trimmed, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setLeagueValidationError('League ID must be a positive number');
      return null;
    }

    setLeagueValidationError('');
    return parsed;
  };

  const handleConnect = async (): Promise<void> => {
    setEntryValidationError('');
    setLeagueValidationError('');
    setConnectionError('');

    const entryId = validateEntryId(entryIdInput);
    if (entryId === null) {
      return;
    }

    const parsedLeagueId = validateLeagueId(leagueIdInput);
    if (leagueIdInput.trim() !== '' && parsedLeagueId === null) {
      return;
    }

    try {
      if (parsedLeagueId !== null) {
        await repository.getLeagueStandings(parsedLeagueId, 1);
      }
      await gameState.connectEntry(entryId);
      setStoredLeagueId(parsedLeagueId);
      setIsEditingConnection(false);
    } catch (error) {
      setConnectionError(
        error instanceof Error ? error.message : 'Unable to connect to the FPL data service.'
      );
    }
  };

  const handleDisconnect = (): void => {
    gameState.disconnectEntry();
    setStoredLeagueId(null);
    setEntryIdInput('');
    setLeagueIdInput('');
    setEntryValidationError('');
    setLeagueValidationError('');
    setConnectionError('');
    setIsEditingConnection(false);
  };

  const handleStartChangeConnection = (): void => {
    setIsEditingConnection(true);
    setEntryValidationError('');
    setLeagueValidationError('');
    setConnectionError('');
    setEntryIdInput(gameState.connectedEntryId ? gameState.connectedEntryId.toString() : '');
    setLeagueIdInput(effectiveConnectedLeagueId ? effectiveConnectedLeagueId.toString() : '');
  };

  const shouldShowForm = !gameState.isConnected || isEditingConnection;

  return (
    <Stack spacing={ThemeTokens.spacing.sm}>
      {shouldShowForm ? (
        <Card>
          <CardContent>
            <Stack spacing={ThemeTokens.spacing.sm}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              </Box>

              <TextField
                label="Entry ID"
                value={entryIdInput}
                onChange={(event) => {
                  setEntryIdInput(event.target.value);
                  setEntryValidationError('');
                }}
                error={Boolean(entryValidationError)}
                helperText={entryValidationError}
                size="small"
                type="number"
                slotProps={{ htmlInput: { min: 1 } }}
                fullWidth
              />

              <TextField
                label="League ID (optional)"
                value={leagueIdInput}
                onChange={(event) => {
                  setLeagueIdInput(event.target.value);
                  setLeagueValidationError('');
                }}
                error={Boolean(leagueValidationError)}
                helperText={
                  leagueValidationError || 'Used for quick league context in connected summary.'
                }
                size="small"
                type="number"
                slotProps={{ htmlInput: { min: 1 } }}
                fullWidth
              />

              {(connectionError || gameState.error) && (
                <Alert severity="error">{connectionError || gameState.error}</Alert>
              )}

              <Stack direction="row" spacing={ThemeTokens.spacing.sm}>
                <Button
                  variant="contained"
                  onClick={() => {
                    void handleConnect();
                  }}
                  disabled={gameState.isConnecting}
                >
                  {gameState.isConnecting ? (
                    <>
                      <CircularProgress size={16} sx={{ mr: 0.5 }} />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </Button>

                {gameState.isConnected && isEditingConnection && (
                  <Button
                    variant="text"
                    onClick={() => {
                      setIsEditingConnection(false);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : showConnectedSummary ? (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Connected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Team: {gameState.entry?.team.name ?? '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manager: {gameState.entry?.manager.name ?? '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall Rank:{' '}
                {gameState.entry?.manager.overallRank
                  ? `#${gameState.entry.manager.overallRank.toLocaleString()}`
                  : '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overall Points: {gameState.entry?.manager.totalPoints ?? '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connected League:{' '}
                {effectiveConnectedLeagueId ? `League ${effectiveConnectedLeagueId}` : 'Not set'}
              </Typography>
              <Stack
                direction="row"
                spacing={ThemeTokens.spacing.sm}
                sx={{ mt: ThemeTokens.spacing.xs }}
              >
                <Button variant="outlined" size="small" onClick={handleStartChangeConnection}>
                  Change Connection
                </Button>
                <Button variant="outlined" color="error" size="small" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {gameState.isConnected && children}
    </Stack>
  );
}
