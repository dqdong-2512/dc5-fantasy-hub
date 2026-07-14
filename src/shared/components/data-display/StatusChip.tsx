import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

export type StatusChipVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

export interface StatusChipProps extends Omit<ChipProps, 'color' | 'variant'> {
  status: StatusChipVariant;
}

/**
 * StatusChip
 * Displays status with semantic coloring
 * No domain-specific logic - pure presentational
 */
export function StatusChip({ status, label, ...props }: StatusChipProps): React.ReactElement {
  const colorMap: Record<StatusChipVariant, ChipProps['color']> = {
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info',
    default: 'default',
  };

  return <Chip label={label} color={colorMap[status]} variant="outlined" size="small" {...props} />;
}
