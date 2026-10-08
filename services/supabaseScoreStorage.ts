import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { MergedScoreRow, PlayerScore, UserProfile } from '../types/types';
import { ScoreService } from './scoreService';

const PLAYERS_TABLE = 'players';
const PROFILES_TABLE = 'profiles';
const MAX_USERNAME_LENGTH = 20;

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

/** True cuando hay URL + anon key configuradas (web y nativo). */
export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
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

/** Lee el perfil reclamado del usuario. Null offline o sin perfil. */
export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client
    .from(PROFILES_TABLE)
    .select('user_id,username,created_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as UserProfile;
}

export interface ClaimUsernameResult {
  ok: boolean;
  profile?: UserProfile;
  error?: string;
}

/**
 * Reclama el nombre público una sola vez (inmutable, único
 * insensible a mayúsculas). El 23505 de Supabase es nombre ocupado.
 */
export async function claimUsername(username: string): Promise<ClaimUsernameResult> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: 'Ranking online no configurado.' };
  const clean = username.trim();
  if (!ScoreService.isValidUsername(clean) || clean.length > MAX_USERNAME_LENGTH) {
    return { ok: false, error: 'Usa entre 2 y 20 caracteres.' };
  }
  const {
    data: { session },
  } = await client.auth.getSession();
  const userId = session?.user.id;
  if (!userId) return { ok: false, error: 'Inicia sesión con Google primero.' };
  const { data, error } = await client
    .from(PROFILES_TABLE)
    .insert({ username: clean, user_id: userId })
    .select('user_id,username,created_at')
    .single();
  if (error) {
    if ((error as { code?: string }).code === '23505') {
      return { ok: false, error: 'Ese nombre ya está en uso. Prueba con otro.' };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, profile: data as UserProfile };
}

/**
 * Envía la marca online. El servidor resuelve el nombre desde el
 * perfil (auth.uid()): el cliente nunca decide el display_name.
 * No-op offline, sin sesión o sin perfil reclamado.
 */
export async function submitOnlineScore(score: number): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) return;
  const { error } = await client.rpc('submit_player_score', { p_score: score });
  if (error) return;
}

/**
 * @deprecated El ranking online exige login + nombre reclamado; sin
 * sesión es no-op y con sesión el servidor ignora `username`.
 * Usa submitOnlineScore() en código nuevo.
 */
export async function pushRemoteScore(
  username: string,
  score: number,
  userId?: string,
): Promise<void> {
  if (!ScoreService.isValidUsername(username)) return;
  if (!userId) return;
  await submitOnlineScore(score);
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

/**
 * Comparativa local vs online por jugador: conserva cada origen por
 * separado para pintarlo en columnas, más la mejor marca (`best`).
 * Orden: mejor marca desc, desempate alfabético (igual que el ranking).
 */
export function mergeScoresDetailed(local: PlayerScore[], remote: PlayerScore[]): MergedScoreRow[] {
  const localBest = new Map<string, PlayerScore>();
  for (const entry of local) {
    const key = ScoreService.normalizeUsername(entry.username);
    const current = localBest.get(key);
    if (!current || entry.score > current.score) {
      localBest.set(key, entry);
    }
  }
  const remoteBest = new Map<string, PlayerScore>();
  for (const entry of remote) {
    const key = ScoreService.normalizeUsername(entry.username);
    const current = remoteBest.get(key);
    if (!current || entry.score > current.score) {
      remoteBest.set(key, entry);
    }
  }
  const rows: MergedScoreRow[] = [];
  for (const key of new Set([...localBest.keys(), ...remoteBest.keys()])) {
    const localEntry = localBest.get(key);
    const remoteEntry = remoteBest.get(key);
    const localScore = localEntry?.score ?? null;
    const remoteScore = remoteEntry?.score ?? null;
    rows.push({
      username: localEntry?.username ?? remoteEntry?.username ?? key,
      localScore,
      remoteScore,
      best: Math.max(
        localScore ?? Number.NEGATIVE_INFINITY,
        remoteScore ?? Number.NEGATIVE_INFINITY,
      ),
    });
  }
  return rows.sort((a, b) => b.best - a.best || a.username.localeCompare(b.username));
}
