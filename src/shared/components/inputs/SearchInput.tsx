import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { TextFieldProps } from '@mui/material';

export interface SearchInputProps extends Omit<TextFieldProps, 'type' | 'variant'> {
  onSearch?: (value: string) => void;
}

/**
 * SearchInput
 * Reusable search input field with icon
 * Generic search without any domain-specific logic
 */
export function SearchInput({
  onSearch,
  onChange,
  ...props
}: SearchInputProps): React.ReactElement {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value;
    onSearch?.(value);
    onChange?.(event as any);
  };

  return (
    <TextField
      type="search"
      variant="outlined"
      size="small"
      placeholder="Search..."
      onChange={handleChange}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
}
