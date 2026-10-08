import { POINTS_PER_LOSS, POINTS_PER_WIN, STORAGE_KEY_SCORES } from '../constants/game.constants';
import type { PlayerScore } from '../types/types';

/** Backend mínimo async de clave-valor para poder testear el servicio sin módulos nativos. */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem?(key: string): Promise<void>;
}

interface StoredPlayerEntry {
  displayName: string;
  score: number;
}

type StoredScores = Record<string, StoredPlayerEntry>;

/**
 * Servicio A — puntuaciones de usuario.
 * Guarda la puntuación de cada jugador, la recupera por nombre (insensible a
 * mayúsculas, así retomar un nombre existente continúa la partida) y lista
 * todos los jugadores para la vista de ranking. Persiste offline con el
 * backend inyectado.
 */
export class ScoreService {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly storageKey: string = STORAGE_KEY_SCORES,
  ) {}

  static normalizeUsername(username: string): string {
    return username.trim().toLowerCase();
  }

  static isSameUsername(a: string | null | undefined, b: string | null | undefined): boolean {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const left = ScoreService.normalizeUsername(a);
    if (left === '') return false;
    return left === ScoreService.normalizeUsername(b);
  }

  static isValidUsername(username: string): boolean {
    return username.trim().length >= 2;
  }

  async getScore(username: string): Promise<number> {
    const scores = await this.readAll();
    return scores[ScoreService.normalizeUsername(username)]?.score ?? 0;
  }

  async saveScore(username: string, score: number): Promise<void> {
    const key = ScoreService.normalizeUsername(username);
    const scores = await this.readAll();
    scores[key] = { displayName: username.trim(), score };
    await this.writeAll(scores);
  }

  /** Suma un punto a la puntuación del jugador y devuelve el nuevo total. */
  async addWin(username: string): Promise<number> {
    const next = (await this.getScore(username)) + POINTS_PER_WIN;
    await this.saveScore(username, next);
    return next;
  }

  /**
   * Resta un punto a la puntuación del jugador y devuelve el nuevo total.
   * La puntuación puede quedar en negativo; no hay mínimo.
   */
  async addLoss(username: string): Promise<number> {
    const next = (await this.getScore(username)) - POINTS_PER_LOSS;
    await this.saveScore(username, next);
    return next;
  }

  /** Todos los jugadores ordenados por puntuación desc y nombre asc. Lo usa el ranking. */
  async getAllScores(): Promise<PlayerScore[]> {
    const scores = await this.readAll();
    return Object.values(scores)
      .map((entry) => ({ username: entry.displayName, score: entry.score }))
      .sort((a, b) => b.score - a.score || a.username.localeCompare(b.username));
  }

  async resetAll(): Promise<void> {
    if (this.storage.removeItem) {
      await this.storage.removeItem(this.storageKey);
    } else {
      await this.storage.setItem(this.storageKey, JSON.stringify({}));
    }
  }

  /** Elimina la entrada local de un jugador (normalizada, insensible a mayúsculas). */
  async removeScore(username: string): Promise<void> {
    const key = ScoreService.normalizeUsername(username);
    if (key === '') return;
    const scores = await this.readAll();
    if (key in scores) {
      delete scores[key];
      await this.writeAll(scores);
    }
  }

  /**
   * Mueve la mejor marca local de `fromUsername` a `toUsername`.
   * Si son el mismo nombre (insensible a mayúsculas) no toca nada y
   * devuelve la marca actual. Si son distintos, guarda en el destino
   * el máximo entre ambas marcas (más `liveScore`) y borra el origen
   * para no duplicar usuarios ("nombre1" vs "nombre2").
   */
  async transferScore(
    fromUsername: string,
    toUsername: string,
    liveScore?: number,
  ): Promise<number> {
    if (ScoreService.isSameUsername(fromUsername, toUsername)) {
      return this.getScore(toUsername);
    }
    const from = await this.getScore(fromUsername);
    const to = await this.getScore(toUsername);
    const best = Math.max(from, to, liveScore ?? Number.NEGATIVE_INFINITY);
    await this.saveScore(toUsername, best);
    await this.removeScore(fromUsername);
    return best;
  }

  private async readAll(): Promise<StoredScores> {
    const raw = await this.storage.getItem(this.storageKey);
    if (!raw) return {};
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as StoredScores;
      }
      return {};
    } catch {
      return {};
    }
  }

  private async writeAll(scores: StoredScores): Promise<void> {
    await this.storage.setItem(this.storageKey, JSON.stringify(scores));
  }
}
