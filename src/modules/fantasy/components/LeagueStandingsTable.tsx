/**
 * League Standings Table Component
 * Displays league manager standings in a responsive format
 * Non-current managers are clickable to navigate to comparison page
 */

import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { RankMovement } from './RankMovement';
import type { LeagueStandingEntry } from '../types';

export interface LeagueStandingsTableProps {
  standings: LeagueStandingEntry[];
  currentManagerId: number;
}

export const LeagueStandingsTable: React.FC<LeagueStandingsTableProps> = ({
  standings,
  currentManagerId,
}) => {
  const navigate = useNavigate();
  const { leagueId } = useParams<{ leagueId: string }>();

  const handleManagerClick = (managerId: number): void => {
    if (managerId !== currentManagerId && leagueId) {
      navigate(`/premier-league/gameweek/league/${leagueId}/managers/${managerId}`);
    }
  };
  return (
    <Box>
      {/* Desktop Table Header */}
      <Box
        sx={{
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: '50px 1fr 80px 100px 80px',
          gap: 2,
          padding: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: '8px 8px 0 0',
          fontWeight: 700,
          fontSize: '0.875rem',
          borderBottom: '2px solid #e0e0e0',
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Rank</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Manager / Team</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', textAlign: 'center' }}>
          GW
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', textAlign: 'center' }}>
          Total
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', textAlign: 'center' }}>
          Movement
        </Typography>
      </Box>

      {/* Desktop Table Rows */}
      {standings.map((entry) => {
        const isCurrentManager = entry.managerId === currentManagerId;

        return (
          <Box
            key={entry.managerId}
            onClick={() => handleManagerClick(entry.managerId)}
            sx={{
              display: { xs: 'none', md: 'grid' },
              gridTemplateColumns: '50px 1fr 80px 100px 80px',
              gap: 2,
              padding: 2,
              alignItems: 'center',
              backgroundColor: isCurrentManager ? '#f0f7ff' : '#fff',
              borderBottom: '1px solid #e0e0e0',
              cursor: isCurrentManager ? 'default' : 'pointer',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: isCurrentManager ? '#f0f7ff' : '#f5f5f5',
              },
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{entry.currentRank}</Typography>

            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {entry.managerName}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>{entry.teamName}</Typography>
              {isCurrentManager && (
                <Typography
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#1976d2',
                    marginTop: 0.5,
                  }}
                >
                  YOU
                </Typography>
              )}
            </Box>

            <Typography
              sx={{ textAlign: 'center', fontWeight: 600, fontSize: '0.95rem', color: '#4caf50' }}
            >
              {entry.gameweekPoints}
            </Typography>

            <Typography sx={{ textAlign: 'center', fontWeight: 600, fontSize: '0.95rem' }}>
              {entry.totalPoints}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <RankMovement
                previousRank={entry.previousRank}
                currentRank={entry.currentRank}
                size="small"
              />
            </Box>
          </Box>
        );
      })}

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
        {standings.map((entry) => {
          const isCurrentManager = entry.managerId === currentManagerId;

          return (
            <Card
              key={entry.managerId}
              onClick={() => handleManagerClick(entry.managerId)}
              sx={{
                backgroundColor: isCurrentManager ? '#f0f7ff' : '#fff',
                cursor: isCurrentManager ? 'default' : 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': {
                  backgroundColor: isCurrentManager ? '#f0f7ff' : '#f5f5f5',
                },
              }}
            >
              <Box sx={{ padding: 2 }}>
                {/* Rank and Name Row */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.5rem',
                      marginRight: 1.5,
                      minWidth: '40px',
                    }}
                  >
                    #{entry.currentRank}
                  </Typography>

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                      {entry.managerName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.85rem', color: '#666', marginBottom: 0.5 }}>
                      {entry.teamName}
                    </Typography>
                    {isCurrentManager && (
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#1976d2',
                        }}
                      >
                        YOU
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Stats Row */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 1,
                    paddingTop: 1,
                    borderTop: '1px solid #e0e0e0',
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                      GW
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#4caf50' }}>
                      {entry.gameweekPoints}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                      Total
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {entry.totalPoints}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                      Movement
                    </Typography>
                    <Box sx={{ marginTop: 0.5 }}>
                      <RankMovement
                        previousRank={entry.previousRank}
                        currentRank={entry.currentRank}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};


