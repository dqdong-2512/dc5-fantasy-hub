import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import type { BoxProps } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface LoadingStateProps extends BoxProps {
  label?: string;
  size?: number;
}

/**
 * LoadingState
 * Displayed while loading data
 * Generic loading indicator
 */
export function LoadingState({
  label = 'Loading...',
  size = 48,
  sx,
  ...props
}: LoadingStateProps): React.ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: ThemeTokens.spacing.xxl,
        minHeight: 300,
        gap: ThemeTokens.spacing.lg,
        ...sx,
      }}
      {...props}
    >
      <CircularProgress size={size} />
      {label && (
        <Typography variant={ThemeTokens.typography.bodyVariant} color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  );
}
