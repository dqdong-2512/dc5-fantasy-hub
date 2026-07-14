import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';

interface SidebarProps {
  width: number;
  open: boolean;
  onToggle: () => void;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/' },
  { id: 'fixtures', label: 'Fixtures', path: '/fixtures' },
  { id: 'players', label: 'Players', path: '/players' },
  { id: 'analytics', label: 'Analytics', path: '/analytics' },
  { id: 'fantasy', label: 'Fantasy', path: '/fantasy' },
  { id: 'champions', label: 'Champions League', path: '/champions-league' },
];

export const Sidebar: React.FC<SidebarProps> = ({ width, open, onToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onToggle}
      sx={{
        width: open ? width : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
          paddingTop: 0,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          paddingTop: 2,
        }}
      >
        <List sx={{ flex: 1 }}>
          {MENU_ITEMS.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                sx={{
                  paddingX: 2,
                  paddingY: 1.5,
                  color: '#424242',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  '&.active': {
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    fontWeight: 600,
                  },
                }}
              >
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.95rem',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        <Box sx={{ paddingX: 2, paddingY: 2 }}>
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                paddingX: 2,
                paddingY: 1.5,
                color: '#424242',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <ListItemText
                primary="Settings"
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.95rem',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        </Box>
      </Box>
    </Drawer>
  );
};
