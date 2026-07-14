import React from 'react';
import { AppBar, Toolbar, IconButton, Box, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface HeaderProps {
  height: number;
  onSidebarToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ height, onSidebarToggle }) => {
  return (
    <AppBar
      position="relative"
      sx={{
        height,
        backgroundColor: '#ffffff',
        color: '#000000',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar
        sx={{
          height: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          paddingX: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            size="large"
            aria-label="toggle sidebar"
            onClick={onSidebarToggle}
            sx={{ color: '#1976d2' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1976d2',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            DC5 Fantasy Hub
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} />
      </Toolbar>
    </AppBar>
  );
};
