import { describe, expect, it } from 'vitest';
import { CLASSIC_CHOICES, EXTENDED_CHOICES } from '../constants/game.constants';
import type { Choice } from '../types/types';
import { decideWinner, getChoicesForMode, getCountersFor } from './gameLogicService';

describe('decideWinner — classic rock-paper-scissors rules', () => {
  const wins: Array<[Choice, Choice]> = [
    ['rock', 'scissors'],
    ['scissors', 'paper'],
    ['paper', 'rock'],
  ];

  it.each(wins)('player %s beats machine %s', (player, machine) => {
    expect(decideWinner(player, machine)).toBe('win');
    expect(decideWinner(machine, player)).toBe('lose');
  });

  it.each(CLASSIC_CHOICES)('same pick %s is a draw', (pick) => {
    expect(decideWinner(pick, pick)).toBe('draw');
  });
});

describe('decideWinner — extended lizard-spock rules', () => {
  const extraWins: Array<[Choice, Choice]> = [
    ['rock', 'lizard'],
    ['paper', 'spock'],
    ['scissors', 'lizard'],
    ['lizard', 'paper'],
    ['lizard', 'spock'],
    ['spock', 'rock'],
    ['spock', 'scissors'],
  ];

  it.each(extraWins)('player %s beats machine %s', (player, machine) => {
    expect(decideWinner(player, machine)).toBe('win');
    expect(decideWinner(machine, player)).toBe('lose');
  });

  it('covers every ordered pair without throwing', () => {
    for (const player of EXTENDED_CHOICES) {
      for (const machine of EXTENDED_CHOICES) {
        expect(['win', 'lose', 'draw']).toContain(decideWinner(player, machine));
      }
    }
  });

  it('is antisymmetric: win one way means lose the other', () => {
    for (const player of EXTENDED_CHOICES) {
      for (const machine of EXTENDED_CHOICES) {
        const direct = decideWinner(player, machine);
        const inverse = decideWinner(machine, player);
        if (direct === 'draw') expect(inverse).toBe('draw');
        if (direct === 'win') expect(inverse).toBe('lose');
        if (direct === 'lose') expect(inverse).toBe('win');
      }
    }
  });
});

describe('getChoicesForMode', () => {
  it('returns 3 choices for classic mode', () => {
    expect(getChoicesForMode('classic')).toEqual(['rock', 'paper', 'scissors']);
  });

  it('returns 5 choices for extended mode', () => {
    expect(getChoicesForMode('extended')).toHaveLength(5);
  });
});

describe('getCountersFor', () => {
  it('returns the two choices that beat rock', () => {
    expect(getCountersFor('rock').sort()).toEqual(['paper', 'spock']);
  });

  it('every choice has exactly two counters', () => {
    for (const choice of EXTENDED_CHOICES) {
      expect(getCountersFor(choice)).toHaveLength(2);
    }
  });
});
