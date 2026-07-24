import React from 'react';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { Position } from '@domain/enums';
import type { Team } from '@domain/models';
import type { PlayerFilters } from '../types';

export interface FilterToolbarProps {
  filters: PlayerFilters;
  teams: Team[];
  hasActiveFilters: boolean;
  onFiltersChange: (filters: PlayerFilters) => void;
  onReset: () => void;
}

export function FilterToolbar({
  filters,
  teams,
  hasActiveFilters,
  onFiltersChange,
  onReset,
}: FilterToolbarProps): React.ReactElement {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: '1.4fr repeat(2, minmax(130px, 1fr))',
          md: '1.8fr repeat(4, minmax(130px, 1fr)) auto',
        },
        gap: 1,
        alignItems: 'center',
      }}
    >
      <TextField
        size="small"
        value={filters.search}
        onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
        placeholder="Search players..."
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      <FormControl size="small" fullWidth>
        <Select
          value={filters.position}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              position: event.target.value as PlayerFilters['position'],
            })
          }
          displayEmpty
        >
          <MenuItem value="all">All Positions</MenuItem>
          <MenuItem value={Position.Goalkeeper}>Goalkeeper</MenuItem>
          <MenuItem value={Position.Defender}>Defender</MenuItem>
          <MenuItem value={Position.Midfielder}>Midfielder</MenuItem>
          <MenuItem value={Position.Forward}>Forward</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <Select
          value={filters.clubId}
          onChange={(event) =>
            onFiltersChange({ ...filters, clubId: event.target.value as PlayerFilters['clubId'] })
          }
          displayEmpty
        >
          <MenuItem value="all">All Clubs</MenuItem>
          {teams.map((team) => (
            <MenuItem key={team.id} value={team.id}>
              {team.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <Select
          value={filters.priceBand}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              priceBand: event.target.value as PlayerFilters['priceBand'],
            })
          }
          displayEmpty
        >
          <MenuItem value="all">All Prices</MenuItem>
          <MenuItem value="budget">Budget (up to 5.5m)</MenuItem>
          <MenuItem value="mid">Mid (5.6m - 8.0m)</MenuItem>
          <MenuItem value="premium">Premium (8.1m+)</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <Select
          value={filters.availability}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              availability: event.target.value as PlayerFilters['availability'],
            })
          }
          displayEmpty
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="available">Available</MenuItem>
          <MenuItem value="doubtful">Doubtful</MenuItem>
          <MenuItem value="unavailable">Unavailable</MenuItem>
        </Select>
      </FormControl>

      {hasActiveFilters ? (
        <Button
          size="small"
          onClick={onReset}
          startIcon={<ClearIcon fontSize="small" />}
          sx={{ textTransform: 'none', whiteSpace: 'nowrap', justifySelf: 'start' }}
        >
          Clear filters
        </Button>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ justifySelf: 'end', pr: 0.5 }}>
          Filter locally from loaded season data
        </Typography>
      )}
    </Box>
  );
}
