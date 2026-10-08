import { DEFAULT_THEME, STORAGE_KEY_THEME } from '../constants/theme.constants';
import type { ThemeName } from '../types/types';
import { asyncStorageBackend } from './asyncStorageBackend';
import type { KeyValueStorage } from './scoreService';

/**
 * Persistencia del tema (portada de quiniela-native). El almacenamiento es
 * inyectable para que los tests usen un backend en memoria; en producción
 * se usa AsyncStorage.
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
    // Se ignoran los errores de lectura y se usa el valor por defecto
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
    // Se ignoran los errores de almacenamiento
  }
}
