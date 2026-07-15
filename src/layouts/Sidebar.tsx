import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  { id: 'dashboard', label: 'Dashboard', path: 'dashboard' },
  { id: 'players', label: 'Players', path: 'players' },
  { id: 'fixtures', label: 'Fixtures', path: 'fixtures' },
  { id: 'teams', label: 'Clubs', path: 'teams' },
  { id: 'analytics', label: 'Analytics', path: 'analytics' },
  { id: 'fantasy', label: 'Fantasy Game', path: 'fantasy' },
  { id: 'champions', label: 'Champions League', path: 'champions-league/dashboard' },
];

export const Sidebar: React.FC<SidebarProps> = ({ width, open, onToggle }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();

  // Get the current competition and path segment
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const competition = pathSegments[0];
  const currentPage = pathSegments[1];

  const handleNavigate = (path: string): void => {
    // Handle Champions League specially (it goes to champions-league, not under premier-league)
    if (path.startsWith('champions-league')) {
      navigate(`/${path}`);
    } else {
      navigate(`/${competition}/${path}`);
    }
    if (isMobile) {
      onToggle();
    }
  };

  const isActive = (path: string): boolean => {
    if (path.startsWith('champions-league')) {
      return currentPage === 'champions-league' || pathSegments[0] === 'champions-league';
    }
    return currentPage === path;
  };

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
                onClick={() => handleNavigate(item.path)}
                selected={isActive(item.path)}
                sx={{
                  paddingX: 2,
                  paddingY: 1.5,
                  color: isActive(item.path) ? '#1976d2' : '#424242',
                  backgroundColor: isActive(item.path) ? '#e3f2fd' : 'transparent',
                  fontWeight: isActive(item.path) ? 600 : 400,
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#e3f2fd',
                    },
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
