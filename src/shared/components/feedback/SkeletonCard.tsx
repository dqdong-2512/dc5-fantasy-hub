import React from 'react';
import { Card, CardContent, Skeleton, Stack } from '@mui/material';
import type { CardProps } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface SkeletonCardProps extends CardProps {
  lines?: number;
  avatar?: boolean;
  height?: number;
}

/**
 * SkeletonCard
 * Placeholder card while content is loading
 * Shows loading skeleton animation
 */
export function SkeletonCard({
  lines = 3,
  avatar = false,
  height = 200,
  sx,
  ...props
}: SkeletonCardProps): React.ReactElement {
  return (
    <Card sx={{ ...sx }} {...props}>
      <CardContent>
        <Stack spacing={ThemeTokens.spacing.md}>
          {avatar && <Skeleton variant="circular" width={40} height={40} />}
          <Skeleton variant="text" width="80%" height={24} />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} variant="text" width={i === lines - 1 ? '60%' : '100%'} />
          ))}
          <Skeleton variant="rectangular" height={height} />
        </Stack>
      </CardContent>
    </Card>
  );
}
