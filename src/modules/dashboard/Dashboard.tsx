import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import type { CompetitionType } from '../../types/competition';
import { COMPETITIONS } from '../../types/competition';

export const Dashboard: React.FC = () => {
  const { competition } = useParams<{ competition: string }>();
  const competitionInfo = COMPETITIONS[competition as CompetitionType];

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
