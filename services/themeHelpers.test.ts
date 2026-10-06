import { describe, expect, it } from 'vitest';
import { getStoredTheme, setStoredTheme } from './themeHelpers';
import type { KeyValueStorage } from './scoreService';

function createMemoryStorage(initial?: Record<string, string>): KeyValueStorage {
  const data: Record<string, string> = { ...(initial ?? {}) };
  return {
    getItem: async (key: string) => data[key] ?? null,
    setItem: async (key: string, value: string) => {
      data[key] = value;
    },
    removeItem: async (key: string) => {
      delete data[key];
    },
  };
}

describe('themeHelpers', () => {
  it('returns the default theme when nothing is stored', async () => {
    await expect(getStoredTheme(createMemoryStorage())).resolves.toBe('dark');
  });

  it('round-trips the stored theme', async () => {
    const storage = createMemoryStorage();
    await setStoredTheme('light', storage);
    await expect(getStoredTheme(storage)).resolves.toBe('light');
    await setStoredTheme('dark', storage);
    await expect(getStoredTheme(storage)).resolves.toBe('dark');
  });

  it('falls back to default on unexpected values', async () => {
    const storage = createMemoryStorage({ '@bbva-rps:theme': 'midnight' });
    await expect(getStoredTheme(storage)).resolves.toBe('dark');
  });

  it('falls back to default when reading throws', async () => {
    const storage: KeyValueStorage = {
      getItem: async () => {
        throw new Error('denied');
      },
      setItem: async () => {},
    };
    await expect(getStoredTheme(storage)).resolves.toBe('dark');
  });

  it('ignores write errors', async () => {
    const storage: KeyValueStorage = {
      getItem: async () => null,
      setItem: async () => {
        throw new Error('denied');
      },
    };
    await expect(setStoredTheme('light', storage)).resolves.toBeUndefined();
  });
});
