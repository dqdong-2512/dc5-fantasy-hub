import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardActions, Button, Chip } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import TimelineIcon from '@mui/icons-material/Timeline';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  PageContainer,
  SectionTitle,
  StatCard,
  WidgetContainer,
  WidgetHeader,
  WidgetContent,
} from '@shared/components';
import type { CompetitionType } from '../../types/competition';
import { COMPETITIONS } from '../../types/competition';
import { BootstrapRepository } from '@repositories/bootstrap';
import { PlayerRepository } from '@repositories/players';
import { TeamRepository } from '@repositories/teams';
import { PlayerPresenter, formatDeadline } from '@shared/presentation';
import { getSeasonDisplay } from '../../config';

interface ActionCardProps {
  icon: React.ComponentType<{ sx?: { fontSize: number; color: string; marginBottom: number } }>;
  title: string;
  color: string;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon: Icon, title, color, onClick }) => (
  <Card
    sx={{
      cursor: 'pointer',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
      },
    }}
    onClick={onClick}
  >
    <CardContent sx={{ textAlign: 'center', paddingY: 3 }}>
      <Icon sx={{ fontSize: 40, color, marginBottom: 1 }} />
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </CardContent>
    <CardActions sx={{ justifyContent: 'center', paddingBottom: 2 }}>
      <Button size="small" sx={{ color }}>
        View
      </Button>
    </CardActions>
  </Card>
);

export const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const competition = pathSegments[0] as CompetitionType;
  const competitionInfo = COMPETITIONS[competition];

  // Load dashboard data (must be before early returns)
  const dashboardData = useMemo(() => {
    try {
      const bootstrapRepository = new BootstrapRepository();
      const playerRepository = new PlayerRepository();
      const teamRepository = new TeamRepository();

      const currentGameweek = bootstrapRepository.getCurrentGameweek();
      const players = playerRepository.getAll();
      const teams = teamRepository.getAll();

      return {
        gameweek: currentGameweek?.id || 0,
        season: getSeasonDisplay(),
        deadline: currentGameweek?.deadline || 'N/A',
        totalPlayers: players.length,
        totalTeams: teams.length,
        totalFixtures: 0,
      };
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      return {
        gameweek: 0,
        season: getSeasonDisplay(),
        deadline: 'N/A',
        totalPlayers: 0,
        totalTeams: 0,
        totalFixtures: 0,
      };
    }
  }, []);

  // Load top 5 players by total points (must be before early returns)
  const topPlayers = useMemo(() => {
    try {
      const playerRepository = new PlayerRepository();
      const allPlayers = playerRepository.getAll();
      const topByPoints = allPlayers.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5);
      return PlayerPresenter.toListPresentations(topByPoints);
    } catch (error) {
      console.error('Error loading top players:', error);
      return [];
    }
  }, []);

  // Load most owned players (must be before early returns)
  const mostOwnedPlayers = useMemo(() => {
    try {
      const playerRepository = new PlayerRepository();
      const allPlayers = playerRepository.getAll();
      const mostOwned = allPlayers
        .filter((p) => p.ownership !== undefined && p.ownership > 0)
        .sort((a, b) => (b.ownership || 0) - (a.ownership || 0))
        .slice(0, 3);
      return PlayerPresenter.toListPresentations(mostOwned);
    } catch (error) {
      console.error('Error loading most owned players:', error);
      return [];
    }
  }, []);

  if (!competitionInfo) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          Competition not found
        </Typography>
      </Box>
    );
  }

  const handleNavigate = (path: string): void => {
    navigate(`/${competition}/${path}`);
  };

  return (
    <PageContainer>
      {/* Top Banner Section */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            marginBottom: 1,
            color: '#1976d2',
          }}
        >
          {competitionInfo.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Current Gameweek
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              GW {dashboardData.gameweek}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Season
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {dashboardData.season}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Deadline
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {formatDeadline(dashboardData.deadline)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Statistics Section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          marginBottom: 4,
        }}
      >
        <StatCard
          icon={<EventIcon />}
          title="Current Gameweek"
          value={dashboardData.gameweek}
          iconColor="#1976d2"
        />
        <StatCard
          icon={<AccessTimeIcon />}
          title="Total Teams"
          value={dashboardData.totalTeams}
          iconColor="#ff9800"
        />
        <StatCard
          icon={<SportsSoccerIcon />}
          title="Total Fixtures"
          value={dashboardData.totalFixtures}
          iconColor="#4caf50"
        />
        <StatCard
          icon={<GroupsIcon />}
          title="Total Players"
          value={dashboardData.totalPlayers}
          iconColor="#9c27b0"
        />
      </Box>

      {/* Quick Actions Section */}
      <Box sx={{ marginBottom: 4 }}>
        <SectionTitle>Quick Actions</SectionTitle>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          <ActionCard
            icon={SportsSoccerIcon}
            title="Fixtures"
            color="#1976d2"
            onClick={() => handleNavigate('fixtures')}
          />
          <ActionCard
            icon={GroupIcon}
            title="Players"
            color="#4caf50"
            onClick={() => handleNavigate('players')}
          />
          <ActionCard
            icon={AnalyticsIcon}
            title="Analytics"
            color="#ff9800"
            onClick={() => handleNavigate('analytics')}
          />
          <ActionCard
            icon={EmojiEventsIcon}
            title="Fantasy Game"
            color="#9c27b0"
            onClick={() => handleNavigate('fantasy')}
          />
        </Box>
      </Box>

      {/* Main Content Grid - Top 5 Players & Most Owned */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          marginBottom: 4,
        }}
      >
        {/* Top Players Widget */}
        <WidgetContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 2 }}>
            <StarIcon sx={{ color: '#fbc02d', fontSize: 24 }} />
            <WidgetHeader>Top 5 Players</WidgetHeader>
          </Box>
          <WidgetContent>
            {topPlayers.length > 0 ? (
              topPlayers.map((player) => (
                <Box
                  key={player.id}
                  sx={{
                    padding: 2,
                    backgroundColor: '#fafafa',
                    borderRadius: 1,
                    marginBottom: 1,
                    '&:last-child': { marginBottom: 0 },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {player.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {player.club} • {player.position}
                      </Typography>
                    </Box>
                    <Chip
                      label={player.totalPoints}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, paddingTop: 1 }}>
                    <Typography variant="caption">
                      <strong>Price:</strong> {player.price}
                    </Typography>
                    <Typography variant="caption">
                      <strong>Owned:</strong> {player.ownership}
                    </Typography>
                    <Typography variant="caption">
                      <strong>Form:</strong> {player.form}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ padding: 2, textAlign: 'center' }}
              >
                No players data available
              </Typography>
            )}
          </WidgetContent>
        </WidgetContainer>

        {/* Most Owned Players Widget */}
        <WidgetContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: 2 }}>
            <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 24 }} />
            <WidgetHeader>Most Selected</WidgetHeader>
          </Box>
          <WidgetContent>
            {mostOwnedPlayers.length > 0 ? (
              mostOwnedPlayers.map((player) => (
                <Box
                  key={player.id}
                  sx={{
                    padding: 2,
                    backgroundColor: '#fafafa',
                    borderRadius: 1,
                    marginBottom: 1,
                    '&:last-child': { marginBottom: 0 },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {player.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {player.club} • {player.position}
                      </Typography>
                    </Box>
                    <Chip
                      label={player.ownership}
                      size="small"
                      variant="outlined"
                      sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, paddingTop: 1 }}>
                    <Typography variant="caption">
                      <strong>Price:</strong> {player.price}
                    </Typography>
                    <Typography variant="caption">
                      <strong>Points:</strong> {player.totalPoints}
                    </Typography>
                    <Typography variant="caption">
                      <strong>PPG:</strong> {player.pointsPerGame}
                    </Typography>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ padding: 2, textAlign: 'center' }}
              >
                No players data available
              </Typography>
            )}
          </WidgetContent>
        </WidgetContainer>
      </Box>

      {/* Upcoming Fixtures Section */}
      <Box sx={{ marginBottom: 4 }}>
        <SectionTitle>Upcoming Fixtures</SectionTitle>
        <WidgetContainer>
          <WidgetContent>
            <Box
              sx={{
                padding: 2,
                backgroundColor: '#fafafa',
                borderRadius: 1,
                textAlign: 'center',
                color: '#999',
              }}
            >
              <SportsSoccerIcon sx={{ fontSize: 32, marginBottom: 1, opacity: 0.5 }} />
              <Typography variant="body2">Fixtures data coming soon</Typography>
              <Typography variant="caption" color="textSecondary">
                Fixture synchronization not yet available
              </Typography>
            </Box>
          </WidgetContent>
        </WidgetContainer>
      </Box>

      {/* Latest News Section */}
      <Box sx={{ marginBottom: 4 }}>
        <SectionTitle>Latest News</SectionTitle>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {[1, 2, 3].map((item) => (
            <Card key={item}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <NewspaperIcon sx={{ fontSize: 32, color: '#1976d2' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      News Article {item}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Placeholder news content
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Analytics Placeholder Widget */}
      <Box sx={{ marginBottom: 4 }}>
        <SectionTitle>Analytics</SectionTitle>
        <WidgetContainer sx={{ backgroundColor: '#f5f5f5' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingY: 3,
            }}
          >
            <TimelineIcon sx={{ fontSize: 48, color: '#ccc', marginBottom: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Coming Soon
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
              Charts and advanced analytics will be available soon
            </Typography>
          </Box>
        </WidgetContainer>
      </Box>
    </PageContainer>
  );
};
