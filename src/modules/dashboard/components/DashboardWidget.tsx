/**
 * Dashboard Widget Component
 * Reusable widget wrapper for dashboard sections
 */

import React from 'react';
import { Box, Card, CardContent, CardHeader, Typography, Button } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  children: React.ReactNode;
  footer?: React.ReactNode;
  sx?: object;
}

/**
 * Reusable Dashboard Widget
 * Provides consistent layout for all dashboard sections
 */
export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  subtitle,
  icon,
  action,
  children,
  footer,
  sx,
}) => {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: ThemeTokens.borderRadius.md,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        ...sx,
      }}
    >
      {/* Widget Header */}
      {(title || action) && (
        <CardHeader
          avatar={icon}
          title={
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block', marginTop: 0.25 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          }
          action={
            action ? (
              <Button size="small" onClick={action.onClick} sx={{ textTransform: 'none' }}>
                {action.label}
              </Button>
            ) : undefined
          }
          sx={{
            paddingBottom: ThemeTokens.spacing.sm,
            paddingX: ThemeTokens.spacing.md,
            paddingTop: ThemeTokens.spacing.md,
          }}
        />
      )}

      {/* Widget Content */}
      <CardContent
        sx={{
          padding: ThemeTokens.spacing.md,
          '&:last-child': { paddingBottom: ThemeTokens.spacing.md },
        }}
      >
        {children}
      </CardContent>

      {/* Widget Footer */}
      {footer && (
        <Box
          sx={{
            borderTop: '1px solid #e0e0e0',
            padding: ThemeTokens.spacing.md,
            backgroundColor: '#fafafa',
          }}
        >
          {footer}
        </Box>
      )}
    </Card>
  );
};
