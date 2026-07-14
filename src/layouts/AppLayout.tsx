import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';

const SIDEBAR_WIDTH = 260;
const HEADER_HEIGHT = 64;

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <Sidebar
        width={SIDEBAR_WIDTH}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header height={HEADER_HEIGHT} onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
        <MainContent>
          <Outlet />
        </MainContent>
      </Box>
    </Box>
  );
};
