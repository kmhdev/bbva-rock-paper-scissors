import AsyncStorage from '@react-native-async-storage/async-storage';
import type { KeyValueStorage } from './scoreService';

/** Backend de clave-valor de producción. Funciona en nativo y en web (localStorage). */
export const asyncStorageBackend: KeyValueStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};
