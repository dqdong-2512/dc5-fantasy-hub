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
        py: { xs: ThemeTokens.spacing.sm, sm: ThemeTokens.spacing.md, md: '20px' },
        px: { xs: ThemeTokens.spacing.md, sm: ThemeTokens.spacing.md, md: ThemeTokens.spacing.md },
        mb: '8px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'center' },
          gap: { xs: ThemeTokens.spacing.sm, sm: ThemeTokens.spacing.md },
          width: '100%',
        }}
      >
        {/* FPL Logo - Reduced Size */}
        <Box
          component="img"
          src="/fpl-logo.png"
          alt="Fantasy Premier League"
          onError={(e: any) => {
            e.target.style.display = 'none';
          }}
          sx={{
            height: { xs: '60px', sm: '80px', md: '100px' },
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            flexShrink: 0,
            borderRadius: '4px',
          }}
        />

        {/* Title & Season Block - Vertically Centered */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: { xs: 'center', sm: 'flex-start' },
            minHeight: { xs: 'auto', sm: '100px' },
          }}
        >
          {/* Primary Title */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              paddingBottom: '10px',
            }}
          >
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '22px', sm: '28px', md: '32px' },
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              Fantasy
            </Typography>

            <Typography
              component="h2"
              sx={{
                fontSize: { xs: '22px', sm: '28px', md: '32px' },
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1,
              }}
            >
              Premier League
            </Typography>
          </Box>

          {/* Secondary Info - Season */}
          <Typography
            component="div"
            sx={{
              fontSize: { xs: '13px', sm: '15px', md: '17px' },
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 1,
              mt: '6px',
            }}
          >
            Season {seasonLabel}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
