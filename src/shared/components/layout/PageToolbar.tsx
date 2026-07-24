import React from 'react';
import { Paper } from '@mui/material';
import type { PaperProps } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface PageToolbarProps extends PaperProps {
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

/**
 * PageToolbar
 * Sticky toolbar for actions, filters, or controls
 * Appears at top or bottom of a section
 */
export function PageToolbar({
  children,
  position = 'top',
  sx,
  ...props
}: PageToolbarProps): React.ReactElement {
  return (
    <Paper
      sx={{
        display: 'flex',
        gap: ThemeTokens.spacing.sm,
        alignItems: 'center',
        padding: ThemeTokens.spacing.sm,
        marginBottom: position === 'top' ? ThemeTokens.spacing.sm : 0,
        marginTop: position === 'bottom' ? ThemeTokens.spacing.sm : 0,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}
