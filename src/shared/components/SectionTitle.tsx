import React from 'react';
import { Typography } from '@mui/material';

interface SectionTitleProps {
  children: React.ReactNode;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ children }) => (
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
