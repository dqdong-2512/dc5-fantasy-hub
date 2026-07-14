import React from 'react';
import { Drawer, Box, Typography, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { DrawerProps } from '@mui/material';
import { ThemeTokens } from '@shared/theme/tokens';

export interface SideDrawerProps extends Omit<DrawerProps, 'children'> {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: number;
}

/**
 * SideDrawer
 * Side panel drawer for additional content
 * Generic overlay without domain logic
 */
export function SideDrawer({
  title,
  children,
  onClose,
  width = 320,
  ...props
}: SideDrawerProps): React.ReactElement {
  return (
    <Drawer
      anchor="right"
      {...props}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width, zIndex: ThemeTokens.zIndex.drawer },
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {title && (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: ThemeTokens.spacing.lg,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              <IconButton size="small" onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider />
          </>
        )}
        <Box sx={{ flex: 1, overflow: 'auto', padding: ThemeTokens.spacing.lg }}>{children}</Box>
      </Box>
    </Drawer>
  );
}
