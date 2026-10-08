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
  if (ownOnlineName !== null && ScoreService.isSameUsername(ownOnlineName, candidate)) {
    return false;
  }
  return remoteScores.some(
    (entry) => ScoreService.normalizeUsername(entry.username) === normalized,
  );
}

/**
 * True cuando la sesión local (p. ej. "x") no coincide con el nombre
 * reclamado online (p. ej. perfil "y"). Sin esta guarda, la marca local
 * de "x" se enviaría como "y" y el ranking mostraría dos nombres para
 * el mismo user_id (puntuaciones ficticias).
 */
export function needsIdentitySwitch(
  playerName: string | null,
  claimedUsername: string | null,
): boolean {
  if (playerName === null || claimedUsername === null) return false;
  return !ScoreService.isSameUsername(playerName, claimedUsername);
}

/**
 * Devuelve el nombre propio (reclamado antes en este dispositivo) que
 * coincide con el candidato, o null. Tras cerrar sesión exime del
 * bloqueo "nombre en uso online" para seguir jugando en local con el
 * mismo nombre. Tolera listas ausentes o manipuladas.
 */
export function resolveOwnOnlineName(
  ownedOnlineNames: readonly string[] | null | undefined,
  candidate: string,
): string | null {
  if (!Array.isArray(ownedOnlineNames)) return null;
  const found = ownedOnlineNames.find(
    (name) => typeof name === 'string' && ScoreService.isSameUsername(name, candidate),
  );
  return found ?? null;
}
