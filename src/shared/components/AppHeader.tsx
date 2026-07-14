import React from 'react';
import { AppBar, Toolbar, Box, Typography, IconButton } from '@mui/material';
import BrightnessIcon from '@mui/icons-material/Brightness4';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export const AppHeader: React.FC = () => {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#ffffff',
        color: '#000000',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', paddingX: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1976d2',
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          DC5 Fantasy Hub
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            aria-label="theme toggle"
            title="Theme toggle"
            sx={{ color: '#666' }}
          >
            <BrightnessIcon />
          </IconButton>
          <IconButton size="small" aria-label="profile" title="Profile" sx={{ color: '#666' }}>
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
