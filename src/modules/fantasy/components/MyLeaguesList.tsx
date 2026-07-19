/**
 * My Leagues List Component
 * Displays leagues with stats and navigation to league standings
 */

import React from 'react';
import { Box, Typography, Card, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { RankMovement } from './RankMovement';
import type { FantasyLeagueFixture } from '../types';

export interface MyLeaguesListProps {
  leagues: FantasyLeagueFixture[];
}

export const MyLeaguesList: React.FC<MyLeaguesListProps> = ({ leagues }) => {
  const navigate = useNavigate();

  const handleLeagueClick = (leagueId: number): void => {
    navigate(`/premier-league/fantasy-game/leagues/${leagueId}`);
  };

  return (
    <Box>
      {/* Desktop Table Header */}
      <Box
        sx={{
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: '1fr 100px 100px 100px 100px',
          gap: 2,
          padding: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: '8px 8px 0 0',
          fontWeight: 700,
          fontSize: '0.875rem',
          borderBottom: '2px solid #e0e0e0',
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>League</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', textAlign: 'center' }}>
          Rank
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', textAlign: 'center' }}>
          Prev
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', textAlign: 'center' }}>
          Movement
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', textAlign: 'center' }}>
          Managers
        </Typography>
      </Box>

      {/* Desktop Table Rows */}
      {leagues.map((league) => (
        <Button
          key={league.id}
          onClick={() => handleLeagueClick(league.id)}
          sx={{
            display: { xs: 'none', md: 'grid' },
            gridTemplateColumns: '1fr 100px 100px 100px 100px',
            gap: 2,
            padding: 2,
            alignItems: 'center',
            backgroundColor: '#fff',
            border: 'none',
            borderBottom: '1px solid #e0e0e0',
            borderRadius: 0,
            textAlign: 'left',
            width: '100%',
            cursor: 'pointer',
            justifyContent: 'start',
            '&:hover': {
              backgroundColor: '#fafafa',
            },
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: '#1976d2' }}>
            {league.name}
          </Typography>

          <Typography sx={{ textAlign: 'center', fontWeight: 600, fontSize: '0.95rem' }}>
            {league.rank}
          </Typography>

          <Typography
            sx={{ textAlign: 'center', fontWeight: 600, fontSize: '0.95rem', color: '#666' }}
          >
            {league.previousRank}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <RankMovement
              previousRank={league.previousRank}
              currentRank={league.rank}
              size="small"
            />
          </Box>

          <Typography sx={{ textAlign: 'center', fontWeight: 600, fontSize: '0.95rem' }}>
            {league.members}
          </Typography>
        </Button>
      ))}

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
        {leagues.map((league) => (
          <Card
            key={league.id}
            onClick={() => handleLeagueClick(league.id)}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 3,
              },
            }}
          >
            <Box sx={{ padding: 2 }}>
              {/* League Name */}
              <Typography
                sx={{ fontWeight: 600, fontSize: '1rem', marginBottom: 1, color: '#1976d2' }}
              >
                {league.name}
              </Typography>

              {/* Stats Row */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: 1,
                  paddingTop: 1,
                  borderTop: '1px solid #e0e0e0',
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                    Rank
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{league.rank}</Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                    Prev
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#666' }}>
                    {league.previousRank}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                    Movement
                  </Typography>
                  <Box sx={{ marginTop: 0.5 }}>
                    <RankMovement
                      previousRank={league.previousRank}
                      currentRank={league.rank}
                      size="small"
                      showAbsoluteValue={false}
                    />
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                    Members
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    {league.members}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
