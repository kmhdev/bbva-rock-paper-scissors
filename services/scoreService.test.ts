import { describe, expect, it } from 'vitest';
import { ScoreService, type KeyValueStorage } from './scoreService';

function createMemoryStorage(initial?: Record<string, string>): KeyValueStorage & {
  data: Record<string, string>;
} {
  const data: Record<string, string> = { ...(initial ?? {}) };
  return {
    data,
    getItem: async (key: string) => data[key] ?? null,
    setItem: async (key: string, value: string) => {
      data[key] = value;
    },
    removeItem: async (key: string) => {
      delete data[key];
    },
  };
}

describe('ScoreService', () => {
  it('returns 0 for unknown players', async () => {
    const service = new ScoreService(createMemoryStorage());
    await expect(service.getScore('nobody')).resolves.toBe(0);
  });

  it('saves and retrieves a score, resuming existing players case-insensitively', async () => {
    const service = new ScoreService(createMemoryStorage());
    await service.saveScore('  Kike  ', 4);
    await expect(service.getScore('kike')).resolves.toBe(4);
    await expect(service.getScore('KIKE')).resolves.toBe(4);
  });

  it('addWin increments by one and returns the new total', async () => {
    const service = new ScoreService(createMemoryStorage());
    await expect(service.addWin('ana')).resolves.toBe(1);
    await expect(service.addWin('ana')).resolves.toBe(2);
  });

  it('addLoss decrements by one and allows negative scores', async () => {
    const service = new ScoreService(createMemoryStorage());
    await expect(service.addLoss('ana')).resolves.toBe(-1);
    await expect(service.addLoss('ana')).resolves.toBe(-2);
  });

  it('getAllScores returns every player ordered by score desc', async () => {
    const service = new ScoreService(createMemoryStorage());
    await service.saveScore('bob', 2);
    await service.saveScore('ana', 5);
    await service.saveScore('zoe', 5);
    await expect(service.getAllScores()).resolves.toEqual([
      { username: 'ana', score: 5 },
      { username: 'zoe', score: 5 },
      { username: 'bob', score: 2 },
    ]);
  });

  it('validates usernames (min 2 chars after trim)', () => {
    expect(ScoreService.isValidUsername('ab')).toBe(true);
    expect(ScoreService.isValidUsername(' a ')).toBe(false);
    expect(ScoreService.isValidUsername('   ')).toBe(false);
    expect(ScoreService.isValidUsername('')).toBe(false);
  });

  it('survives corrupted storage by starting empty', async () => {
    const storage = createMemoryStorage({ '@bbva-rps:scores': 'not-json{{{' });
    const service = new ScoreService(storage);
    await expect(service.getScore('ana')).resolves.toBe(0);
    await expect(service.getAllScores()).resolves.toEqual([]);
  });

  it('survives non-object payloads by starting empty', async () => {
    const storage = createMemoryStorage({ '@bbva-rps:scores': '[1,2,3]' });
    const service = new ScoreService(storage);
    await expect(service.getAllScores()).resolves.toEqual([]);
  });

  it('resetAll clears every score', async () => {
    const service = new ScoreService(createMemoryStorage());
    await service.saveScore('ana', 3);
    await service.resetAll();
    await expect(service.getAllScores()).resolves.toEqual([]);
  });

  it('resetAll works when the backend has no removeItem', async () => {
    const storage: KeyValueStorage = {
      getItem: async () => JSON.stringify({ ana: { displayName: 'ana', score: 1 } }),
      setItem: async () => {},
    };
    const writes: string[] = [];
    storage.setItem = async (_key: string, value: string) => {
      writes.push(value);
    };
    const service = new ScoreService(storage);
    await service.resetAll();
    expect(writes).toEqual([JSON.stringify({})]);
  });
});
