import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { STORAGE_KEY_GAME_STORE } from '../constants/game.constants';
import type { Choice, GameMode, RoundOutcome } from '../types/types';
import { decideWinner } from '../services/gameLogicService';
import { ScoreService } from '../services/scoreService';

export interface GameStoreState {
  playerName: string | null;
  lastUsername: string | null;
  score: number;
  gameMode: GameMode;
  smartMachine: boolean;
  playerPick: Choice | null;
  machinePick: Choice | null;
  outcome: RoundOutcome | null;
  machineThinking: boolean;
  playerHistory: Choice[];
  machineHistory: Choice[];
  /**
   * Nombres online reclamados por este dispositivo (perfiles propios).
   * Tras cerrar sesión eximen del bloqueo "nombre en uso online" para
   * poder seguir jugando en local con el mismo nombre. Es solo una
   * comodidad de UX: la identidad online real la impone el servidor
   * (perfil inmutable + unicidad 23505), no esta lista.
   */
  ownedOnlineNames: string[];
  registerPlayer: (username: string) => Promise<{ ok: boolean; error?: string }>;
  clearLastUsername: () => void;
  rememberOwnedOnlineName: (username: string) => void;
  startRound: (pick: Choice) => void;
  resolveRound: (machinePick: Choice) => Promise<void>;
  resetRound: () => void;
  exitToHome: () => void;
  setGameMode: (mode: GameMode) => void;
  setSmartMachine: (enabled: boolean) => void;
}

export interface PersistedGameSlice {
  playerName: string | null;
  lastUsername: string | null;
  gameMode: GameMode;
  smartMachine: boolean;
  ownedOnlineNames: string[];
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
      partial: Partial<GameStoreState> | ((state: GameStoreState) => Partial<GameStoreState>),
    ) => void,
    get: () => GameStoreState,
  ): GameStoreState => ({
    playerName: null,
    lastUsername: null,
    score: 0,
    gameMode: 'classic',
    smartMachine: false,
    ownedOnlineNames: [],
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
        lastUsername: displayName,
        score,
        ...INITIAL_ROUND,
        playerHistory: [],
        machineHistory: [],
      });
      return { ok: true };
    },

    clearLastUsername: () => set({ lastUsername: null }),

    rememberOwnedOnlineName: (username: string) => {
      const displayName = username.trim();
      if (displayName === '') return;
      const owned = get().ownedOnlineNames;
      const list = Array.isArray(owned) ? owned : [];
      if (list.some((name) => ScoreService.isSameUsername(name, displayName))) return;
      set({ ownedOnlineNames: [...list, displayName] });
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
      } else if (outcome === 'lose' && playerName !== null) {
        score = await scoreService.addLoss(playerName);
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
      set((state) => ({
        playerName: null,
        lastUsername: state.lastUsername ?? state.playerName,
        score: 0,
        ...INITIAL_ROUND,
        playerHistory: [],
        machineHistory: [],
      })),

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
          lastUsername: state.lastUsername,
          gameMode: state.gameMode,
          smartMachine: state.smartMachine,
          ownedOnlineNames: Array.isArray(state.ownedOnlineNames) ? state.ownedOnlineNames : [],
        }),
      }),
    );
  }
  return create<GameStoreState>()(initializer);
}
