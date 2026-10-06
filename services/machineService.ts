import type { Choice } from '../types/types';
import { getCountersFor } from './gameLogicService';

export interface MachineContext {
  playerHistory: readonly Choice[];
  machineHistory: readonly Choice[];
  availableChoices: readonly Choice[];
}

export interface MachineStrategy {
  readonly name: string;
  pickMove(context: MachineContext): Choice;
}

function randomIndex(length: number, random: () => number): number {
  return Math.floor(random() * length);
}

function excludePreviousPick(
  availableChoices: readonly Choice[],
  machineHistory: readonly Choice[],
): Choice[] {
  const previousPick = machineHistory[machineHistory.length - 1];
  if (availableChoices.length > 1 && previousPick !== undefined) {
    return availableChoices.filter((choice) => choice !== previousPick);
  }
  return [...availableChoices];
}

/**
 * Service C — random strategy.
 * Picks uniformly at random, but never repeats the previous machine pick
 * when there is more than one option (per challenge: machine must differ each round).
 */
export class RandomMachineStrategy implements MachineStrategy {
  readonly name = 'random';

  constructor(private readonly random: () => number = Math.random) {}

  pickMove(context: MachineContext): Choice {
    const pool = excludePreviousPick(context.availableChoices, context.machineHistory);
    return pool[randomIndex(pool.length, this.random)] as Choice;
  }
}

/**
 * Service C — smart strategy (bonus: improved machine intelligence).
 * Counters the player's most frequent pick; falls back to random
 * when there is no history yet. Same interface as the random strategy,
 * so the game view can swap one for the other.
 */
export class SmartMachineStrategy implements MachineStrategy {
  readonly name = 'smart';

  constructor(
    private readonly random: () => number = Math.random,
    private readonly fallback: MachineStrategy = new RandomMachineStrategy(),
  ) {}

  pickMove(context: MachineContext): Choice {
    const { playerHistory, machineHistory, availableChoices } = context;
    const previousPick = machineHistory[machineHistory.length - 1];

    if (playerHistory.length > 0) {
      const counters = getCountersFor(mostFrequentChoice(playerHistory)).filter((choice) =>
        availableChoices.includes(choice),
      );
      const validCounters =
        availableChoices.length > 1 && previousPick !== undefined
          ? counters.filter((choice) => choice !== previousPick)
          : counters;
      if (validCounters.length > 0) {
        return validCounters[randomIndex(validCounters.length, this.random)] as Choice;
      }
    }

    return this.fallback.pickMove(context);
  }
}

export function mostFrequentChoice(history: readonly Choice[]): Choice {
  const counts = new Map<Choice, number>();
  for (const choice of history) {
    counts.set(choice, (counts.get(choice) ?? 0) + 1);
  }
  let best: Choice = history[0] as Choice;
  let bestCount = -1;
  for (const [choice, count] of counts) {
    if (count > bestCount) {
      best = choice;
      bestCount = count;
    }
  }
  return best;
}
