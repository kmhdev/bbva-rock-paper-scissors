import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { PlayerScore } from '../types/types';
import { ScoreService } from './scoreService';

const PLAYERS_TABLE = 'players';

let cachedClient: SupabaseClient | null | undefined;

/**
 * Bonus (ranking online): Supabase-backed score storage.
 * Returns null when the project is not configured, so the app keeps
 * working fully offline with local scores. Configure with:
 * EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    cachedClient = null;
    return null;
  }
  cachedClient = createClient(url, anonKey);
  return cachedClient;
}

export function resetSupabaseClientCache(): void {
  cachedClient = undefined;
}

export async function fetchRemoteScores(): Promise<PlayerScore[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  const { data, error } = await client
    .from(PLAYERS_TABLE)
    .select('display_name,best_score')
    .order('best_score', { ascending: false });
  if (error || !data) return [];
  return (data as Array<{ display_name: string; best_score: number }>)
    .filter((row) => ScoreService.isValidUsername(row.display_name ?? ''))
    .map((row) => ({ username: row.display_name.trim(), score: row.best_score ?? 0 }));
}

/** Upserts only when the new score beats the stored one. No-op offline. */
export async function pushRemoteScore(username: string, score: number): Promise<void> {
  const client = getSupabaseClient();
  if (!client || !ScoreService.isValidUsername(username)) return;
  const displayName = username.trim();
  const { data } = await client
    .from(PLAYERS_TABLE)
    .select('best_score')
    .eq('username', ScoreService.normalizeUsername(displayName))
    .maybeSingle();
  const currentBest =
    data && typeof (data as { best_score: number }).best_score === 'number'
      ? (data as { best_score: number }).best_score
      : 0;
  if (score <= currentBest) return;
  await client.from(PLAYERS_TABLE).upsert(
    {
      username: ScoreService.normalizeUsername(displayName),
      display_name: displayName,
      best_score: score,
    },
    { onConflict: 'username' },
  );
}

/** Merges local and remote scores keeping the best score per player. */
export function mergeScores(local: PlayerScore[], remote: PlayerScore[]): PlayerScore[] {
  const bestByPlayer = new Map<string, PlayerScore>();
  for (const entry of [...local, ...remote]) {
    const key = ScoreService.normalizeUsername(entry.username);
    const current = bestByPlayer.get(key);
    if (!current || entry.score > current.score) {
      bestByPlayer.set(key, entry);
    }
  }
  return [...bestByPlayer.values()].sort(
    (a, b) => b.score - a.score || a.username.localeCompare(b.username),
  );
}
