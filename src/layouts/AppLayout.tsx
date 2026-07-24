import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { AppHeader } from '@shared/components';
import { AppFooter } from '@shared/components';

export const AppLayout: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <AppHeader />
      <Box component="main" sx={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </Box>
      <AppFooter />
    </Box>
  );
};
