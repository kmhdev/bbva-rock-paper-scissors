import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DARK_THEME, LIGHT_THEME } from '../constants/theme.constants';
import type { ThemeColors } from '../types/types';
import { getStoredTheme, setStoredTheme } from '../services/themeHelpers';
import { syncWebDocumentPresentation } from '../services/webDocumentPresentation';

interface ThemeContextValue {
  theme: ThemeColors;
  isDark: boolean;
  setTheme: (theme: ThemeColors) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Proveedor de tema (portado de quiniela-native): temas claro/oscuro con nombre,
 * persistidos entre reinicios y sincronizados con el documento web. No renderiza
 * nada hasta haber leído el tema guardado para evitar un parpadeo de tema.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeColors>(DARK_THEME);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    getStoredTheme().then((stored) => {
      setThemeState(stored === 'dark' ? DARK_THEME : LIGHT_THEME);
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    syncWebDocumentPresentation(theme.background);
  }, [theme.background]);

  const setTheme = useCallback((nextTheme: ThemeColors) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((previous) => {
      const nextTheme = previous.name === 'light' ? DARK_THEME : LIGHT_THEME;
      void setStoredTheme(nextTheme.name);
      return nextTheme;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme.name === 'dark',
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  if (!isReady) return null;

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
