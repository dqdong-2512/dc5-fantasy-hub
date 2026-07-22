/**
 * Overview Skeleton
 * Loading skeleton for Fantasy Overview component
 * Preserves layout and prevents layout shift
 */

import React from 'react';
import {
  Box,
  Stack,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export function OverviewSkeleton(): React.ReactElement {
  return (
    <Stack spacing={ThemeTokens.spacing.sm}>
      {/* Recent Gameweek History Skeleton */}
      <Box>
        <Skeleton
          variant="text"
          width="200px"
          height={28}
          sx={{ marginBottom: ThemeTokens.spacing.xs }}
        />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="text" />
                </TableCell>
                <TableCell align="right">
                  <Skeleton variant="text" />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton variant="text" />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="text" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Stack>
  );
}
