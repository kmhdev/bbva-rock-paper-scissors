import type { User } from '@supabase/supabase-js';
import { ScoreService } from '../../services/scoreService';
import type { PlayerScore } from '../../types/types';

/** Error al registrar en local un nombre que ya existe en el ranking online. */
export const LOCAL_NAME_TAKEN_ONLINE_ERROR =
  'Ese nombre ya está en uso por un jugador online. Elige otro.';

/**
 * Sugiere un nombre inicial para el reclamo a partir de los metadatos
 * de Google (full_name, name, preferred_username) o del prefijo del
 * email. El usuario siempre puede editarlo antes de reservar.
 */
export function getGoogleNameSuggestion(user: User | null): string {
  if (!user) return '';
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const candidates = [
    metadata.full_name,
    metadata.name,
    metadata.preferred_username,
    metadata.nickname,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length >= 2) {
      return candidate.trim().slice(0, 20);
    }
  }
  const prefix = typeof user.email === 'string' ? (user.email.split('@')[0] ?? '') : '';
  const clean = prefix.trim().slice(0, 20);
  return clean.length >= 2 ? clean : '';
}

/**
 * True si un nombre local choca (insensible a mayúsculas) con algún
 * nombre del ranking online. `ownOnlineName` exime al dueño: quien
 * juega con su propio nombre reclamado puede seguir usándolo en local.
 */
export function isUsernameTakenOnline(
  candidate: string,
  remoteScores: PlayerScore[],
  ownOnlineName: string | null = null,
): boolean {
  const normalized = ScoreService.normalizeUsername(candidate);
  if (normalized === '') return false;
  if (ownOnlineName !== null && ScoreService.normalizeUsername(ownOnlineName) === normalized) {
    return false;
  }
  return remoteScores.some(
    (entry) => ScoreService.normalizeUsername(entry.username) === normalized,
  );
}
