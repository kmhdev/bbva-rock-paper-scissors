import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { STORAGE_KEY_GAME_STORE } from '../constants/game.constants';
import type { Choice, GameMode, RoundOutcome } from '../types/types';
import { decideWinner } from '../services/gameLogicService';
import { ScoreService } from '../services/scoreService';

export interface GameStoreState {
  playerName: string | null;
  score: number;
  gameMode: GameMode;
  smartMachine: boolean;
  playerPick: Choice | null;
  machinePick: Choice | null;
  outcome: RoundOutcome | null;
  machineThinking: boolean;
  playerHistory: Choice[];
  machineHistory: Choice[];
  registerPlayer: (username: string) => Promise<{ ok: boolean; error?: string }>;
  startRound: (pick: Choice) => void;
  resolveRound: (machinePick: Choice) => Promise<void>;
  resetRound: () => void;
  exitToHome: () => void;
  setGameMode: (mode: GameMode) => void;
  setSmartMachine: (enabled: boolean) => void;
}

export interface PersistedGameSlice {
  playerName: string | null;
  gameMode: GameMode;
  smartMachine: boolean;
}

const INITIAL_ROUND = {
  playerPick: null,
  machinePick: null,
  outcome: null,
  machineThinking: false,
} as const;

/**
 * Zustand store factory. ScoreService is injected so tests can use an
 * in-memory backend while production uses AsyncStorage. Persistence of the
 * session slice (player, mode) is opt-in via storage to keep unit tests sync.
 */
export function createGameStore(scoreService: ScoreService, storage?: StateStorage) {
  const initializer = (
    set: (
      partial:
        | Partial<GameStoreState>
        | ((state: GameStoreState) => Partial<GameStoreState>),
    ) => void,
    get: () => GameStoreState,
  ): GameStoreState => ({
    playerName: null,
    score: 0,
    gameMode: 'classic',
    smartMachine: false,
    ...INITIAL_ROUND,
    playerHistory: [],
    machineHistory: [],

    registerPlayer: async (username: string) => {
      if (!ScoreService.isValidUsername(username)) {
        return { ok: false, error: 'Introduce un nombre con al menos 2 caracteres.' };
      }
      const displayName = username.trim();
      const score = await scoreService.getScore(displayName);
      set({
        playerName: displayName,
        score,
        ...INITIAL_ROUND,
        playerHistory: [],
        machineHistory: [],
      });
      return { ok: true };
    },

    startRound: (pick: Choice) => {
      set({ playerPick: pick, machinePick: null, outcome: null, machineThinking: true });
    },

    resolveRound: async (machinePick: Choice) => {
      const { playerPick, playerHistory, machineHistory } = get();
      if (playerPick === null) return;
      const outcome = decideWinner(playerPick, machinePick);
      const playerName = get().playerName;
      let score = get().score;
      if (outcome === 'win' && playerName !== null) {
        score = await scoreService.addWin(playerName);
      }
      set({
        machinePick,
        outcome,
        machineThinking: false,
        score,
        playerHistory: [...playerHistory, playerPick],
        machineHistory: [...machineHistory, machinePick],
      });
    },

    resetRound: () => set({ ...INITIAL_ROUND }),

    exitToHome: () =>
      set({
        playerName: null,
        score: 0,
        ...INITIAL_ROUND,
        playerHistory: [],
        machineHistory: [],
      }),

    setGameMode: (mode: GameMode) =>
      set({ gameMode: mode, ...INITIAL_ROUND, playerHistory: [], machineHistory: [] }),

    setSmartMachine: (enabled: boolean) => set({ smartMachine: enabled }),
  });

  if (storage) {
    return create<GameStoreState>()(
      persist(initializer, {
        name: STORAGE_KEY_GAME_STORE,
        storage: createJSONStorage(() => storage),
        partialize: (state): PersistedGameSlice => ({
          playerName: state.playerName,
          gameMode: state.gameMode,
          smartMachine: state.smartMachine,
        }),
      }),
    );
  }
  return create<GameStoreState>()(initializer);
}
