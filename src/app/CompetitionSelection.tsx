import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Container,
  Stack,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import type { CompetitionType } from '../types/competition';
import { COMPETITIONS } from '../types/competition';

export const CompetitionSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (competition: CompetitionType): void => {
    navigate(`/${competition}/dashboard`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
        paddingY: 4,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', marginBottom: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              marginBottom: 2,
              color: '#1976d2',
            }}
          >
            DC5 Fantasy Hub
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#666',
              fontWeight: 400,
            }}
          >
            Choose your competition
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
          {Object.entries(COMPETITIONS).map(([key, competition]) => (
            <Box key={key} sx={{ flex: 1, minWidth: 0 }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingY: 6,
                    textAlign: 'center',
                  }}
                >
                  <Box
                    sx={{
                      marginBottom: 2,
                      fontSize: 48,
                      color: '#1976d2',
                    }}
                  >
                    {key === 'premier-league' ? (
                      <SportsSoccerIcon sx={{ fontSize: 48 }} />
                    ) : (
                      <EmojiEventsIcon sx={{ fontSize: 48 }} />
                    )}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      fontWeight: 600,
                      marginBottom: 1,
                    }}
                  >
                    {competition.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666',
                    }}
                  >
                    {competition.subtitle}
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{
                    paddingX: 2,
                    paddingBottom: 2,
                    justifyContent: 'center',
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => handleNavigate(competition.type)}
                    sx={{
                      paddingX: 4,
                    }}
                  >
                    Enter
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};
