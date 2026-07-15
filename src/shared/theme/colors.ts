/**
 * Centralized Color System
 * Used across all modules for consistent visual language
 * Replaces hardcoded hex values
 */

export const AppColors = {
  // Status Colors
  status: {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
  },

  // Background Colors
  background: {
    default: '#ffffff',
    paper: '#fafafa',
    hover: '#f9f9f9',
    section: '#fafafa',
    input: '#f5f5f5',
    subtle: '#f0f0f0',
    disabled: '#e0e0e0',
  },

  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd',
  },

  // Accent Colors
  accent: {
    primary: '#1976d2',
    secondary: '#dc004e',
    highlight: '#fbc02d', // Gold for top rankings
  },

  // Border Colors
  border: {
    default: '#e0e0e0',
    light: '#f0f0f0',
  },

  // Semantic Table Colors
  table: {
    headerBackground: '#f5f5f5',
    hoverBackground: '#f9f9f9',
    alternateRow: '#fafafa',
  },

  // FDR Difficulty Scale (used by getDifficultyColor)
  fdr: {
    very_easy: '#4caf50', // Green
    easy: '#8bc34a', // Light green
    medium: '#ffc107', // Amber
    hard: '#ff9800', // Orange
    very_hard: '#f44336', // Red
  },
} as const;

export type AppColorsType = typeof AppColors;
