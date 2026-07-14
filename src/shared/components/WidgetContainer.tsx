import React from 'react';
import { Paper } from '@mui/material';
import type { PaperProps } from '@mui/material';

interface WidgetContainerProps extends PaperProps {
  children: React.ReactNode;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({ children, ...props }) => (
  <Paper
    sx={{
      padding: 3,
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </Paper>
);
