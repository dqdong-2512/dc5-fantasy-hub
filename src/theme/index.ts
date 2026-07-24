import { createTheme, type PaletteMode } from '@mui/material/styles';

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === 'dark';

  return createTheme({
    spacing: 8,
    palette: {
      mode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#0288d1',
      },
      background: {
        default: isDark ? '#121826' : '#f7f8fa',
        paper: isDark ? '#1a2332' : '#ffffff',
      },
      text: {
        primary: isDark ? '#e5eaf3' : '#0f172a',
        secondary: isDark ? '#9caec8' : '#475569',
      },
      divider: isDark ? '#283548' : '#d9e1ec',
      success: {
        main: '#2e7d32',
      },
      warning: {
        main: '#ed6c02',
      },
      error: {
        main: '#d32f2f',
      },
      info: {
        main: '#0288d1',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollBehavior: 'smooth',
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: ({ theme }) => ({
            minHeight: theme.spacing(7),
            '@media (min-width:600px)': {
              minHeight: theme.spacing(7),
            },
          }),
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: ({ theme }) => ({
            border: `1px solid ${theme.palette.divider}`,
            backgroundImage: 'none',
          }),
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: theme.spacing(1.5, 1.75),
            '&:last-child': {
              paddingBottom: theme.spacing(1.5),
            },
          }),
        },
      },
      MuiTable: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: theme.spacing(0.5, 1),
            lineHeight: 1.3,
            borderColor: theme.palette.divider,
          }),
          head: ({ theme }) => ({
            fontWeight: 600,
            paddingTop: theme.spacing(0.75),
            paddingBottom: theme.spacing(0.75),
            backgroundColor: isDark ? '#202b3b' : '#f4f6fb',
          }),
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: ({ theme }) => ({
            padding: theme.spacing(0.5, 1.25),
          }),
          message: ({ theme }) => ({
            padding: theme.spacing(0.25, 0),
          }),
        },
      },
      MuiTab: {
        styleOverrides: {
          root: ({ theme }) => ({
            minHeight: theme.spacing(4.5),
            paddingTop: theme.spacing(0.5),
            paddingBottom: theme.spacing(0.5),
          }),
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: ({ theme }) => ({
            minHeight: theme.spacing(4.5),
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            minHeight: theme.spacing(3.75),
            paddingTop: theme.spacing(0.5),
            paddingBottom: theme.spacing(0.5),
            textTransform: 'none',
          }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: () => ({
            height: 24,
            borderRadius: 6,
          }),
          label: ({ theme }) => ({
            fontSize: theme.typography.caption.fontSize,
          }),
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: () => ({
            transform: 'none',
            borderRadius: 6,
            backgroundColor: isDark ? '#2a364a' : '#e9edf5',
          }),
        },
      },
    },
  });
}

export const appTheme = createAppTheme('light');
