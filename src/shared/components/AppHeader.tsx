import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import BrightnessIcon from '@mui/icons-material/Brightness4';
import LightModeIcon from '@mui/icons-material/LightMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeMode } from '@theme/theme-mode';

interface NavItem {
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/premier-league/dashboard' },
  { label: 'Gameweek', path: '/premier-league/gameweek' },
  { label: 'Players', path: '/premier-league/players' },
  { label: 'Analytics', path: '/premier-league/analytics' },
];

export const AppHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { resolvedMode, toggleResolvedMode } = useThemeMode();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleNavigation = (path: string): void => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        zIndex: 1100,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          paddingX: { xs: 1, sm: 1.5 },
          minHeight: 56,
          height: { xs: 56, sm: 65 },
          gap: 1,
        }}
      >
        {/* Logo */}
        <Typography
          component={RouterLink}
          to="/"
          variant="h6"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            fontSize: { xs: '1rem', sm: '1.25rem' },
            whiteSpace: 'nowrap',
            flexShrink: 0,
            textDecoration: 'none',

            '&:hover': {
              textDecoration: 'none',
              opacity: 0.8,
            },

            '&:visited': {
              color: 'primary.main',
            },
          }}
        >
          DC5 Fantasy Hub
        </Typography>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, flex: 1 }}>
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                  fontWeight: isActive(item.path) ? 600 : 500,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  position: 'relative',
                  px: 1,
                  py: 0.5,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    backgroundColor: 'primary.main',
                    transform: isActive(item.path) ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'center',
                    transition: 'transform 0.3s ease',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        )}

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginLeft: 'auto' }}>
          <IconButton
            size="small"
            aria-label="theme toggle"
            title="Theme toggle"
            sx={{ color: 'text.secondary' }}
            onClick={toggleResolvedMode}
          >
            {resolvedMode === 'dark' ? <LightModeIcon /> : <BrightnessIcon />}
          </IconButton>
          <IconButton
            size="small"
            aria-label="profile"
            title="Profile"
            sx={{ color: 'text.secondary' }}
          >
            <AccountCircleIcon />
          </IconButton>

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              size="small"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ color: 'text.secondary' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Navigation Drawer */}
      <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <List sx={{ width: 250, paddingTop: 1 }}>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  backgroundColor: isActive(item.path) ? 'action.selected' : 'transparent',
                  color: isActive(item.path) ? 'primary.main' : 'text.primary',
                  fontWeight: isActive(item.path) ? 600 : 500,
                }}
              >
                {item.label}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
};
