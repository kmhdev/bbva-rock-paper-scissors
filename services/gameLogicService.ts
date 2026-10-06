import { BEATS, CHOICES_BY_MODE } from '../constants/game.constants';
import type { Choice, GameMode, RoundOutcome } from '../types/types';

/**
 * Service B — game rules.
 * Given two picks, returns the outcome from the player's perspective.
 * Classic (RPS) and extended (RPSLS) share the same signature so the
 * game view can swap one for the other without changes.
 */
export function decideWinner(playerPick: Choice, machinePick: Choice): RoundOutcome {
  if (playerPick === machinePick) return 'draw';
  return BEATS[playerPick].includes(machinePick) ? 'win' : 'lose';
}

export function getChoicesForMode(mode: GameMode): readonly Choice[] {
  return CHOICES_BY_MODE[mode];
}

/** For each choice, the choices that beat it (derived, inverse of BEATS). */
export function getCountersFor(choice: Choice): Choice[] {
  const allChoices = Object.keys(BEATS) as Choice[];
  return allChoices.filter((candidate) => decideWinner(candidate, choice) === 'win');
}
