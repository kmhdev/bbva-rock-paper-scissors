import { useCallback, useEffect, useRef } from 'react';
import { MACHINE_REVEAL_DELAY_MS } from '../../constants/game.constants';
import { getChoicesForMode } from '../../services/gameLogicService';
import { randomMachineStrategy, smartMachineStrategy } from '../../services/machineStrategies';
import { ScoreService } from '../../services/scoreService';
import { submitOnlineScore } from '../../services/supabaseScoreStorage';
import { useGameStore } from '../../store/appStore';
import type { Choice, GameMode, RoundOutcome, SegmentedToggleOption } from '../../types/types';
import { vibrateOnLoss } from '../../utils/vibration';

export type HardModeValue = 'off' | 'on';

export const HARD_MODE_OPTIONS: ReadonlyArray<SegmentedToggleOption<HardModeValue>> = [
  { value: 'off', label: 'OFF', accessibilityLabel: 'Desactivar máquina inteligente' },
  { value: 'on', label: 'ON', accessibilityLabel: 'Activar máquina inteligente' },
];

/**
 * Nombre de usuario único: con perfil reclamado no se puede jugar como otro
 * nombre local ("x"); la marca de "x" nunca debe enviarse como "y".
 */
export function shouldForceExitToHome(
  hasOnlineIdentity: boolean,
  claimedUsername: string | null,
  playerName: string | null,
): boolean {
  return (
    hasOnlineIdentity &&
    claimedUsername !== null &&
    playerName !== null &&
    !ScoreService.isSameUsername(playerName, claimedUsername)
  );
}

/**
 * Solo se envía online al ganar con identidad online y jugando con el
 * nombre reclamado. Sin login, sin perfil o jugando como otro nombre
 * local la marca queda solo en local.
 */
export function shouldSubmitOnlineScoreForGame(
  outcome: RoundOutcome | null,
  playerName: string | null,
  claimedUsername: string | null,
  hasOnlineIdentity: boolean,
): boolean {
  return (
    outcome === 'win' &&
    playerName !== null &&
    hasOnlineIdentity &&
    claimedUsername !== null &&
    ScoreService.isSameUsername(playerName, claimedUsername)
  );
}

/** Turno de la máquina: elige estrategia según el modo hard y resuelve la jugada. */
export function resolveMachineChoice({
  smartMachine,
  playerHistory,
  machineHistory,
  gameMode,
}: {
  smartMachine: boolean;
  playerHistory: readonly Choice[];
  machineHistory: readonly Choice[];
  gameMode: GameMode;
}): Choice {
  const strategy = smartMachine ? smartMachineStrategy : randomMachineStrategy;
  return strategy.pickMove({
    playerHistory,
    machineHistory,
    availableChoices: getChoicesForMode(gameMode),
  });
}

/**
 * Orquesta el temporizador de revelado, la resolución de la ronda y sus
 * efectos (vibración al perder y envío online al ganar).
 */
export function useGameRound({
  hasOnlineIdentity,
  claimedUsername,
  onExit,
}: {
  hasOnlineIdentity: boolean;
  claimedUsername: string | null;
  onExit: () => void;
}) {
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (revealTimer.current !== null) {
        clearTimeout(revealTimer.current);
      }
    };
  }, []);

  const clearRevealTimer = useCallback(() => {
    if (revealTimer.current !== null) {
      clearTimeout(revealTimer.current);
      revealTimer.current = null;
    }
  }, []);

  // Efectos tras resolver la ronda: vibración al perder y envío online al ganar.
  const settleRoundSideEffects = useCallback(() => {
    const settled = useGameStore.getState();
    if (settled.outcome === 'lose') {
      void vibrateOnLoss();
    }
    if (
      shouldSubmitOnlineScoreForGame(
        settled.outcome,
        settled.playerName,
        claimedUsername,
        hasOnlineIdentity,
      )
    ) {
      void submitOnlineScore(settled.score);
    }
  }, [claimedUsername, hasOnlineIdentity]);

  const revealMachineMove = useCallback(() => {
    const latest = useGameStore.getState();
    const machineChoice = resolveMachineChoice({
      smartMachine: latest.smartMachine,
      playerHistory: latest.playerHistory,
      machineHistory: latest.machineHistory,
      gameMode: latest.gameMode,
    });
    void latest.resolveRound(machineChoice).then(settleRoundSideEffects);
  }, [settleRoundSideEffects]);

  const handlePick = useCallback(
    (pick: Choice) => {
      const store = useGameStore.getState();
      if (store.machineThinking) return;
      store.startRound(pick);
      clearRevealTimer();
      revealTimer.current = setTimeout(revealMachineMove, MACHINE_REVEAL_DELAY_MS);
    },
    [clearRevealTimer, revealMachineMove],
  );

  const handleExit = useCallback(() => {
    clearRevealTimer();
    useGameStore.getState().exitToHome();
    onExit();
  }, [clearRevealTimer, onExit]);

  return { handlePick, handleExit };
}
