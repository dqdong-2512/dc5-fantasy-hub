import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeModeContextValue {
  modePreference: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setModePreference: (mode: ThemeMode) => void;
  toggleResolvedMode: () => void;
}

const THEME_STORAGE_KEY = 'dc5-theme-mode';

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

function resolveSystemMode(): 'light' | 'dark' {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [modePreference, setModePreferenceState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // Ignore storage access failures.
    }
    return 'system';
  });
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>(resolveSystemMode);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent): void => {
      setSystemMode(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', onChange);
    return () => {
      mediaQuery.removeEventListener('change', onChange);
    };
  }, []);

  const setModePreference = (mode: ThemeMode): void => {
    setModePreferenceState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignore storage access failures.
    }
  };

  const resolvedMode: 'light' | 'dark' = modePreference === 'system' ? systemMode : modePreference;

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      modePreference,
      resolvedMode,
      setModePreference,
      toggleResolvedMode: () => {
        setModePreference(resolvedMode === 'dark' ? 'light' : 'dark');
      },
    }),
    [modePreference, resolvedMode]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return context;
}
