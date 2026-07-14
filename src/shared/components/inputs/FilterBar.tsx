import React from 'react';
import { Paper, Button } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import type { PaperProps } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface FilterBarProps extends PaperProps {
  children: React.ReactNode;
  onClear?: () => void;
  showClear?: boolean;
}

/**
 * FilterBar
 * Container for filter controls
 * Provides consistent styling for grouped filters
 */
export function FilterBar({
  children,
  onClear,
  showClear = false,
  sx,
  ...props
}: FilterBarProps): React.ReactElement {
  return (
    <Paper
      sx={{
        display: 'flex',
        gap: ThemeTokens.spacing.md,
        alignItems: 'center',
        padding: ThemeTokens.spacing.md,
        flexWrap: 'wrap',
        ...sx,
      }}
      {...props}
    >
      {children}
      {showClear && onClear && (
        <Button
          size="small"
          startIcon={<ClearIcon />}
          onClick={onClear}
          sx={{ marginLeft: 'auto' }}
        >
          Clear
        </Button>
      )}
    </Paper>
  );
}
