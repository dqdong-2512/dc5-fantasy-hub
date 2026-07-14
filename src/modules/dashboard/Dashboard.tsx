import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import type { CompetitionType } from '../../types/competition';
import { COMPETITIONS } from '../../types/competition';

export const Dashboard: React.FC = () => {
  const location = useLocation();
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

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, marginBottom: 1 }}>
        {competitionInfo.name}
      </Typography>
      <Typography variant="h6" sx={{ color: '#666' }}>
        Dashboard
      </Typography>
    </Box>
  );
};
