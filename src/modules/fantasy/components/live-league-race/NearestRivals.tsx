/**
 * Nearest Rivals Component
 * Displays managers immediately above and below current manager
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import type { NearestRivalsData } from '@domain/models';
import { LeagueRaceService } from '../../services/LeagueRaceService';

export interface NearestRivalsProps {
  rivals: NearestRivalsData | null;
}

interface RivalRowProps {
  rank: number;
  manager: string;
  team: string;
  total: number;
  gap: number;
  isCurrentManager: boolean;
}

const RivalRow: React.FC<RivalRowProps> = ({
  rank,
  manager,
  team,
  total,
  gap,
  isCurrentManager,
}) => {
  const gapColor = gap > 0 ? '#4caf50' : gap < 0 ? '#f44336' : '#666';
  const gapDisplay = gap > 0 ? `+${gap}` : gap < 0 ? `${gap}` : '0';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 80px',
        gap: ThemeTokens.spacing.md,
        alignItems: 'center',
        padding: ThemeTokens.spacing.sm,
        backgroundColor: isCurrentManager ? '#f5f5f5' : 'transparent',
        borderRadius: '4px',
        fontWeight: isCurrentManager ? 700 : 500,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        #{rank}
      </Typography>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: isCurrentManager ? 700 : 500 }}>
          {manager}
        </Typography>
        <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
          {team}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {total}
        </Typography>
        <Typography variant="caption" sx={{ color: gapColor, fontWeight: 700, display: 'block' }}>
          {gapDisplay}
        </Typography>
      </Box>
    </Box>
  );
};

export const NearestRivals: React.FC<NearestRivalsProps> = ({ rivals }) => {
  if (!rivals) {
    return null;
  }

  const rivalGaps = useMemo(() => {
    const service = new LeagueRaceService();
    return service.calculateRivalGaps(rivals);
  }, [rivals]);

  return (
    <Paper
      sx={{
        p: ThemeTokens.spacing.md,
        mb: ThemeTokens.spacing.lg,
        backgroundColor: '#fafafa',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: ThemeTokens.spacing.md,
          fontSize: '0.95rem',
        }}
      >
        Nearest Rivals
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: ThemeTokens.spacing.sm }}>
        {/* Above */}
        {rivals.above.map((entry) => (
          <RivalRow
            key={entry.managerId}
            rank={entry.currentRank}
            manager={entry.managerName}
            team={entry.teamName}
            total={entry.totalPoints}
            gap={rivalGaps.get(entry.managerId) ?? 0}
            isCurrentManager={false}
          />
        ))}

        {/* Current */}
        <RivalRow
          rank={rivals.current.currentRank}
          manager={rivals.current.managerName}
          team={rivals.current.teamName}
          total={rivals.current.totalPoints}
          gap={0}
          isCurrentManager={true}
        />

        {/* Below */}
        {rivals.below.map((entry) => (
          <RivalRow
            key={entry.managerId}
            rank={entry.currentRank}
            manager={entry.managerName}
            team={entry.teamName}
            total={entry.totalPoints}
            gap={rivalGaps.get(entry.managerId) ?? 0}
            isCurrentManager={false}
          />
        ))}
      </Box>
    </Paper>
  );
};
