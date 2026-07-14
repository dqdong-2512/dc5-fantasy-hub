import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorIcon from '@mui/icons-material/Error';

export const NotFoundView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '500px',
        gap: 3,
        textAlign: 'center',
      }}
    >
      <ErrorIcon sx={{ fontSize: 80, color: '#ff9800' }} />
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="textSecondary">
        The page you are looking for does not exist.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')} sx={{ marginTop: 2 }}>
        Go to Home
      </Button>
    </Box>
  );
};
