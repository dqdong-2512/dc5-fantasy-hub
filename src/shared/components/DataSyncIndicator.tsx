/**
 * Data Sync Indicator Component
 * Displays global FPL data freshness status
 * Non-intrusive, placed in dashboard or footer
 */

import React, { useMemo } from 'react';
import { Box, Typography, Tooltip, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { DataFreshnessService, DataFreshness, type DataQualityStatus } from '@shared/services';
import { ThemeTokens } from '@shared/theme/tokens';

export interface DataSyncIndicatorProps {
  compact?: boolean;
  showWarning?: boolean;
}

/**
 * Data Sync Indicator Component
 */
export const DataSyncIndicator: React.FC<DataSyncIndicatorProps> = ({
  compact = false,
  showWarning = true,
}) => {
  const freshness = useMemo((): DataQualityStatus => {
    const service = new DataFreshnessService();
    return service.getDataQualityStatus();
  }, []);

  const staleMessage = useMemo((): string | null => {
    const service = new DataFreshnessService();
    return service.getStaleMessage();
  }, []);

  // Determine icon and color
  // Treat Unknown as Fresh if valid data exists (local sync available)
  const isUnknownWithData = freshness.freshness === DataFreshness.Unknown && freshness.isValid;
  const isFresh = freshness.freshness === DataFreshness.Fresh || isUnknownWithData;
  const isStale = freshness.freshness === DataFreshness.Stale;

  const icon = isFresh ? (
    <CheckCircleIcon sx={{ fontSize: compact ? 16 : 20, color: '#4caf50' }} />
  ) : isStale ? (
    <WarningIcon sx={{ fontSize: compact ? 16 : 20, color: '#ff9800' }} />
  ) : (
    <CircularProgress size={compact ? 16 : 20} />
  );

  const label = isFresh ? 'Data synced' : isStale ? 'Data may be outdated' : 'Checking...';

  const tooltipContent = (
    <Box>
      <Typography variant="caption" component="div">
        <strong>Data Status</strong>
      </Typography>
      <Typography variant="caption" component="div">
        {freshness.lastSyncTime ? `Last synced: ${freshness.lastSyncTime}` : 'Last sync: unknown'}
      </Typography>
      {staleMessage && (
        <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
          {staleMessage}
        </Typography>
      )}
    </Box>
  );

  if (compact) {
    return (
      <Tooltip title={tooltipContent}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
          {icon}
        </Box>
      </Tooltip>
    );
  }

  // Only show warning if configured and data is stale
  if (showWarning && isStale && staleMessage) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: ThemeTokens.spacing.sm,
          backgroundColor: '#fff3e0',
          borderRadius: '4px',
          border: '1px solid #ffe0b2',
        }}
      >
        {icon}
        <Box>
          <Typography
            variant="caption"
            sx={{ display: 'block', fontWeight: 600, color: '#e65100' }}
          >
            {label}
          </Typography>
          <Typography variant="caption" sx={{ color: '#f57c00' }}>
            {staleMessage}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Default display - just show status with tooltip
  return (
    <Tooltip title={tooltipContent}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
        {icon}
        <Typography
          variant="caption"
          sx={{ fontWeight: 500, color: isFresh ? '#4caf50' : '#ff9800' }}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  );
};
