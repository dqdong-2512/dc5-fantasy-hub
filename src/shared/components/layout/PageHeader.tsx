import React from 'react';
import { Box } from '@mui/material';
import type { BoxProps } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface PageHeaderProps extends BoxProps {
  children: React.ReactNode;
}

/**
 * PageHeader
 * Top section of a page, typically containing title and actions
 */
export function PageHeader({ children, sx, ...props }: PageHeaderProps): React.ReactElement {
  return (
    <Box
      sx={{
        paddingBottom: ThemeTokens.spacing.md,
        marginBottom: ThemeTokens.spacing.lg,
        borderBottom: '1px solid',
        borderColor: 'divider',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}
