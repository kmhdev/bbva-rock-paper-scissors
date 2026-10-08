import { BEATS, CHOICES_BY_MODE } from '../constants/game.constants';
import type { Choice, GameMode, RoundOutcome } from '../types/types';

/**
 * Servicio B — reglas del juego.
 * Dadas dos jugadas, devuelve el resultado desde el punto de vista del jugador.
 * Clásico (PPT) y extendido (PPTLS) comparten firma para que la vista
 * pueda cambiar uno por otro sin cambios.
 */
export function decideWinner(playerPick: Choice, machinePick: Choice): RoundOutcome {
  if (playerPick === machinePick) return 'draw';
  return BEATS[playerPick].includes(machinePick) ? 'win' : 'lose';
}

export function getChoicesForMode(mode: GameMode): readonly Choice[] {
  return CHOICES_BY_MODE[mode];
}

/** Para cada jugada, las que le ganan (derivado, inverso de BEATS). */
export function getCountersFor(choice: Choice): Choice[] {
  const allChoices = Object.keys(BEATS) as Choice[];
  return allChoices.filter((candidate) => decideWinner(candidate, choice) === 'win');
}
