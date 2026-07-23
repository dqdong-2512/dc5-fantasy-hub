/**
 * Sync Status Component
 * Displays real-time synchronization status from db.json metadata
 * Right-aligned, compact, production-ready
 * Format: ✓ Data synced · Latest at DD/MM/YYYY HH:mm (VNT)
 */

import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { DataFreshnessService } from '@shared/services';

/**
 * Format UTC timestamp to Vietnam Time (Asia/Ho_Chi_Minh)
 * Output: "DD/MM/YYYY HH:mm"
 * Example: "23/07/2026 10:30"
 */
function formatSyncTimestampVNT(isoString: string | null): string | null {
  if (!isoString) return null;

  try {
    const date = new Date(isoString);

    // Validate the date
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    // Use formatToParts for deterministic formatting
    const formatter = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Ho_Chi_Minh',
    });

    const parts = formatter.formatToParts(date);
    const partMap: Record<string, string> = {};

    for (const part of parts) {
      if (part.type !== 'literal') {
        partMap[part.type] = part.value;
      }
    }

    // Construct deterministic format: DD/MM/YYYY HH:mm
    if (partMap.day && partMap.month && partMap.year && partMap.hour && partMap.minute) {
      return `${partMap.day}/${partMap.month}/${partMap.year} ${partMap.hour}:${partMap.minute}`;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Sync Status Component
 * Shows real sync timestamp from db.json metadata, right-aligned
 */
export const SyncStatus: React.FC = () => {
  const syncInfo = useMemo(() => {
    try {
      const service = new DataFreshnessService();
      const status = service.getDataQualityStatus();

      return {
        lastSyncTime: status.lastSyncTime,
        formattedTime: formatSyncTimestampVNT(status.lastSyncTime),
        isFresh: status.freshness === 'FRESH',
      };
    } catch {
      return {
        lastSyncTime: null,
        formattedTime: null,
        isFresh: false,
      };
    }
  }, []);

  // Compose status text
  let statusText = 'Data synced';
  if (syncInfo.formattedTime) {
    statusText = `Data synced · Latest at ${syncInfo.formattedTime} (VNT)`;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.875rem',
        py: '4px',
      }}
    >
      <CloudDoneIcon
        sx={{
          fontSize: '18px',
          color: '#4caf50',
          flexShrink: 0,
        }}
      />
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.875rem',
          color: '#666',
          fontWeight: 500,
        }}
      >
        {statusText}
      </Typography>
    </Box>
  );
};
