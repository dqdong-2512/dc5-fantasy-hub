import React from 'react';
import { Box } from '@mui/material';
import { NotFoundView } from '@shared/components';
import { PageContainer } from '@shared/components';

export const NotFound: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PageContainer sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <NotFoundView />
      </PageContainer>
    </Box>
  );
};
