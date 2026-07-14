import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

export interface BadgeProps extends Omit<ChipProps, 'variant'> {
  variant?: 'filled' | 'outlined';
}

/**
 * Badge
 * Generic badge/tag component for labeling and categorization
 * Used for generic tags without semantic meaning
 */
export function Badge({
  variant = 'filled',
  size = 'small',
  ...props
}: BadgeProps): React.ReactElement {
  return <Chip variant={variant} size={size} {...props} />;
}
