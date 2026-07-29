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
import { COMPETITIONS } from '../types/competition';

export const CompetitionSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string): void => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        color: '#111827',
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
              color: '#111827',
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
            Choose your football competition
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
                  borderRadius: 3,
                  borderTop: `4px solid ${competition.accentColor}`,
                  backgroundColor: '#ffffff',
                  color: '#111827',
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
                      height: 80,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      component="img"
                      src={competition.logoSrc}
                      alt={competition.logoAlt}
                      sx={{
                        display: 'block',
                        maxWidth: 112,
                        width: '100%',
                        height: 80,
                        objectFit: 'contain',
                      }}
                    />
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
                    onClick={() => handleNavigate(competition.path)}
                    sx={{
                      paddingX: 4,
                      backgroundColor: competition.accentColor,
                      '&:hover': {
                        backgroundColor: competition.accentColor,
                        filter: 'brightness(1.12)',
                      },
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
