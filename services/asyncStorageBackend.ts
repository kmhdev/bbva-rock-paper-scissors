import AsyncStorage from '@react-native-async-storage/async-storage';
import type { KeyValueStorage } from './scoreService';

/** Production key-value backend. Works on native and web (localStorage). */
export const asyncStorageBackend: KeyValueStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};
