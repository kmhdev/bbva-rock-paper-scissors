import { ScoreService } from '../../services/scoreService';
import type { PlayerScore } from '../../types/types';

/**
 * Resuelve la puntuación actual del usuario local para el ranking.
 * - Activo (`playerName`): usa el mayor entre el score vivo del store
 *   y la marca guardada en local (cubre recargas donde el store es 0).
 * - Inactivo (`lastUsername`): usa la marca guardada en local.
 * Null si no hay usuario local.
 */
export function getLocalCurrentScore(
  playerName: string | null,
  lastUsername: string | null,
  storeScore: number,
  localScores: PlayerScore[],
): PlayerScore | null {
  const targetName = playerName ?? lastUsername;
  if (targetName === null) return null;
  const saved = localScores.find(
    (entry) =>
      ScoreService.normalizeUsername(entry.username) === ScoreService.normalizeUsername(targetName),
  );
  if (playerName !== null) {
    return { username: playerName, score: Math.max(storeScore, saved?.score ?? storeScore) };
  }
  if (!saved) return null;
  return { username: saved.username, score: saved.score };
}

/** True si hay que mostrar el reclamo de la puntuación local vía Google. */
export function shouldShowClaim(
  localCurrent: PlayerScore | null,
  isConfigured: boolean,
  isAuthenticatedWithProfile: boolean,
): boolean {
  return localCurrent !== null && isConfigured && !isAuthenticatedWithProfile;
}

/**
 * Resuelve la marca local atribuible a la identidad online. Cuando hay
 * perfil reclamado, la marca viva del store solo cuenta si playerName
 * coincide con el perfil; si se jugaba como local "x" y el perfil es
 * "y", la marca de "x" nunca debe reclamarse como "y".
 * Null si no hay marca del nombre reclamado.
 */
export function getAuthenticatedLocalScore(
  claimedUsername: string,
  playerName: string | null,
  storeScore: number,
  localScores: PlayerScore[],
): PlayerScore | null {
  const saved = localScores.find((entry) =>
    ScoreService.isSameUsername(entry.username, claimedUsername),
  );
  if (playerName !== null && ScoreService.isSameUsername(playerName, claimedUsername)) {
    return { username: claimedUsername, score: Math.max(storeScore, saved?.score ?? storeScore) };
  }
  if (!saved) return null;
  return { username: saved.username, score: saved.score };
}

/**
 * Solo se envía online cuando el nombre local coincide con el perfil.
 * Evita atribuir la puntuación de "x" al usuario online "y"
 * (mismo user_id, distinto display_name).
 */
export function shouldSubmitOnlineScore(
  localCurrent: PlayerScore | null,
  profileUsername: string | null,
): boolean {
  if (localCurrent === null || profileUsername === null) return false;
  return ScoreService.isSameUsername(localCurrent.username, profileUsername);
}

/**
 * True si la fila del ranking corresponde al usuario local actual.
 * Comparación insensible a mayúsculas/espacios para no duplicar
 * "Ana" vs "ana".
 */
export function isLocalCurrentUser(
  entryUsername: string,
  localCurrentUsername: string | null | undefined,
): boolean {
  if (localCurrentUsername === null || localCurrentUsername === undefined) return false;
  return ScoreService.isSameUsername(entryUsername, localCurrentUsername);
}
