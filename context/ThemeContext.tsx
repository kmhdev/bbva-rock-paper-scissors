import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ThemeColors } from '../types/types';

const DARK_THEME: ThemeColors = {
  background: '#181a1f',
  card: '#23262d',
  text: '#ffffff',
  textMuted: '#9aa0aa',
  accent: '#6c63ff',
  danger: '#e5484d',
  success: '#30a46c',
  border: '#34383f',
};

const LIGHT_THEME: ThemeColors = {
  background: '#f7f7fa',
  card: '#ffffff',
  text: '#181a1f',
  textMuted: '#5b606a',
  accent: '#6c63ff',
  danger: '#e5484d',
  success: '#18794e',
  border: '#e2e4e9',
};

interface ThemeContextValue {
  theme: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DARK_THEME,
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: isDark ? DARK_THEME : LIGHT_THEME,
      isDark,
      toggleTheme: () => setIsDark((previous) => !previous),
    }),
    [isDark],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
