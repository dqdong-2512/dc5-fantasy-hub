import React from 'react';
import { Typography } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

interface WidgetHeaderProps {
  children: React.ReactNode;
}

export const WidgetHeader: React.FC<WidgetHeaderProps> = ({ children }) => (
  <Typography
    variant="h6"
    sx={{
      fontWeight: 600,
      marginBottom: ThemeTokens.spacing.md,
    }}
  >
    {children}
  </Typography>
);
