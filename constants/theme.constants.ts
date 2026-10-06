import type { ThemeColors, ThemeName } from '../types/types';

/** AsyncStorage key for theme persistence. */
export const STORAGE_KEY_THEME = '@bbva-rps:theme';

export const DEFAULT_THEME: ThemeName = 'dark';

export const DARK_THEME: ThemeColors = {
  name: 'dark',
  background: '#181a1f',
  card: '#23262d',
  text: '#ffffff',
  textMuted: '#9aa0aa',
  accent: '#6c63ff',
  danger: '#e5484d',
  success: '#30a46c',
  border: '#34383f',
};

export const LIGHT_THEME: ThemeColors = {
  name: 'light',
  background: '#f7f7fa',
  card: '#ffffff',
  text: '#181a1f',
  textMuted: '#5b606a',
  accent: '#6c63ff',
  danger: '#e5484d',
  success: '#18794e',
  border: '#e2e4e9',
};
