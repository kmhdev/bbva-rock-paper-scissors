import { describe, expect, it } from 'vitest';
import { CLASSIC_CHOICES, EXTENDED_CHOICES } from '../constants/game.constants';
import type { Choice } from '../types/types';
import {
  RandomMachineStrategy,
  SmartMachineStrategy,
  mostFrequentChoice,
  type MachineContext,
} from './machineService';

function contextWith(
  overrides: Partial<MachineContext> & { availableChoices: readonly Choice[] },
): MachineContext {
  return { playerHistory: [], machineHistory: [], ...overrides };
}

describe('RandomMachineStrategy', () => {
  it('always returns one of the available choices', () => {
    const strategy = new RandomMachineStrategy(() => 0.99);
    for (let i = 0; i < 50; i++) {
      const pick = strategy.pickMove(contextWith({ availableChoices: CLASSIC_CHOICES }));
      expect(CLASSIC_CHOICES).toContain(pick);
    }
  });

  it('never repeats the previous machine pick when alternatives exist', () => {
    const strategy = new RandomMachineStrategy(() => 0);
    for (const previous of CLASSIC_CHOICES) {
      for (let i = 0; i < 20; i++) {
        const pick = strategy.pickMove(
          contextWith({ availableChoices: CLASSIC_CHOICES, machineHistory: [previous] }),
        );
        expect(pick).not.toBe(previous);
      }
    }
  });

  it('returns the only choice when a single option is available', () => {
    const strategy = new RandomMachineStrategy();
    expect(
      strategy.pickMove(contextWith({ availableChoices: ['rock'], machineHistory: ['rock'] })),
    ).toBe('rock');
  });
});

describe('SmartMachineStrategy', () => {
  it('counters the most frequent player pick (rock -> paper)', () => {
    const strategy = new SmartMachineStrategy(() => 0);
    const pick = strategy.pickMove(
      contextWith({
        availableChoices: CLASSIC_CHOICES,
        playerHistory: ['rock', 'rock', 'rock', 'paper'],
      }),
    );
    expect(pick).toBe('paper');
  });

  it('falls back to random when there is no player history', () => {
    const strategy = new SmartMachineStrategy(() => 0);
    const pick = strategy.pickMove(contextWith({ availableChoices: CLASSIC_CHOICES }));
    expect(CLASSIC_CHOICES).toContain(pick);
  });

  it('never repeats the previous machine pick when alternatives exist', () => {
    const strategy = new SmartMachineStrategy(() => 0);
    const pick = strategy.pickMove(
      contextWith({
        availableChoices: EXTENDED_CHOICES,
        playerHistory: ['rock', 'rock', 'rock'],
        machineHistory: ['paper'],
      }),
    );
    expect(pick).toBe('spock');
  });

  it('falls back to random when the only counter repeats the previous pick', () => {
    const fallback = new RandomMachineStrategy(() => 0);
    const strategy = new SmartMachineStrategy(() => 0.999, fallback);
    const pick = strategy.pickMove(
      contextWith({
        availableChoices: ['rock', 'paper'],
        playerHistory: ['rock', 'rock', 'rock'],
        machineHistory: ['paper'],
      }),
    );
    expect(['rock', 'paper']).toContain(pick);
    expect(pick).not.toBe('paper');
  });
});

describe('mostFrequentChoice', () => {
  it('returns the most common pick, first-seen wins ties', () => {
    expect(mostFrequentChoice(['paper', 'rock', 'paper', 'rock', 'paper'])).toBe('paper');
    expect(mostFrequentChoice(['rock', 'paper'])).toBe('rock');
  });
});
