import type { StateStorage } from 'zustand/middleware';
import { asyncStorageBackend } from '../services/asyncStorageBackend';
import { ScoreService } from '../services/scoreService';
import { createGameStore } from './gameStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cableado de producción: puntuaciones en AsyncStorage (offline primero,
 * funciona en nativo y web) y sesión persistida con zustand/middleware.
 * Importar desde las vistas; nunca desde los tests unitarios de vitest
 * (módulos nativos).
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
