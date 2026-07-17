/**
 * Dashboard Widget Component
 * Reusable widget wrapper for dashboard sections
 */

import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
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
        overflow: 'hidden',
        height: '100%',
        ...sx,
      }}
    >
      {/* Widget Header with Orange-Yellow Background */}
      {(title || action) && (
        <Box
          sx={{
            backgroundColor: '#f59e0b',
            padding: { xs: 2, md: 4 },
            display: 'flex',
            alignItems: 'center',
            gap: ThemeTokens.spacing.md,
            justifyContent: 'space-between',
            flexShrink: 0,
            minHeight: 0,
          }}
        >
          {/* Icon + Title/Subtitle */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: ThemeTokens.spacing.md,
              minWidth: 0,
              flex: 1,
            }}
          >
            {icon && <Box sx={{ color: '#ffffff', display: 'flex', flexShrink: 0 }}>{icon}</Box>}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#ffffff',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    marginTop: 0.25,
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontSize: '0.75rem',
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Action Button */}
          {action && (
            <Button
              size="small"
              onClick={action.onClick}
              sx={{
                textTransform: 'none',
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
                flexShrink: 0,
              }}
            >
              {action.label}
            </Button>
          )}
        </Box>
      )}

      {/* Widget Content */}
      <CardContent
        sx={{
          padding: 4,
          '&:last-child': { paddingBottom: 8 },
          flex: 1,
          overflowY: 'auto',
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
