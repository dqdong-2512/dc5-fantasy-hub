/**
 * Club Explorer Page
 * Main interface for exploring Premier League clubs and their intelligence
 * Includes Club Intelligence view and League Standings view
 */

import React, { useState, useMemo } from 'react';
import { Box, Stack, Typography, Button, Tab, Tabs } from '@mui/material';
import type { Team } from '@domain/models';
import { BootstrapRepository } from '@repositories/bootstrap';
import { TeamRepository } from '@repositories/teams';
import { PageContent, PageHeader, PageSection, LoadingState } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import { useSeasonLabel, useStandings } from '@shared/hooks';
import {
  ClubOverview,
  ClubIntelligenceDrawer,
  ClubComparison,
  StandingsTable,
} from '../components';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`clubs-tabpanel-${index}`}
      aria-labelledby={`clubs-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

/**
 * Club Explorer
 * Production-quality analytics interface for club exploration and standings
 */
export function ClubExplorer(): React.ReactElement {
  const seasonLabel = useSeasonLabel();
  const standingsState = useStandings();
  const [selectedClub, setSelectedClub] = useState<Team | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedClubIds, setSelectedClubIds] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('strength');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [tabValue, setTabValue] = useState(0);

  // Initialize repositories
  const teamRepository = useMemo(() => new TeamRepository(), []);
  const bootstrapRepository = useMemo(() => new BootstrapRepository(), []);

  // Load data
  const { allClubs, gameweek, clubCount } = useMemo(() => {
    try {
      const clubs = teamRepository.getAll();
      const currentGw = bootstrapRepository.getCurrentGameweek();

      return {
        allClubs: clubs,
        gameweek: currentGw,
        clubCount: clubs.length,
      };
    } catch (error) {
      console.error('Error loading club data:', error);
      return {
        allClubs: [],
        gameweek: null,
        clubCount: 0,
      };
    }
  }, [teamRepository, bootstrapRepository]);

  // Sort clubs
  const sortedClubs = useMemo(() => {
    const sorted = [...allClubs].sort((a, b) => {
      let aVal: number = 0;
      let bVal: number = 0;

      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        case 'strength':
          aVal = a.strength;
          bVal = b.strength;
          break;
        case 'avgFdr':
          // This will be handled in the child component for now
          return 0;
        case 'topPlayerPoints':
          // This will be handled in the child component for now
          return 0;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [allClubs, sortBy, sortOrder]);

  const handleClubSelect = (club: Team): void => {
    setSelectedClub(club);
    setDrawerOpen(true);
  };

  const handleAddToComparison = (club: Team): void => {
    setSelectedClubIds((prev) => {
      if (prev.includes(club.id)) {
        return prev.filter((id) => id !== club.id);
      }
      if (prev.length < 3) {
        return [...prev, club.id];
      }
      return prev;
    });
  };

  const handleRemoveFromComparison = (clubId: number): void => {
    setSelectedClubIds((prev) => prev.filter((id) => id !== clubId));
  };

  const handleSort = (field: string, order: 'asc' | 'desc'): void => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!gameweek || clubCount === 0) {
    return (
      <PageContent>
        <LoadingState label="Loading club data..." />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PageHeader>
        <Stack spacing={ThemeTokens.spacing.md}>
          <Typography variant={ThemeTokens.typography.pageTitleVariant} sx={{ fontWeight: 700 }}>
            Premier League
          </Typography>
          <Stack
            direction="row"
            spacing={ThemeTokens.spacing.xxl}
            sx={{
              flexWrap: 'wrap',
              '& > div': { minWidth: 150 },
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Competition
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Fantasy Premier League
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Season
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {seasonLabel}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Current Gameweek
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {gameweek.name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Clubs
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {clubCount}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </PageHeader>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: ThemeTokens.spacing.md }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="club views"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
            },
          }}
        >
          <Tab label="Club Intelligence" id="clubs-tab-0" aria-controls="clubs-tabpanel-0" />
          <Tab label="League Standings" id="clubs-tab-1" aria-controls="clubs-tabpanel-1" />
        </Tabs>
      </Box>

      {/* Club Intelligence Tab */}
      <TabPanel value={tabValue} index={0}>
        {selectedClubIds.length > 0 && (
          <PageSection title="Comparison" sx={{ marginBottom: ThemeTokens.spacing.md }}>
            <ClubComparison
              selectedClubIds={selectedClubIds}
              onRemoveClub={handleRemoveFromComparison}
            />
          </PageSection>
        )}

        <PageSection
          title="Premier League Clubs"
          subtitle={`${clubCount} clubs • Click to view intelligence • Select up to 3 for comparison`}
          sx={{ marginBottom: ThemeTokens.spacing.md }}
        >
          <Box sx={{ marginBottom: ThemeTokens.spacing.md }}>
            <Stack direction="row" spacing={ThemeTokens.spacing.sm} sx={{ flexWrap: 'wrap' }}>
              {allClubs.map((club) => (
                <Button
                  key={club.id}
                  variant={selectedClubIds.includes(club.id) ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleAddToComparison(club)}
                >
                  {club.shortName}
                </Button>
              ))}
            </Stack>
            {selectedClubIds.length > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', marginTop: ThemeTokens.spacing.sm }}
              >
                {selectedClubIds.length} of 3 selected for comparison
              </Typography>
            )}
          </Box>

          <ClubOverview
            clubs={sortedClubs}
            onClubSelect={handleClubSelect}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </PageSection>
      </TabPanel>

      {/* League Standings Tab */}
      <TabPanel value={tabValue} index={1}>
        <PageSection
          title="League Standings"
          subtitle={
            standingsState.isPreSeason || standingsState.gameweekId === null
              ? 'Standings update after completed matches'
              : `After Gameweek ${standingsState.gameweekId}`
          }
        >
          <StandingsTable
            standings={standingsState.standings}
            isPreSeason={standingsState.isPreSeason}
            message={standingsState.message}
          />
        </PageSection>
      </TabPanel>

      {/* Club Intelligence Drawer */}
      <ClubIntelligenceDrawer
        team={selectedClub}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </PageContent>
  );
}
