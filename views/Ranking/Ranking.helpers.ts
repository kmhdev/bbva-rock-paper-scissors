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
