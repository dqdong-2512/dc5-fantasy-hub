import React from 'react';
import { FormControl, FormLabel, FormGroup } from '@mui/material';
import type { FormGroupProps } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface FilterGroupProps extends Omit<FormGroupProps, 'children'> {
  label: string;
  children: React.ReactNode;
}

/**
 * FilterGroup
 * Grouped filter controls with a label
 * Typically contains multiple checkboxes or radio buttons
 */
export function FilterGroup({
  label,
  children,
  sx,
  ...props
}: FilterGroupProps): React.ReactElement {
  return (
    <FormControl sx={{ minWidth: 200, ...sx }}>
      <FormLabel sx={{ marginBottom: ThemeTokens.spacing.sm, fontWeight: 600 }}>{label}</FormLabel>
      <FormGroup {...props}>{children}</FormGroup>
    </FormControl>
  );
}
