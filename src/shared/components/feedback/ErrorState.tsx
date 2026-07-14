import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import type { BoxProps } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface ErrorStateProps extends BoxProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onRetry?: () => void;
}

/**
 * ErrorState
 * Displayed when an error occurs
 * Generic error without domain logic
 */
export function ErrorState({
  title = 'Something went wrong',
  message,
  actionLabel = 'Retry',
  onRetry,
  sx,
  ...props
}: ErrorStateProps): React.ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: ThemeTokens.spacing.xxl,
        minHeight: 300,
        textAlign: 'center',
        ...sx,
      }}
      {...props}
    >
      <Box sx={{ marginBottom: ThemeTokens.spacing.lg, color: 'error.main', fontSize: 56 }}>
        <WarningIcon sx={{ fontSize: 56 }} />
      </Box>
      <Typography variant="h6" sx={{ marginBottom: ThemeTokens.spacing.md, fontWeight: 600 }}>
        {title}
      </Typography>
      <Alert severity="error" sx={{ marginBottom: ThemeTokens.spacing.lg, maxWidth: 400 }}>
        {message}
      </Alert>
      {onRetry && (
        <Button variant="contained" onClick={onRetry}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
