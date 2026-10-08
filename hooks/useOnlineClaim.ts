import { useCallback, useEffect, useRef } from 'react';
import { getScoreService, useGameStore } from '../store/appStore';
import { ScoreService } from '../services/scoreService';
import { useSupabaseAuth } from './useSupabaseAuth';

interface UseOnlineClaimOptions {
  /** Se ejecuta tras migrar la marca local al nombre reclamado (p. ej. refrescar el ranking). */
  afterMigration?: () => void | Promise<void>;
}

/**
 * Reclamo online compartido (antes duplicado en Home y Ranking).
 * Reclama el nombre tras el login, lo auto-reclama si ya hay nombre local
 * y recuerda el perfil propio para seguir en local tras cerrar sesión.
 * Si el reclamado difiere del local, mueve la marca local al reclamado
 * para no duplicar usuarios ni perder puntos.
 */
export function useOnlineClaim(options: UseOnlineClaimOptions = {}) {
  const playerName = useGameStore((state) => state.playerName);
  const lastUsername = useGameStore((state) => state.lastUsername);
  const rememberOwnedOnlineName = useGameStore((state) => state.rememberOwnedOnlineName);
  const auth = useSupabaseAuth();

  const afterMigrationRef = useRef(options.afterMigration);
  afterMigrationRef.current = options.afterMigration;

  const claimedUsername = auth.profile?.username ?? null;
  const hasOnlineIdentity = auth.user !== null && auth.profile !== null && !auth.requiresUsername;

  const handleClaimUsername = useCallback(
    async (username: string) => {
      const state = useGameStore.getState();
      const localName = state.playerName ?? state.lastUsername;
      const result = await auth.claimUsername(username);
      if (!result || !result.ok || !result.profile) return;
      const claimed = result.profile.username;
      useGameStore.getState().rememberOwnedOnlineName(claimed);
      if (localName && !ScoreService.isSameUsername(localName, claimed)) {
        await getScoreService().transferScore(localName, claimed, state.score);
        await useGameStore.getState().registerPlayer(claimed);
        await afterMigrationRef.current?.();
      }
    },
    [auth],
  );

  const autoClaimName = playerName ?? lastUsername ?? null;
  const autoClaimAttemptedRef = useRef<string | null>(null);
  const showAutoClaimPending = auth.requiresUsername && autoClaimName !== null && auth.error === '';

  useEffect(() => {
    if (!showAutoClaimPending || auth.isClaimingUsername) return;
    const attemptKey = `${auth.user?.id ?? ''}:${autoClaimName ?? ''}`;
    if (autoClaimAttemptedRef.current === attemptKey) return;
    autoClaimAttemptedRef.current = attemptKey;
    void handleClaimUsername(autoClaimName ?? '');
  }, [
    showAutoClaimPending,
    auth.isClaimingUsername,
    auth.user,
    autoClaimName,
    handleClaimUsername,
  ]);

  useEffect(() => {
    if (hasOnlineIdentity && claimedUsername !== null) {
      // El perfil visto es propio: se recuerda para poder seguir en
      // local con el mismo nombre tras cerrar sesión.
      rememberOwnedOnlineName(claimedUsername);
    }
  }, [hasOnlineIdentity, claimedUsername, rememberOwnedOnlineName]);

  return {
    auth,
    playerName,
    lastUsername,
    claimedUsername,
    hasOnlineIdentity,
    autoClaimName,
    showAutoClaimPending,
    handleClaimUsername,
  };
}
