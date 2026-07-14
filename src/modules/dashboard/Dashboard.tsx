import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardActions, Button } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import TimelineIcon from '@mui/icons-material/Timeline';
import NewspaperIcon from '@mui/icons-material/Newspaper';
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

  // Placeholder data
  const placeholderData = {
    gameweek: 15,
    season: '2025/26',
    deadline: 'Saturday, 15:00 GMT',
    totalFixtures: 32,
    totalPlayers: 428,
  };

  const upcomingFixtures = [
    { id: 1, home: 'Team A', away: 'Team B', kickoff: '15:00' },
    { id: 2, home: 'Team C', away: 'Team D', kickoff: '17:30' },
    { id: 3, home: 'Team E', away: 'Team F', kickoff: '20:00' },
  ];

  const topPlayers = [
    { id: 1, name: 'Player One', club: 'Club A', position: 'Forward', rating: 8.5 },
    { id: 2, name: 'Player Two', club: 'Club B', position: 'Midfielder', rating: 8.2 },
    { id: 3, name: 'Player Three', club: 'Club C', position: 'Defender', rating: 7.9 },
  ];

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
              GW {placeholderData.gameweek}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Season
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {placeholderData.season}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Deadline
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {placeholderData.deadline}
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
          value={placeholderData.gameweek}
          iconColor="#1976d2"
        />
        <StatCard
          icon={<AccessTimeIcon />}
          title="Deadline"
          value="15:00 GMT"
          iconColor="#ff9800"
        />
        <StatCard
          icon={<SportsSoccerIcon />}
          title="Total Fixtures"
          value={placeholderData.totalFixtures}
          iconColor="#4caf50"
        />
        <StatCard
          icon={<GroupsIcon />}
          title="Total Players"
          value={placeholderData.totalPlayers}
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

      {/* Main Content Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          marginBottom: 4,
        }}
      >
        {/* Upcoming Fixtures Widget */}
        <WidgetContainer>
          <WidgetHeader>Upcoming Fixtures</WidgetHeader>
          <WidgetContent>
            {upcomingFixtures.map((fixture) => (
              <Box
                key={fixture.id}
                sx={{
                  padding: 2,
                  backgroundColor: '#fafafa',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fixture.home} vs {fixture.away}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Kickoff: {fixture.kickoff}
                  </Typography>
                </Box>
                <SportsSoccerIcon sx={{ color: '#1976d2' }} />
              </Box>
            ))}
          </WidgetContent>
        </WidgetContainer>

        {/* Top Players Widget */}
        <WidgetContainer>
          <WidgetHeader>Top Players</WidgetHeader>
          <WidgetContent>
            {topPlayers.map((player) => (
              <Box
                key={player.id}
                sx={{
                  padding: 2,
                  backgroundColor: '#fafafa',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {player.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#4caf50',
                    }}
                  >
                    {player.rating}
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {player.club} • {player.position}
                </Typography>
              </Box>
            ))}
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
