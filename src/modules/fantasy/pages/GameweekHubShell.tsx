import React, { useMemo } from 'react';
import { Box, Stack, Tabs, Tab } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PageContainer } from '@shared/components';
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
    pathname === '/premier-league/gameweek/team' ||
    pathname.startsWith('/premier-league/gameweek/transfers') ||
    pathname.startsWith('/premier-league/gameweek/transfer-planner') ||
    pathname.startsWith('/premier-league/gameweek/planner') ||
    pathname.startsWith('/premier-league/gameweek/gameweek-planner') ||
    pathname.startsWith('/premier-league/gameweek/season-planner')
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
      {gameState.isConnected && (
        <Box
          data-testid="gameweek-hub-tabs"
          sx={{
            borderBottom: '1px solid #e0e0e0',
            marginTop: { xs: ThemeTokens.spacing.sm, md: ThemeTokens.spacing.md },
            paddingX: { xs: ThemeTokens.spacing.md, md: ThemeTokens.spacing.xl },
            paddingY: { xs: ThemeTokens.spacing.md, md: ThemeTokens.spacing.lg },
            backgroundColor: '#ffffff',
          }}
        >
          <Stack
            direction="row"
            spacing={{ xs: ThemeTokens.spacing.sm, md: ThemeTokens.spacing.md }}
            sx={{ alignItems: 'stretch' }}
          >
            <Box
              component="img"
              src="/fantasy-logo.png"
              alt="Fantasy Premier League"
              sx={{
                width: { xs: 56, md: 80 },
                height: { xs: 56, md: 80 },
                objectFit: 'contain',
                flexShrink: 0,
                alignSelf: 'center',
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <FantasyGameHeader
                entry={gameState.entry}
                gameweekHistory={gameState.history}
                onChangeTeam={gameState.disconnectEntry}
                onDisconnect={gameState.disconnectEntry}
              />
            </Box>
          </Stack>
        </Box>
      )}

      <PageContainer
        sx={{
          paddingTop: { xs: ThemeTokens.spacing.md, md: ThemeTokens.spacing.xl },
          paddingBottom: 0,
        }}
      >
        <Box
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: '#ffffff',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 600,
              },
            }}
          >
            {HUB_TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      </PageContainer>

      {activeTab === 'my-team' || activeTab === 'league' ? (
        <PageContainer sx={{ paddingTop: 0, paddingBottom: 0 }}>
          <Outlet />
        </PageContainer>
      ) : (
        <Outlet />
      )}
    </Box>
  );
}
