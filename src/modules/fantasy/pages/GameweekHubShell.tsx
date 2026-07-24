import React, { useMemo } from 'react';
import { Box, Stack, Typography, Tabs, Tab } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ThemeTokens } from '@shared/theme/tokens';
import { FantasyGameHeader } from '../components';
import { useGameweekHubState } from '../context';

type HubTabValue = 'overview' | 'my-team' | 'league' | 'fixtures' | 'clubs' | 'table';

interface HubTab {
  value: HubTabValue;
  label: string;
  path: string;
}

const HUB_TABS: HubTab[] = [
  { value: 'overview', label: 'Overview', path: '/premier-league/gameweek/overview' },
  { value: 'my-team', label: 'My Team', path: '/premier-league/gameweek/my-team' },
  { value: 'league', label: 'League', path: '/premier-league/gameweek/league' },
  { value: 'fixtures', label: 'Fixtures', path: '/premier-league/gameweek/fixtures' },
  { value: 'clubs', label: 'Clubs', path: '/premier-league/gameweek/clubs' },
  { value: 'table', label: 'Table', path: '/premier-league/gameweek/table' },
];

function resolveHubTabValue(pathname: string): HubTabValue {
  if (
    pathname === '/premier-league/gameweek' ||
    pathname === '/premier-league/gameweek/' ||
    pathname === '/premier-league/gameweek/overview' ||
    pathname === '/premier-league/gameweek/connect'
  ) {
    return 'overview';
  }

  if (
    pathname.startsWith('/premier-league/gameweek/my-team') ||
    pathname === '/premier-league/gameweek/team'
  ) {
    return 'my-team';
  }

  if (
    pathname.startsWith('/premier-league/gameweek/league') ||
    pathname.startsWith('/premier-league/gameweek/leagues')
  ) {
    return 'league';
  }

  if (pathname.startsWith('/premier-league/gameweek/fixtures')) {
    return 'fixtures';
  }

  if (pathname.startsWith('/premier-league/gameweek/clubs')) {
    return 'clubs';
  }

  if (pathname.startsWith('/premier-league/gameweek/table')) {
    return 'table';
  }

  return 'overview';
}

export function GameweekHubShell(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const gameState = useGameweekHubState();

  const activeTab = useMemo<HubTabValue>(() => {
    return resolveHubTabValue(location.pathname);
  }, [location.pathname]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: HubTabValue): void => {
    const selectedTab = HUB_TABS.find((tab) => tab.value === newValue);
    if (selectedTab) {
      navigate(selectedTab.path);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          borderBottom: '1px solid #e0e0e0',
          paddingX: ThemeTokens.spacing.md,
          paddingY: ThemeTokens.spacing.sm,
          backgroundColor: '#ffffff',
        }}
      >
        <Stack spacing={ThemeTokens.spacing.sm}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Gameweek Hub
          </Typography>
          {gameState.isConnected && (
            <FantasyGameHeader
              entry={gameState.entry}
              gameweekHistory={gameState.history}
              onChangeTeam={gameState.disconnectEntry}
              onDisconnect={gameState.disconnectEntry}
            />
          )}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
              },
            }}
          >
            {HUB_TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>
        </Stack>
      </Box>

      <Outlet />
    </Box>
  );
}
