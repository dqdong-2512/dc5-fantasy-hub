import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import RemoveIcon from '@mui/icons-material/Remove';
import { ThemeTokens } from '@shared/theme/tokens';

export type SortDirection = 'asc' | 'desc';

export interface RankingTableColumn<T> {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortValue?: (row: T) => number | string;
  render: (row: T) => React.ReactNode;
}

export interface RankingTableAvatar<T> {
  src: (row: T) => string | undefined;
  alt: (row: T) => string;
}

export interface RankingTableRowMeta<T> {
  key: (row: T) => string | number;
  title: (row: T) => string;
  subtitle?: (row: T) => string;
  positionChip?: (row: T) => string | null;
  badges?: (row: T) => string[];
  trend?: (row: T) => 'up' | 'down' | 'flat';
  avatar?: RankingTableAvatar<T>;
}

export interface RankingTableProps<T> {
  title?: string;
  rows: T[];
  columns: RankingTableColumn<T>[];
  rowMeta: RankingTableRowMeta<T>;
  initialSortColumn?: string;
  initialSortDirection?: SortDirection;
  enableFilter?: boolean;
  filterPlaceholder?: string;
}

export function RankingTable<T>({
  title,
  rows,
  columns,
  rowMeta,
  initialSortColumn,
  initialSortDirection = 'desc',
  enableFilter = true,
  filterPlaceholder = 'Filter rows',
}: RankingTableProps<T>): React.ReactElement {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sortColumn, setSortColumn] = useState(initialSortColumn ?? columns[0]?.id ?? '');
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  const [filterText, setFilterText] = useState('');

  const filteredRows = useMemo(() => {
    if (!enableFilter || filterText.trim() === '') {
      return rows;
    }

    const query = filterText.toLowerCase();
    return rows.filter((row) => {
      const titleText = rowMeta.title(row).toLowerCase();
      const subtitleText = rowMeta.subtitle ? rowMeta.subtitle(row).toLowerCase() : '';
      return titleText.includes(query) || subtitleText.includes(query);
    });
  }, [enableFilter, filterText, rowMeta, rows]);

  const sortedRows = useMemo(() => {
    const activeColumn = columns.find((column) => column.id === sortColumn);
    if (!activeColumn || !activeColumn.sortable || !activeColumn.sortValue) {
      return filteredRows;
    }

    return [...filteredRows].sort((rowA, rowB) => {
      const valueA = activeColumn.sortValue ? activeColumn.sortValue(rowA) : 0;
      const valueB = activeColumn.sortValue ? activeColumn.sortValue(rowB) : 0;

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      const numericA = typeof valueA === 'number' ? valueA : Number(valueA);
      const numericB = typeof valueB === 'number' ? valueB : Number(valueB);
      return sortDirection === 'asc' ? numericA - numericB : numericB - numericA;
    });
  }, [columns, filteredRows, sortColumn, sortDirection]);

  const handleSort = (columnId: string): void => {
    if (sortColumn === columnId) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortColumn(columnId);
    setSortDirection('desc');
  };

  const renderTrend = (trend: 'up' | 'down' | 'flat' | undefined): React.ReactNode => {
    if (trend === 'up') {
      return <ArrowDropUpIcon sx={{ color: 'success.main', fontSize: 18 }} />;
    }
    if (trend === 'down') {
      return <ArrowDropDownIcon sx={{ color: 'error.main', fontSize: 18 }} />;
    }
    return <RemoveIcon sx={{ color: 'text.disabled', fontSize: 14 }} />;
  };

  if (isMobile) {
    return (
      <Box>
        {title && (
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: ThemeTokens.spacing.sm }}>
            {title}
          </Typography>
        )}
        {enableFilter && (
          <TextField
            value={filterText}
            onChange={(event) => setFilterText(event.target.value)}
            placeholder={filterPlaceholder}
            size="small"
            fullWidth
            sx={{ mb: ThemeTokens.spacing.sm }}
          />
        )}
        <Box sx={{ display: 'grid', gap: ThemeTokens.spacing.sm }}>
          {sortedRows.map((row) => (
            <Paper key={rowMeta.key(row)} sx={{ p: ThemeTokens.spacing.sm }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.sm }}>
                {rowMeta.avatar && (
                  <Avatar
                    src={rowMeta.avatar.src(row)}
                    alt={rowMeta.avatar.alt(row)}
                    sx={{ width: 32, height: 32 }}
                  />
                )}
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                    {rowMeta.title(row)}
                  </Typography>
                  {rowMeta.subtitle && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {rowMeta.subtitle(row)}
                    </Typography>
                  )}
                </Box>
                {renderTrend(rowMeta.trend ? rowMeta.trend(row) : undefined)}
              </Box>

              <Box
                sx={{
                  mt: ThemeTokens.spacing.xs,
                  display: 'flex',
                  gap: ThemeTokens.spacing.xs,
                  flexWrap: 'wrap',
                }}
              >
                {rowMeta.positionChip && rowMeta.positionChip(row) && (
                  <Chip label={rowMeta.positionChip(row)} size="small" variant="outlined" />
                )}
                {(rowMeta.badges ? rowMeta.badges(row) : []).map((badge) => (
                  <Chip
                    key={`${rowMeta.key(row)}-${badge}`}
                    label={badge}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>

              <Box
                sx={{
                  mt: ThemeTokens.spacing.xs,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: ThemeTokens.spacing.xs,
                }}
              >
                {columns.slice(0, 6).map((column) => (
                  <Box key={`${rowMeta.key(row)}-${column.id}`}>
                    <Typography variant="caption" color="text.secondary">
                      {column.label}
                    </Typography>
                    <Typography variant="body2">{column.render(row)}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {title && (
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: ThemeTokens.spacing.sm }}>
          {title}
        </Typography>
      )}

      {enableFilter && (
        <TextField
          value={filterText}
          onChange={(event) => setFilterText(event.target.value)}
          placeholder={filterPlaceholder}
          size="small"
          fullWidth
          sx={{ mb: ThemeTokens.spacing.sm }}
        />
      )}

      <Paper sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 220, fontWeight: 700 }}>Player / Team</TableCell>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align ?? 'left'} sx={{ fontWeight: 700 }}>
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortColumn === column.id}
                      direction={sortColumn === column.id ? sortDirection : 'desc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedRows.map((row) => (
              <TableRow key={rowMeta.key(row)} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.sm }}>
                    {rowMeta.avatar && (
                      <Avatar
                        src={rowMeta.avatar.src(row)}
                        alt={rowMeta.avatar.alt(row)}
                        sx={{ width: 28, height: 28 }}
                      />
                    )}
                    <Box sx={{ minWidth: 0 }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: ThemeTokens.spacing.xs }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                          {rowMeta.title(row)}
                        </Typography>
                        {renderTrend(rowMeta.trend ? rowMeta.trend(row) : undefined)}
                      </Box>
                      {rowMeta.subtitle && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {rowMeta.subtitle(row)}
                        </Typography>
                      )}
                      <Box
                        sx={{
                          display: 'flex',
                          gap: ThemeTokens.spacing.xs,
                          flexWrap: 'wrap',
                          mt: 0.25,
                        }}
                      >
                        {rowMeta.positionChip && rowMeta.positionChip(row) && (
                          <Chip label={rowMeta.positionChip(row)} size="small" variant="outlined" />
                        )}
                        {(rowMeta.badges ? rowMeta.badges(row) : []).map((badge) => (
                          <Chip
                            key={`${rowMeta.key(row)}-${badge}`}
                            label={badge}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </TableCell>

                {columns.map((column) => (
                  <TableCell
                    key={`${rowMeta.key(row)}-${column.id}`}
                    align={column.align ?? 'left'}
                  >
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
