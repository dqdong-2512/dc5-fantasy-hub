import React, { useMemo } from 'react';
import { Box, Stack, Typography, Tabs, Tab } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ThemeTokens } from '@shared/theme/tokens';
import { FantasyGameHeader } from '../components';
import { useGameweekHubState } from '../context';

interface HubTab {
  label: string;
  path: string;
}

const HUB_TABS: HubTab[] = [
  { label: 'Overview', path: '/premier-league/gameweek' },
  { label: 'My Team', path: '/premier-league/gameweek/my-team' },
  { label: 'League', path: '/premier-league/gameweek/league' },
  { label: 'Fixtures', path: '/premier-league/gameweek/fixtures' },
  { label: 'Clubs', path: '/premier-league/gameweek/clubs' },
  { label: 'Table', path: '/premier-league/gameweek/table' },
];

export function GameweekHubShell(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const gameState = useGameweekHubState();

  const activeTab = useMemo(() => {
    const currentPath = location.pathname;

    if (currentPath === '/premier-league/gameweek') {
      return 0;
    }

    const matchedIndex = HUB_TABS.findIndex(
      (tab) => currentPath === tab.path || currentPath.startsWith(`${tab.path}/`)
    );

    return matchedIndex >= 0 ? matchedIndex : 0;
  }, [location.pathname]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    navigate(HUB_TABS[newValue].path);
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
              <Tab key={tab.path} label={tab.label} />
            ))}
          </Tabs>
        </Stack>
      </Box>

      <Outlet />
    </Box>
  );
}
