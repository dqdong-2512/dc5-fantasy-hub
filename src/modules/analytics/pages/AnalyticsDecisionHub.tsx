import React from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PageContent, PageHeader } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';

const ROUTE_TO_TAB: Record<string, string> = {
  '/premier-league/analytics': 'overview',
  '/premier-league/analytics/overview': 'overview',
  '/premier-league/analytics/captain': 'captain',
  '/premier-league/analytics/transfers': 'transfers',
  '/premier-league/analytics/fixtures': 'fixtures',
  '/premier-league/analytics/team': 'team',
};

export function AnalyticsDecisionHub(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();

  const tab = ROUTE_TO_TAB[location.pathname] ?? 'overview';

  return (
    <PageContent>
      <PageHeader>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Decision Hub
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Rule-based FPL insights for captaincy, transfers, fixtures, and team health.
        </Typography>
      </PageHeader>

      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: ThemeTokens.spacing.md }}>
        <Tabs
          value={tab}
          onChange={(_, value: string) => navigate(`/premier-league/analytics/${value}`)}
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 130,
            },
          }}
        >
          <Tab label="Overview" value="overview" />
          <Tab label="Captain" value="captain" />
          <Tab label="Transfers" value="transfers" />
          <Tab label="Fixtures" value="fixtures" />
          <Tab label="My Team" value="team" />
        </Tabs>
      </Box>

      <Outlet />
    </PageContent>
  );
}
