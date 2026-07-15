/**
 * Connect Team Page
 * Onboarding experience for connecting FPL team
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  Collapse,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { PageContent, PageHeader } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';

export interface ConnectTeamProps {
  onConnect: (entryId: number) => Promise<void>;
  error?: string | null;
  isLoading?: boolean;
}

/**
 * Connect Team Component
 * Allows user to enter and validate their FPL Entry ID
 */
export function ConnectTeam({
  onConnect,
  error,
  isLoading = false,
}: ConnectTeamProps): React.ReactElement {
  const [teamId, setTeamId] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleTeamIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamId(e.target.value);
    setValidationError('');
  };

  const validateTeamId = (id: string): number | null => {
    const trimmed = id.trim();
    if (!trimmed) {
      setValidationError('Team ID is required');
      return null;
    }

    const parsed = parseInt(trimmed, 10);
    if (isNaN(parsed) || parsed <= 0) {
      setValidationError('Team ID must be a positive number');
      return null;
    }

    return parsed;
  };

  const handleConnect = async () => {
    const validated = validateTeamId(teamId);
    if (validated === null) return;

    try {
      await onConnect(validated);
    } catch {
      // Error is handled by parent component
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConnect();
    }
  };

  return (
    <PageContent>
      <PageHeader>
        <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1 }}>
          Fantasy Game
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect your Fantasy Premier League team
        </Typography>
      </PageHeader>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: ThemeTokens.spacing.xl,
        }}
      >
        {/* Main Content */}
        <Box>
          <Card>
            <CardContent sx={{ padding: ThemeTokens.spacing.lg }}>
              <Stack spacing={ThemeTokens.spacing.lg}>
                {/* Benefits */}
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.md }}
                  >
                    Connect to access:
                  </Typography>
                  <Stack spacing={ThemeTokens.spacing.sm} component="ul" sx={{ paddingLeft: 2 }}>
                    <Typography component="li" variant="body2">
                      My Team
                    </Typography>
                    <Typography component="li" variant="body2">
                      Gameweek Picks
                    </Typography>
                    <Typography component="li" variant="body2">
                      Mini Leagues
                    </Typography>
                    <Typography component="li" variant="body2">
                      League Standings
                    </Typography>
                  </Stack>
                </Box>

                {/* Form */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.sm }}
                  >
                    FPL Team ID
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    placeholder="Enter your Team ID"
                    value={teamId}
                    onChange={handleTeamIdChange}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    error={!!validationError}
                    helperText={validationError}
                    slotProps={{
                      input: {
                        inputMode: 'numeric',
                      },
                    }}
                    sx={{
                      marginBottom: ThemeTokens.spacing.md,
                    }}
                  />

                  {error && (
                    <Alert severity="error" sx={{ marginBottom: ThemeTokens.spacing.md }}>
                      {error}
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleConnect}
                    disabled={isLoading}
                    sx={{
                      textTransform: 'none',
                      fontSize: '1rem',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress size={20} sx={{ marginRight: 1 }} />
                        Connecting...
                      </>
                    ) : (
                      'Connect Team'
                    )}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Help Section */}
        <Box>
          <Card>
            <Box
              sx={{
                padding: ThemeTokens.spacing.lg,
                backgroundColor: '#f5f5f5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => setShowHelp(!showHelp)}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Finding Your Team ID
              </Typography>
              <IconButton size="small">
                {showHelp ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            <Collapse in={showHelp}>
              <CardContent sx={{ paddingTop: 0 }}>
                <Stack spacing={ThemeTokens.spacing.md}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.xs }}
                    >
                      Option 1: Official FPL Website
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      1. Visit{' '}
                      <Typography component="span" sx={{ fontFamily: 'monospace' }}>
                        fantasy.premierleague.com
                      </Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      2. Log into your account
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      3. Check the URL in your browser. Your Team ID is the number at the end
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      4. Example:{' '}
                      <Typography component="span" sx={{ fontFamily: 'monospace', color: '#666' }}>
                        fantasy.premierleague.com/entry/123456/
                      </Typography>{' '}
                      (Your Team ID is 123456)
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, marginBottom: ThemeTokens.spacing.xs }}
                    >
                      Option 2: Public Profile Link
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      If you have shared your team link with others, your Team ID is in that URL:
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: 'monospace', marginTop: 0.5, display: 'block' }}
                    >
                      fantasy.premierleague.com/entry/123456/public/
                    </Typography>
                  </Box>

                  <Alert severity="info">
                    We only need your public Team ID. Your password and personal information are
                    never required.
                  </Alert>
                </Stack>
              </CardContent>
            </Collapse>
          </Card>
        </Box>
      </Box>
    </PageContent>
  );
}
