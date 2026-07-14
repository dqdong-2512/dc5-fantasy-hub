import React from 'react';
import { Typography } from '@mui/material';

interface WidgetHeaderProps {
  children: React.ReactNode;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({ children }) => (
  <Typography
    variant="h6"
    sx={{
      fontWeight: 600,
      marginBottom: 2,
    }}
  >
    {children}
  </Typography>
);
