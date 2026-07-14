import React from 'react';
import { Box, Typography } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title = 'Coming Soon',
  subtitle = 'This feature is currently under development',
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      padding: 3,
    }}
  >
    <BuildIcon sx={{ fontSize: 64, color: '#9c27b0', marginBottom: 2 }} />
    <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: 1, textAlign: 'center' }}>
      {title}
    </Typography>
    <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
      {subtitle}
    </Typography>
  </Box>
);
