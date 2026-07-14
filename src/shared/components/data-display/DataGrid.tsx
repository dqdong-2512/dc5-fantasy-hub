import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import type { TableProps } from '@mui/material';

export interface DataGridColumn {
  id: string;
  label: string;
  render?: (row: any) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface DataGridProps extends Omit<TableProps, 'children'> {
  columns: DataGridColumn[];
  rows: any[];
  keyExtractor: (row: any) => string | number;
  onRowClick?: (row: any) => void;
}

/**
 * DataGrid
 * Generic data table component
 * Displays tabular data with customizable columns
 */
export function DataGrid({
  columns,
  rows,
  keyExtractor,
  onRowClick,
  sx,
  ...props
}: DataGridProps): React.ReactElement {
  return (
    <Paper sx={{ overflow: 'hidden', ...sx }}>
      <Table {...props}>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'action.hover' }}>
            {columns.map((column) => (
              <TableCell key={column.id} align={column.align || 'left'} sx={{ fontWeight: 600 }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': onRowClick ? { backgroundColor: 'action.hover' } : {},
              }}
            >
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align || 'left'}>
                  {column.render ? column.render(row) : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
