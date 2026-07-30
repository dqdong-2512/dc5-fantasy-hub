import React, { useMemo } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import FlightTakeoffOutlinedIcon from '@mui/icons-material/FlightTakeoffOutlined';
import { DashboardWidget } from '../components/DashboardWidget';
import { TeamRepository } from '@repositories/teams';
import { getTeamBadgeUrl } from '@shared/assets';

interface TopClubsProps {
  onViewClubs?: () => void;
}

function getClubRatings(club: ReturnType<TeamRepository['getAll']>[number]) {
  const home = club.strengthOverallHome;
  const away = club.strengthOverallAway;
  const availableRatings = [home, away].filter((value) => value > 0);
  const rating =
    availableRatings.length > 0
      ? availableRatings.reduce((total, value) => total + value, 0) / availableRatings.length
      : club.strength || 0;

  return { home, away, rating };
}

export const TopClubs: React.FC<TopClubsProps> = ({ onViewClubs }) => {
  const topClubs = useMemo(() => {
    try {
      const repo = new TeamRepository();
      return repo
        .getAll()
        .map((club) => ({ club, ...getClubRatings(club) }))
        .sort((left, right) => right.rating - left.rating)
        .slice(0, 8);
    } catch (error) {
      console.error('Error loading teams:', error);
      return [];
    }
  }, []);

  return (
    <DashboardWidget
      title="Top Clubs"
      subtitle="Home, away and overall squad ratings"
      icon={<EmojiEventsIcon />}
      action={
        onViewClubs
          ? {
              label: 'View All',
              onClick: onViewClubs,
            }
          : undefined
      }
    >
      {topClubs.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {topClubs.map(({ club, home, away, rating }, index) => (
            <Box
              key={club.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '32px 64px minmax(0, 1fr)',
                alignItems: 'center',
                gap: 1.5,
                p: 1.75,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                background:
                  index < 3
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.10), rgba(255, 255, 255, 0))'
                    : 'transparent',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: index < 3 ? '#d97706' : 'text.secondary',
                  textAlign: 'center',
                }}
              >
                {index + 1}
              </Typography>

              <Box
                component="img"
                src={getTeamBadgeUrl(club.code)}
                alt={`${club.name} crest`}
                sx={{
                  display: 'block',
                  width: 56,
                  height: 56,
                  objectFit: 'contain',
                }}
              />

              <Box sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 1,
                    mb: 0.75,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 750 }} noWrap>
                    {club.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#d97706' }}>
                    {rating.toFixed(1)}
                    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      /5
                    </Box>
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, (rating / 5) * 100)}
                  sx={{
                    height: 5,
                    borderRadius: '4px',
                    mb: 1,
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: '4px',
                      background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                    },
                  }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <HomeOutlinedIcon sx={{ fontSize: 15, color: '#f97316' }} />
                    <Typography variant="caption" color="text.secondary">
                      Home {home.toFixed(1)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FlightTakeoffOutlinedIcon sx={{ fontSize: 15, color: '#2563eb' }} />
                    <Typography variant="caption" color="text.secondary">
                      Away {away.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
          No teams data available
        </Typography>
      )}
    </DashboardWidget>
  );
};
