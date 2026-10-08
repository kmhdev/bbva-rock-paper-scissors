import { beforeEach, describe, expect, it } from 'vitest';
import { ScoreService, type KeyValueStorage } from '../services/scoreService';
import { createGameStore } from './gameStore';

function createMemoryStorage(): KeyValueStorage {
  const data: Record<string, string> = {};
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

describe('gameStore', () => {
  let scoreService: ScoreService;

  beforeEach(() => {
    scoreService = new ScoreService(createMemoryStorage());
  });

  it('rejects invalid usernames', async () => {
    const store = createGameStore(scoreService);
    const result = await store.getState().registerPlayer(' ');
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
    expect(store.getState().playerName).toBeNull();
  });

  it('registers a new player with zero score', async () => {
    const store = createGameStore(scoreService);
    const result = await store.getState().registerPlayer('  Ana ');
    expect(result.ok).toBe(true);
    expect(store.getState().playerName).toBe('Ana');
    expect(store.getState().score).toBe(0);
  });

  it('resumes an existing player keeping their score', async () => {
    await scoreService.saveScore('Kike', 7);
    const store = createGameStore(scoreService);
    await store.getState().registerPlayer('kike');
    expect(store.getState().playerName).toBe('kike');
    expect(store.getState().score).toBe(7);
  });

  it('startRound marks the machine as thinking', () => {
    const store = createGameStore(scoreService);
    store.getState().startRound('rock');
    const state = store.getState();
    expect(state.playerPick).toBe('rock');
    expect(state.machineThinking).toBe(true);
    expect(state.outcome).toBeNull();
  });

  it('resolveRound with a win adds one point and records history', async () => {
    const store = createGameStore(scoreService);
    await store.getState().registerPlayer('ana');
    store.getState().startRound('rock');
    await store.getState().resolveRound('scissors');
    const state = store.getState();
    expect(state.outcome).toBe('win');
    expect(state.machinePick).toBe('scissors');
    expect(state.machineThinking).toBe(false);
    expect(state.score).toBe(1);
    expect(state.playerHistory).toEqual(['rock']);
    expect(state.machineHistory).toEqual(['scissors']);
    await expect(scoreService.getScore('ana')).resolves.toBe(1);
  });

  it('resolveRound with a loss subtracts one point and allows negatives', async () => {
    const store = createGameStore(scoreService);
    await store.getState().registerPlayer('ana');
    store.getState().startRound('rock');
    await store.getState().resolveRound('paper');
    expect(store.getState().outcome).toBe('lose');
    expect(store.getState().score).toBe(-1);
    await expect(scoreService.getScore('ana')).resolves.toBe(-1);
    store.getState().startRound('rock');
    await store.getState().resolveRound('paper');
    expect(store.getState().score).toBe(-2);
  });

  it('resolveRound with a draw keeps the score', async () => {
    const store = createGameStore(scoreService);
    await store.getState().registerPlayer('ana');
    store.getState().startRound('rock');
    await store.getState().resolveRound('rock');
    expect(store.getState().outcome).toBe('draw');
    expect(store.getState().score).toBe(0);
  });

  it('resolveRound without a player pick is a no-op', async () => {
    const store = createGameStore(scoreService);
    await store.getState().resolveRound('rock');
    expect(store.getState().outcome).toBeNull();
  });

  it('resetRound clears the current round but keeps session', async () => {
    const store = createGameStore(scoreService);
    await store.getState().registerPlayer('ana');
    store.getState().startRound('rock');
    store.getState().resetRound();
    const state = store.getState();
    expect(state.playerPick).toBeNull();
    expect(state.machineThinking).toBe(false);
    expect(state.playerName).toBe('ana');
  });

  it('exitToHome clears the session but persisted scores remain', async () => {
    const store = createGameStore(scoreService);
    await store.getState().registerPlayer('ana');
    store.getState().startRound('rock');
    await store.getState().resolveRound('scissors');
    store.getState().exitToHome();
    expect(store.getState().playerName).toBeNull();
    expect(store.getState().score).toBe(0);
    await expect(scoreService.getScore('ana')).resolves.toBe(1);
  });

  it('clearLastUsername forgets the locked name without touching scores', async () => {
    const store = createGameStore(scoreService);
    await store.getState().registerPlayer('ana');
    store.getState().exitToHome();
    expect(store.getState().lastUsername).toBe('ana');
    store.getState().clearLastUsername();
    expect(store.getState().lastUsername).toBeNull();
    await expect(scoreService.getScore('ana')).resolves.toBe(0);
  });

  it('setGameMode switches mode and clears histories', async () => {
    const store = createGameStore(scoreService);
    await store.getState().registerPlayer('ana');
    store.getState().startRound('rock');
    await store.getState().resolveRound('scissors');
    store.getState().setGameMode('extended');
    const state = store.getState();
    expect(state.gameMode).toBe('extended');
    expect(state.playerHistory).toEqual([]);
    expect(state.machineHistory).toEqual([]);
  });

  it('setSmartMachine toggles the improved machine', () => {
    const store = createGameStore(scoreService);
    expect(store.getState().smartMachine).toBe(false);
    store.getState().setSmartMachine(true);
    expect(store.getState().smartMachine).toBe(true);
  });

  it('persists the session slice when a storage is provided', async () => {
    const stored: Record<string, string> = {};
    const storage = {
      getItem: (key: string) => stored[key] ?? null,
      setItem: (key: string, value: string) => {
        stored[key] = value;
      },
      removeItem: (key: string) => {
        delete stored[key];
      },
    };
    const store = createGameStore(scoreService, storage);
    await store.getState().registerPlayer('ana');
    store.getState().setGameMode('extended');
    store.getState().setSmartMachine(true);
    const persisted = JSON.parse(stored['@bbva-rps:game-store'] ?? '{}');
    expect(persisted.state).toMatchObject({
      playerName: 'ana',
      gameMode: 'extended',
      smartMachine: true,
    });
  });
});
