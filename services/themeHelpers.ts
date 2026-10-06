import { DEFAULT_THEME, STORAGE_KEY_THEME } from '../constants/theme.constants';
import type { ThemeName } from '../types/types';
import { asyncStorageBackend } from './asyncStorageBackend';
import type { KeyValueStorage } from './scoreService';

/**
 * Theme persistence (ported from quiniela-native). Storage is injectable so
 * unit tests run with an in-memory backend; production uses AsyncStorage.
 */
export async function getStoredTheme(
  storage: KeyValueStorage = asyncStorageBackend,
): Promise<ThemeName> {
  try {
    const stored = await storage.getItem(STORAGE_KEY_THEME);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch {
    // Ignore read errors and fall back to default
  }
  return DEFAULT_THEME;
}

export async function setStoredTheme(
  theme: ThemeName,
  storage: KeyValueStorage = asyncStorageBackend,
): Promise<void> {
  try {
    await storage.setItem(STORAGE_KEY_THEME, theme);
  } catch {
    // Ignore storage errors
  }
}
