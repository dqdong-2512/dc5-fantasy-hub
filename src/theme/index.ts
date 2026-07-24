import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  spacing: 8,
  components: {
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
        }),
        head: ({ theme }) => ({
          fontWeight: 600,
          paddingTop: theme.spacing(0.75),
          paddingBottom: theme.spacing(0.75),
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
  },
});
