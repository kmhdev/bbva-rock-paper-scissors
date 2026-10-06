import type { StateStorage } from 'zustand/middleware';
import { asyncStorageBackend } from '../services/asyncStorageBackend';
import { ScoreService } from '../services/scoreService';
import { createGameStore } from './gameStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Production wiring: scores in AsyncStorage (offline-first, works on
 * native and web) and session slice persisted with zustand/middleware.
 * Import this from views; never from vitest unit tests (native modules).
 */
const productionScoreService = new ScoreService(asyncStorageBackend);

const zustandAsyncStorage: StateStorage = {
  getItem: (name: string) => AsyncStorage.getItem(name),
  setItem: (name: string, value: string) => AsyncStorage.setItem(name, value),
  removeItem: (name: string) => AsyncStorage.removeItem(name),
};

export const useGameStore = createGameStore(productionScoreService, zustandAsyncStorage);

export function getScoreService(): ScoreService {
  return productionScoreService;
}
