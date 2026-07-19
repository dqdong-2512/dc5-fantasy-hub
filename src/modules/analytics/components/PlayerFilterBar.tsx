/**
 * Player Filter Bar Component
 * Compact filters for analytics views
 */

import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Chip,
  Stack,
  Button,
  FormControl,
  InputLabel,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { ThemeTokens } from '@shared/theme/tokens';
import { Position } from '@domain/enums';
import { TeamRepository } from '@repositories/teams';
import type { PlayerFilterConfig } from '../types';

export interface PlayerFilterBarProps {
  filters: PlayerFilterConfig;
  onFiltersChange: (filters: PlayerFilterConfig) => void;
  onReset?: () => void;
  compact?: boolean;
}

const POSITION_OPTIONS = [
  { value: Position.Goalkeeper, label: 'GK' },
  { value: Position.Defender, label: 'DEF' },
  { value: Position.Midfielder, label: 'MID' },
  { value: Position.Forward, label: 'FWD' },
];

export const PlayerFilterBar: React.FC<PlayerFilterBarProps> = ({
  filters,
  onFiltersChange,
  onReset,
  compact = false,
}) => {
  const teams = useMemo(() => new TeamRepository().getAll(), []);
  const [isExpanded, setIsExpanded] = useState(!compact);

  const hasActiveFilters =
    filters.position ||
    filters.team ||
    filters.priceMin ||
    filters.priceMax ||
    filters.ownershipMin ||
    filters.ownershipMax ||
    filters.minutesMin ||
    filters.search;

  const handlePositionChange = (position: string | null | undefined): void => {
    onFiltersChange({ ...filters, position: position || undefined });
  };

  const handleTeamChange = (team: string | null | undefined): void => {
    onFiltersChange({ ...filters, team: team || undefined });
  };

  const handleSearchChange = (search: string): void => {
    onFiltersChange({ ...filters, search });
  };

  const handlePriceMinChange = (value: string): void => {
    onFiltersChange({ ...filters, priceMin: value ? parseFloat(value) : undefined });
  };

  const handlePriceMaxChange = (value: string): void => {
    onFiltersChange({ ...filters, priceMax: value ? parseFloat(value) : undefined });
  };

  const handleOwnershipMinChange = (value: string): void => {
    onFiltersChange({ ...filters, ownershipMin: value ? parseFloat(value) : undefined });
  };

  const handleOwnershipMaxChange = (value: string): void => {
    onFiltersChange({ ...filters, ownershipMax: value ? parseFloat(value) : undefined });
  };

  const handleMinutesChange = (value: string): void => {
    onFiltersChange({ ...filters, minutesMin: value ? parseFloat(value) : undefined });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: ThemeTokens.spacing.md }}>
      {/* Search Bar */}
      <TextField
        placeholder="Search players..."
        value={filters.search || ''}
        onChange={(e) => handleSearchChange(e.target.value)}
        size="small"
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: '0.9rem',
          },
        }}
      />

      {/* Expandable Filter Area */}
      {isExpanded && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: ThemeTokens.spacing.sm,
          }}
        >
          {/* Position Filter */}
          <FormControl size="small">
            <InputLabel>Position</InputLabel>
            <Select
              label="Position"
              value={filters.position || ''}
              onChange={(e) => handlePositionChange(e.target.value || null)}
            >
              <MenuItem value="">All</MenuItem>
              {POSITION_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Team Filter */}
          <FormControl size="small">
            <InputLabel>Team</InputLabel>
            <Select
              label="Team"
              value={filters.team || ''}
              onChange={(e) => handleTeamChange(e.target.value || null)}
            >
              <MenuItem value="">All Teams</MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.name}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Price Range */}
          <TextField
            label="Min Price (£m)"
            type="number"
            size="small"
            value={filters.priceMin || ''}
            onChange={(e) => handlePriceMinChange(e.target.value)}
          />

          <TextField
            label="Max Price (£m)"
            type="number"
            size="small"
            value={filters.priceMax || ''}
            onChange={(e) => handlePriceMaxChange(e.target.value)}
          />

          {/* Ownership Range */}
          <TextField
            label="Min Ownership (%)"
            type="number"
            size="small"
            value={filters.ownershipMin || ''}
            onChange={(e) => handleOwnershipMinChange(e.target.value)}
          />

          <TextField
            label="Max Ownership (%)"
            type="number"
            size="small"
            value={filters.ownershipMax || ''}
            onChange={(e) => handleOwnershipMaxChange(e.target.value)}
          />

          {/* Min Minutes */}
          <TextField
            label="Min Minutes"
            type="number"
            size="small"
            value={filters.minutesMin || ''}
            onChange={(e) => handleMinutesChange(e.target.value)}
          />

          {/* Sort By */}
          <FormControl size="small">
            <InputLabel>Sort By</InputLabel>
            <Select
              label="Sort By"
              value={filters.sortBy || 'overall'}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  sortBy: e.target.value as PlayerFilterConfig['sortBy'],
                })
              }
            >
              <MenuItem value="overall">Overall</MenuItem>
              <MenuItem value="form">Form</MenuItem>
              <MenuItem value="value">Value</MenuItem>
              <MenuItem value="differential">Differential</MenuItem>
              <MenuItem value="fixtures">Fixtures</MenuItem>
              <MenuItem value="name">Name</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Filter Bar Controls */}
      <Stack direction="row" spacing={ThemeTokens.spacing.sm} sx={{ flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant={isExpanded ? 'contained' : 'outlined'}
          startIcon={<FilterListIcon />}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide' : 'Show'} Filters
        </Button>

        {hasActiveFilters && onReset && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<ClearIcon />}
            onClick={onReset}
          >
            Clear All
          </Button>
        )}

        {hasActiveFilters && (
          <Box sx={{ display: 'flex', gap: ThemeTokens.spacing.xs, flexWrap: 'wrap' }}>
            {filters.position && (
              <Chip
                label={`Position: ${filters.position}`}
                size="small"
                onDelete={() => handlePositionChange(null)}
              />
            )}
            {filters.team && (
              <Chip
                label={`Team: ${filters.team}`}
                size="small"
                onDelete={() => handleTeamChange(null)}
              />
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );
};
