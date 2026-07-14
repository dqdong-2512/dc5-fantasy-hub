import React from 'react';
import { useLocation } from 'react-router-dom';
import { Typography } from '@mui/material';
import { PageContainer } from '@shared/components';
import type { CompetitionType } from '../../types/competition';
import { COMPETITIONS } from '../../types/competition';

export const Fantasy: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const competition = pathSegments[0] as CompetitionType;
  const competitionInfo = COMPETITIONS[competition];

  return (
    <PageContainer>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600, marginBottom: 3 }}>
        Fantasy Game
      </Typography>
      <Typography variant="body1" color="textSecondary">
        {competitionInfo?.name} - Fantasy Game section coming soon
      </Typography>
    </PageContainer>
  );
};
