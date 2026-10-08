import type { ThemeColors, ThemeName } from '../types/types';

/** Clave de AsyncStorage para persistir el tema. */
export const STORAGE_KEY_THEME = '@bbva-rps:theme';

export const DEFAULT_THEME: ThemeName = 'dark';

export const DARK_THEME: ThemeColors = {
  name: 'dark',
  accent: '#e63946',
  background: '#181a1f',
  text: '#fff',
  secondary: '#f0c446',
  card: '#23272f',
  border: '#333646',
  textSecondary: '#7a7a8c',
  textMuted: '#7a7a8c',
  scorePanel: 'rgb(50,52,57)',
  danger: '#e5484d',
  success: '#30a46c',
};

export const LIGHT_THEME: ThemeColors = {
  name: 'light',
  accent: '#072146',
  background: 'rgb(240, 240, 240)',
  text: '#181a1f',
  secondary: '#f0c446',
  card: '#fff',
  border: '#e0e0e0',
  textSecondary: '#7a7a8c',
  textMuted: '#7a7a8c',
  scorePanel: '#e6e8ec',
  danger: '#e5484d',
  success: '#18794e',
};
