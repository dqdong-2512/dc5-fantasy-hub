import React, { memo, useEffect, useRef, useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';

export function LiveStatusBadge({
  status,
}: {
  status: 'PRESEASON' | 'PRE_DEADLINE' | 'LOCKED' | 'LIVE' | 'PROVISIONAL' | 'FINAL';
}): React.ReactElement {
  const config = {
    PRESEASON: ['Pre-season', 'default'],
    PRE_DEADLINE: ['Pre-deadline', 'info'],
    LOCKED: ['Locked', 'warning'],
    LIVE: ['LIVE', 'error'],
    PROVISIONAL: ['Provisional', 'warning'],
    FINAL: ['Final', 'success'],
  }[status] as [string, 'default' | 'info' | 'warning' | 'error' | 'success'];
  return <Chip size="small" label={config[0]} color={config[1]} sx={{ fontWeight: 800 }} />;
}

export const CaptainBadge = memo(function CaptainBadge({
  captain,
  viceCaptain,
}: {
  captain?: boolean;
  viceCaptain?: boolean;
}): React.ReactElement | null {
  if (!captain && !viceCaptain) return null;
  return (
    <Chip
      size="small"
      label={captain ? 'C' : 'VC'}
      sx={{
        height: 22,
        bgcolor: captain ? '#37003c' : '#e2e8f0',
        color: captain ? '#fff' : '#334155',
        fontWeight: 900,
      }}
    />
  );
});

export const PointsChangeIndicator = memo(function PointsChangeIndicator({
  value,
}: {
  value: number;
}): React.ReactElement {
  const previous = useRef(value);
  const [changed, setChanged] = useState(false);
  const [before, setBefore] = useState<number | null>(null);

  useEffect(() => {
    if (previous.current !== value) {
      setBefore(previous.current);
      previous.current = value;
      setChanged(true);
      const timer = window.setTimeout(() => setChanged(false), 1600);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [value]);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 0.5,
        borderRadius: 1,
        bgcolor: changed ? '#dcfce7' : 'transparent',
        transition: 'background-color 240ms ease',
      }}
    >
      {changed && before !== null && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textDecoration: 'line-through' }}
        >
          {before}
        </Typography>
      )}
      <Typography component="span" sx={{ fontWeight: 900 }}>
        {value}
      </Typography>
    </Box>
  );
});

export function DataFreshnessIndicator({
  updatedAt,
  delayed = false,
}: {
  updatedAt: string | null;
  delayed?: boolean;
}): React.ReactElement {
  const parsedUpdatedAt = updatedAt ? new Date(updatedAt) : null;
  const updateLabel =
    parsedUpdatedAt && !Number.isNaN(parsedUpdatedAt.getTime())
      ? `Updated ${parsedUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : 'Update unavailable';
  return (
    <Typography variant="caption" color={delayed ? 'warning.main' : 'text.secondary'}>
      {delayed ? `Data temporarily delayed · ${updateLabel}` : `Live · ${updateLabel}`}
    </Typography>
  );
}
