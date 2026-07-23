import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import type { BoxProps } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface EmptyStateProps extends BoxProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * EmptyState
 * Displayed when no data is available
 * Generic empty state without domain logic
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  sx,
  ...props
}: EmptyStateProps): React.ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: ThemeTokens.spacing.md,
        textAlign: 'center',
        ...sx,
      }}
      {...props}
    >
      {icon && (
        <Box sx={{ marginBottom: ThemeTokens.spacing.sm, fontSize: 40, opacity: 0.5 }}>{icon}</Box>
      )}
      <Typography variant="body1" sx={{ marginBottom: ThemeTokens.spacing.sm, fontWeight: 600 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant={ThemeTokens.typography.bodyVariant}
          color="text.secondary"
          sx={{ marginBottom: actionLabel ? ThemeTokens.spacing.md : 0, maxWidth: 400 }}
        >
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
