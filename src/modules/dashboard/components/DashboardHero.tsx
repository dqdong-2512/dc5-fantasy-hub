/**
 * FPL Dashboard Hero Section
 * Full-width header with logo, title, and gradient background
 * Displays dynamically resolved season from synchronized dataset
 */

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';
import { getCurrentSeasonLabel } from '@shared/services';

/**
 * Dashboard Hero Component
 * Displays FPL branding with gradient background
 * Season is resolved from db.json metadata, not hard-coded
 */
export const DashboardHero: React.FC = () => {
  const seasonLabel = useMemo(() => {
    try {
      return getCurrentSeasonLabel();
    } catch {
      return '2025/26'; // Fallback
    }
  }, []);
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #06b6d4 100%)',
        width: '100%',
        py: { xs: '16px', sm: '20px', md: '24px' },
        px: { xs: '16px', sm: '20px', md: '20px' },
        mb: ThemeTokens.spacing.xs,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: { xs: '12px', sm: '20px' },
          width: '100%',
        }}
      >
        {/* FPL Logo */}
        <Box
          component="img"
          src="/fpl-logo.png"
          alt="Fantasy Premier League"
          sx={{
            height: { xs: '80px', sm: '100px', md: '120px' },
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            flexShrink: 0,
          }}
        />

        {/* Title & Season */}
        <Box
          sx={{
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: '24px', sm: '28px', md: '32px', lg: '36px' },
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2,
            }}
          >
            Fantasy
          </Typography>

          <Typography
            component="div"
            sx={{
              fontSize: { xs: '20px', sm: '24px', md: '28px', lg: '32px' },
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: ThemeTokens.spacing.xs,
            }}
          >
            Premier League
          </Typography>
          <Typography
            component="h2"
            sx={{
              fontSize: { xs: '14px', sm: '16px', md: '18px' },
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.75)',
              lineHeight: 1.3,
            }}
          >
            Season {seasonLabel}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
