/**
 * Filter Toolbar Component
 * Provides search, filtering, and sorting controls for Player Explorer
 */

import React from 'react';
import { Box, Stack, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { Position } from '@domain/enums';
import { SearchInput, FilterBar, FilterGroup, Badge } from '@shared/components';
import { ThemeTokens } from '@shared/theme/tokens';
import type { PlayerFilters } from '../types';

export interface FilterToolbarProps {
  filters: PlayerFilters;
  onFiltersChange: (filters: PlayerFilters) => void;
  onReset: () => void;
}

/**
 * Filter Toolbar
 * Reusable filter controls for player search and exploration
 */
export function FilterToolbar({
  filters,
  onFiltersChange,
  onReset,
}: FilterToolbarProps): React.ReactElement {
  const handleSearchChange = (search: string): void => {
    onFiltersChange({ ...filters, search });
  };

  const handlePositionChange = (position: Position): void => {
    const positions = filters.positions.includes(position)
      ? filters.positions.filter((p) => p !== position)
      : [...filters.positions, position];
    onFiltersChange({ ...filters, positions });
  };

  const handleSortChange = (sortBy: string): void => {
    onFiltersChange({ ...filters, sortBy: sortBy as PlayerFilters['sortBy'] });
  };

  const hasActiveFilters =
    filters.search ||
    filters.positions.length > 0 ||
    filters.clubs.length > 0 ||
    filters.availability !== 'all';

  return (
    <Stack spacing={ThemeTokens.spacing.lg}>
      {/* Search */}
      <Box>
        <SearchInput
          value={filters.search}
          onSearch={handleSearchChange}
          placeholder="Search by name..."
          fullWidth
        />
      </Box>

      {/* Filter Bar */}
      <FilterBar showClear={hasActiveFilters ? true : false} onClear={onReset}>
        {/* Position Filter */}
        <FilterGroup label="Position">
          {Object.values(Position).map((position: string) => (
            <Badge
              key={position}
              label={position}
              onClick={() => handlePositionChange(position as Position)}
              variant={filters.positions.includes(position as Position) ? 'filled' : 'outlined'}
              color={filters.positions.includes(position as Position) ? 'primary' : 'default'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </FilterGroup>

        {/* Sort Options */}
        <FilterGroup label="Sort By">
          {['name', 'price', 'form', 'points', 'ownership'].map((sortOption) => (
            <Badge
              key={sortOption}
              label={sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
              onClick={() => handleSortChange(sortOption)}
              variant={filters.sortBy === sortOption ? 'filled' : 'outlined'}
              color={filters.sortBy === sortOption ? 'primary' : 'default'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </FilterGroup>

        {/* Availability Filter */}
        <FilterGroup label="Availability">
          {(['all', 'available', 'expensive', 'cheap'] as const).map((availability) => (
            <Badge
              key={availability}
              label={availability.charAt(0).toUpperCase() + availability.slice(1)}
              onClick={() => onFiltersChange({ ...filters, availability })}
              variant={filters.availability === availability ? 'filled' : 'outlined'}
              color={filters.availability === availability ? 'primary' : 'default'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </FilterGroup>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onReset}
            sx={{ marginLeft: 'auto' }}
          >
            Reset
          </Button>
        )}
      </FilterBar>
    </Stack>
  );
}
