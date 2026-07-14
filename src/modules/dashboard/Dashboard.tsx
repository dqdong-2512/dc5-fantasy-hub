import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupsIcon from '@mui/icons-material/Groups';
import TimelineIcon from '@mui/icons-material/Timeline';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import { PageContainer } from '@shared/components';
import type { CompetitionType } from '../../types/competition';
import { COMPETITIONS } from '../../types/competition';

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
      {/* Top Section */}
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

      {/* Summary Section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          marginBottom: 4,
        }}
      >
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EventIcon sx={{ fontSize: 32, color: '#1976d2' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Current Gameweek
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {placeholderData.gameweek}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccessTimeIcon sx={{ fontSize: 32, color: '#ff9800' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Deadline
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  15:00 GMT
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SportsSoccerIcon sx={{ fontSize: 32, color: '#4caf50' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Total Fixtures
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {placeholderData.totalFixtures}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <GroupsIcon sx={{ fontSize: 32, color: '#9c27b0' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Total Players
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {placeholderData.totalPlayers}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            marginBottom: 2,
          }}
        >
          Quick Actions
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', paddingY: 3 }}>
              <SportsSoccerIcon sx={{ fontSize: 40, color: '#1976d2', marginBottom: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Fixtures
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', paddingBottom: 2 }}>
              <Button
                size="small"
                onClick={() => handleNavigate('fixtures')}
                sx={{ color: '#1976d2' }}
              >
                View
              </Button>
            </CardActions>
          </Card>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', paddingY: 3 }}>
              <GroupIcon sx={{ fontSize: 40, color: '#4caf50', marginBottom: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Players
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', paddingBottom: 2 }}>
              <Button
                size="small"
                onClick={() => handleNavigate('players')}
                sx={{ color: '#4caf50' }}
              >
                View
              </Button>
            </CardActions>
          </Card>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', paddingY: 3 }}>
              <AnalyticsIcon sx={{ fontSize: 40, color: '#ff9800', marginBottom: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Analytics
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', paddingBottom: 2 }}>
              <Button
                size="small"
                onClick={() => handleNavigate('analytics')}
                sx={{ color: '#ff9800' }}
              >
                View
              </Button>
            </CardActions>
          </Card>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', paddingY: 3 }}>
              <EmojiEventsIcon sx={{ fontSize: 40, color: '#9c27b0', marginBottom: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Fantasy Game
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', paddingBottom: 2 }}>
              <Button
                size="small"
                onClick={() => handleNavigate('fantasy')}
                sx={{ color: '#9c27b0' }}
              >
                View
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Box>

      {/* Content Sections */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          marginBottom: 4,
        }}
      >
        {/* Upcoming Fixtures */}
        <Paper sx={{ padding: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 2 }}>
            Upcoming Fixtures
          </Typography>
          <Stack spacing={2}>
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
          </Stack>
        </Paper>

        {/* Top Players */}
        <Paper sx={{ padding: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 2 }}>
            Top Players
          </Typography>
          <Stack spacing={2}>
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
          </Stack>
        </Paper>
      </Box>

      {/* Latest News */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 2 }}>
          Latest News
        </Typography>
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

      {/* Charts Placeholder */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 2 }}>
          Analytics
        </Typography>
        <Paper
          sx={{
            padding: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: 2,
          }}
        >
          <TimelineIcon sx={{ fontSize: 48, color: '#ccc', marginBottom: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Coming Soon
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
            Charts and advanced analytics will be available soon
          </Typography>
        </Paper>
      </Box>
    </PageContainer>
  );
};
