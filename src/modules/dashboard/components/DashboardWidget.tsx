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
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: ThemeTokens.borderRadius.md,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        ...sx,
      }}
    >
      {/* Widget Header */}
      {(title || action) && (
        <CardHeader
          avatar={icon}
          title={
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block', marginTop: 0.5 }}
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
            paddingBottom: 0,
          }}
        />
      )}

      {/* Widget Content */}
      <CardContent sx={{ flex: 1, overflowY: 'auto', '&:last-child': { paddingBottom: 2 } }}>
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
