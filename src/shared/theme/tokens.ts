/**
 * Design System Theme Tokens
 * Centralized constants for spacing, colors, typography, and elevation
 * Used across all shared components
 */

export const ThemeTokens = {
  // Spacing tokens are MUI spacing multipliers (theme.spacing unit = 8px)
  spacing: {
    xs: 0.5, // 4px
    sm: 1, // 8px
    md: 2, // 16px
    lg: 2.5, // 20px
    xl: 2, // 16px
    xxl: 2.5, // 20px
    xxxl: 3, // 24px
  },

  // Border Radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },

  // Elevation (MUI shadow levels)
  elevation: {
    none: 0,
    sm: 1,
    md: 4,
    lg: 8,
    xl: 12,
  },

  // Layout
  layout: {
    maxWidth: 1600,
    pageHorizontalPadding: 2,
    sectionGap: 2,
    gridColumnGap: 2,
    gridRowGap: 2,
  },

  // Typography - using MUI variants
  typography: {
    pageTitleVariant: 'h4' as const,
    sectionTitleVariant: 'h6' as const,
    subsectionTitleVariant: 'subtitle1' as const,
    bodyVariant: 'body1' as const,
    captionVariant: 'caption' as const,
  },

  // Common responsive breakpoints
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },

  // Z-index
  zIndex: {
    drawer: 1200,
    modal: 1300,
    tooltip: 1400,
  },
} as const;

export type ThemeTokensType = typeof ThemeTokens;
