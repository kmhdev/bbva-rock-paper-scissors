import { CHOICE_META } from '../../constants/game.constants';
import type { Choice, RoundOutcome } from '../../types/types';

export const OUTCOME_MESSAGE: Record<RoundOutcome, string> = {
  win: '¡Has ganado! +1 punto',
  lose: 'Has perdido -1 punto',
  draw: 'Empate',
};

/** Texto "Tú: ✊ Piedra" a partir de la jugada del jugador. */
export function formatPlayerPick(playerPick: Choice): string {
  return `Tú: ${CHOICE_META[playerPick].emoji} ${CHOICE_META[playerPick].label}`;
}

/** Texto "Máquina: ✌️ Tijera" a partir de la jugada de la máquina. */
export function formatMachinePick(machinePick: Choice): string {
  return `Máquina: ${CHOICE_META[machinePick].emoji} ${CHOICE_META[machinePick].label}`;
}

/** Mensaje de veredicto para el outcome dado. */
export function getOutcomeMessage(outcome: RoundOutcome): string {
  return OUTCOME_MESSAGE[outcome];
}

/** Placeholder de "pensando" mientras la máquina no reveló su jugada. */
export function isThinkingPlaceholder(thinking: boolean, machinePick: Choice | null): boolean {
  return thinking || machinePick === null;
}

/** El veredicto solo se muestra con la ronda resuelta y sin "pensando". */
export function shouldShowOutcome(thinking: boolean, outcome: RoundOutcome | null): boolean {
  return !thinking && outcome !== null;
}
