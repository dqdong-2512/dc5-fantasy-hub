/**
 * Design System Theme Tokens
 * Centralized constants for spacing, colors, typography, and elevation
 * Used across all shared components
 */

export const ThemeTokens = {
  // Spacing - base unit 8px
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  // Border Radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
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
    maxWidth: 1400,
    pageHorizontalPadding: 24,
    sectionGap: 24,
    gridColumnGap: 16,
    gridRowGap: 16,
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
