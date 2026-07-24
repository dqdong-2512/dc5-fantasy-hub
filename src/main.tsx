import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { App } from './App';
import { createAppTheme } from './theme';
import { ThemeModeProvider, useThemeMode } from './theme/theme-mode';

const rootElement = document.getElementById('app');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeModeProvider>
      <AppThemeContainer />
    </ThemeModeProvider>
  </React.StrictMode>
);

function AppThemeContainer(): React.ReactElement {
  const { resolvedMode } = useThemeMode();
  const theme = React.useMemo(() => createAppTheme(resolvedMode), [resolvedMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}
