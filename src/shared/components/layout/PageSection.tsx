import React from 'react';
import { Box, Typography } from '@mui/material';
import type { BoxProps } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface PageSectionProps extends BoxProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/**
 * PageSection
 * Logical section within a page with optional title
 * Provides consistent spacing and organization
 */
export function PageSection({
  children,
  title,
  subtitle,
  action,
  sx,
  ...props
}: PageSectionProps): React.ReactElement {
  return (
    <Box sx={{ marginBottom: ThemeTokens.spacing.sm, ...sx }} {...props}>
      {(title || subtitle || action) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: ThemeTokens.spacing.sm,
          }}
        >
          <Box>
            {title && (
              <Typography
                variant={ThemeTokens.typography.sectionTitleVariant}
                sx={{ fontWeight: 600, marginBottom: subtitle ? ThemeTokens.spacing.xs : 0 }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant={ThemeTokens.typography.bodyVariant} color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
      )}
      {children}
    </Box>
  );
}
