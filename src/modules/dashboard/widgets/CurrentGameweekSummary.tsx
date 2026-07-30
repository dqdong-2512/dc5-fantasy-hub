import React, { useMemo } from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { DashboardWidget } from '../components/DashboardWidget';
import { BootstrapRepository } from '@repositories/bootstrap';
import { FixtureRepository } from '@repositories/fixtures';
import { formatDeadline } from '@shared/presentation';
import { getTeamBadgeUrl } from '@shared/assets';

interface CurrentGameweekSummaryProps {
  onViewGameweek?: () => void;
}

const DASHBOARD_LOADED_AT = Date.now();

function getDeadlineParts(deadline: string | null) {
  if (!deadline) {
    return { days: '--', hours: '--' };
  }

  const difference = new Date(deadline).getTime() - DASHBOARD_LOADED_AT;
  if (difference <= 0) {
    return { days: '0', hours: '0' };
  }

  const totalHours = Math.floor(difference / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return { days: String(days), hours: String(hours) };
}

export const CurrentGameweekSummary: React.FC<CurrentGameweekSummaryProps> = ({
  onViewGameweek,
}) => {
  const data = useMemo(() => {
    try {
      const bootstrapRepository = new BootstrapRepository();
      const bootstrap = bootstrapRepository.getBootstrap();
      const current = bootstrapRepository.getCurrentGameweek();
      const firstDeadline = bootstrap.gameweeks[0]?.deadline;
      const isPreSeason = firstDeadline
        ? new Date(firstDeadline).getTime() > DASHBOARD_LOADED_AT
        : true;
      const gameweek = current?.id || 1;
      const fixtures = new FixtureRepository().getByGameweek(gameweek);

      return {
        seasonState: isPreSeason ? ('pre-season' as const) : ('active' as const),
        gameweek,
        deadline: current?.deadline || null,
        deadlineFormatted: formatDeadline(current?.deadline || ''),
        fixtures,
      };
    } catch {
      return {
        seasonState: 'pre-season' as const,
        gameweek: 1,
        deadline: null,
        deadlineFormatted: 'TBA',
        fixtures: [],
      };
    }
  }, []);

  const countdown = getDeadlineParts(data.deadline);
  const statusLabel = data.seasonState === 'pre-season' ? 'Pre-season' : 'Active';
  const title = data.seasonState === 'pre-season' ? 'Next Gameweek' : 'Current Gameweek';

  return (
    <DashboardWidget
      title={title}
      subtitle="Deadline, fixtures and season status"
      icon={<EventIcon />}
    >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          p: 2.5,
          mb: 2.5,
          borderRadius: '8px',
          color: '#fff',
          background: 'linear-gradient(135deg, #37003c 0%, #6d0875 54%, #04a4c7 140%)',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 180,
            height: 180,
            borderRadius: '50%',
            right: -70,
            top: -105,
            backgroundColor: 'rgba(255,255,255,0.09)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              mb: 1.25,
              color: '#fff',
              fontWeight: 700,
              backgroundColor: 'rgba(255,255,255,0.16)',
              border: '1px solid rgba(255,255,255,0.24)',
            }}
          />
          <Typography sx={{ fontSize: '0.75rem', opacity: 0.78, fontWeight: 650 }}>
            GAMEWEEK
          </Typography>
          <Typography sx={{ fontSize: { xs: '3rem', md: '4rem' }, lineHeight: 0.95, fontWeight: 850 }}>
            {data.gameweek}
          </Typography>
        </Box>

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            minWidth: { sm: 240 },
            p: 1.75,
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.16)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 17 }} />
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {data.seasonState === 'pre-season' ? 'Season starts' : 'Deadline'}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 750 }}>
            {data.deadlineFormatted}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2.5, mt: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: '1.35rem', lineHeight: 1, fontWeight: 800 }}>
                {countdown.days}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.72 }}>
                days
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.35rem', lineHeight: 1, fontWeight: 800 }}>
                {countdown.hours}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.72 }}>
                hours
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.35rem', lineHeight: 1, fontWeight: 800 }}>
                {data.fixtures.length}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.72 }}>
                fixtures
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <SportsSoccerIcon sx={{ fontSize: 18, color: '#6d0875' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 750 }}>
            Opening fixtures
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {data.fixtures.length} matches
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 1 }}>
        {data.fixtures.slice(0, 3).map((fixture) => (
          <Box
            key={fixture.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1.1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '6px',
              backgroundColor: 'rgba(148, 163, 184, 0.035)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
              <Box
                component="img"
                src={getTeamBadgeUrl(fixture.homeTeam.code)}
                alt=""
                sx={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 650 }} noWrap>
                {fixture.homeTeam.shortName}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              VS
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.75,
                minWidth: 0,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 650 }} noWrap>
                {fixture.awayTeam.shortName}
              </Typography>
              <Box
                component="img"
                src={getTeamBadgeUrl(fixture.awayTeam.code)}
                alt=""
                sx={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
              />
            </Box>
          </Box>
        ))}
      </Box>

      {onViewGameweek && (
        <Button
          onClick={onViewGameweek}
          endIcon={<ArrowForwardIcon />}
          sx={{
            mt: 2,
            px: 0,
            color: '#6d0875',
            fontWeight: 750,
            textTransform: 'none',
            '&:hover': { backgroundColor: 'transparent', color: '#37003c' },
          }}
        >
          Open Gameweek centre
        </Button>
      )}
    </DashboardWidget>
  );
};
