import React from 'react';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
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
        padding: ThemeTokens.spacing.md,
        gap: ThemeTokens.spacing.sm,
        ...sx,
      }}
      {...props}
    >
      <Stack spacing={ThemeTokens.spacing.sm} sx={{ width: '100%', maxWidth: 320 }}>
        <Skeleton variant="text" width="38%" height={28} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="rounded" height={size * 1.6} />
      </Stack>
      {label && (
        <Typography variant={ThemeTokens.typography.bodyVariant} color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  );
}
