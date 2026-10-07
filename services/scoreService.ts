import { POINTS_PER_LOSS, POINTS_PER_WIN, STORAGE_KEY_SCORES } from '../constants/game.constants';
import type { PlayerScore } from '../types/types';

/** Minimal async key-value backend so the service is testable without native modules. */
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
 * Service A — user scores.
 * Stores each player's score, retrieves it by username (case-insensitive,
 * so re-entering an existing name resumes the game), and lists every
 * player for the ranking view. Persists offline through the injected backend.
 */
export class ScoreService {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly storageKey: string = STORAGE_KEY_SCORES,
  ) {}

  static normalizeUsername(username: string): string {
    return username.trim().toLowerCase();
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

  /** Adds one point to the player's score and returns the new total. */
  async addWin(username: string): Promise<number> {
    const next = (await this.getScore(username)) + POINTS_PER_WIN;
    await this.saveScore(username, next);
    return next;
  }

  /**
   * Subtracts one point from the player's score and returns the new total.
   * The score may go negative; there is no floor.
   */
  async addLoss(username: string): Promise<number> {
    const next = (await this.getScore(username)) - POINTS_PER_LOSS;
    await this.saveScore(username, next);
    return next;
  }

  /** All players ordered by score desc, then name asc. Used by the ranking view. */
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
