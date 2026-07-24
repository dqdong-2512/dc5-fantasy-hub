import React from 'react';
import { Box, Skeleton, Stack, Typography } from '@mui/material';

interface LoadingViewProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: 1,
      }}
    >
      <Stack spacing={1} sx={{ width: '100%', maxWidth: 420 }}>
        <Skeleton variant="text" width="34%" height={32} />
        <Skeleton variant="rounded" height={120} />
        <Skeleton variant="text" width="88%" />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};
