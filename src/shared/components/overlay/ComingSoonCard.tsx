import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import type { CardProps } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface ComingSoonCardProps extends CardProps {
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * ComingSoonCard
 * Card-based coming soon placeholder
 * Generic layout for features under development
 */
export function ComingSoonCard({
  icon,
  title = 'Coming Soon',
  subtitle = 'This feature is currently under development',
  sx,
  ...props
}: ComingSoonCardProps): React.ReactElement {
  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        ...sx,
      }}
      {...props}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: ThemeTokens.spacing.lg,
          }}
        >
          {icon && <Box sx={{ fontSize: 64, opacity: 0.6, color: 'primary.main' }}>{icon}</Box>}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant={ThemeTokens.typography.bodyVariant} color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
