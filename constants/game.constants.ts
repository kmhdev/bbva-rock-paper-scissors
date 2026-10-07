import type { Choice, ClassicChoice, ExtendedChoice, GameMode } from '../types/types';

export const CLASSIC_CHOICES: readonly ClassicChoice[] = ['rock', 'paper', 'scissors'];

export const EXTENDED_CHOICES: readonly ExtendedChoice[] = [
  'rock',
  'paper',
  'scissors',
  'lizard',
  'spock',
];

export const CHOICES_BY_MODE: Record<GameMode, readonly Choice[]> = {
  classic: CLASSIC_CHOICES,
  extended: EXTENDED_CHOICES,
};

/** For each choice, the choices it beats. Single source of truth for rules. */
export const BEATS: Record<Choice, readonly Choice[]> = {
  rock: ['scissors', 'lizard'],
  paper: ['rock', 'spock'],
  scissors: ['paper', 'lizard'],
  lizard: ['paper', 'spock'],
  spock: ['rock', 'scissors'],
};

/** UI metadata per choice: Spanish labels, emoji and accessible names. */
export const CHOICE_META: Record<Choice, { label: string; emoji: string; actionLabel: string }> = {
  rock: { label: 'Piedra', emoji: '✊', actionLabel: 'Elegir piedra' },
  paper: { label: 'Papel', emoji: '✋', actionLabel: 'Elegir papel' },
  scissors: { label: 'Tijera', emoji: '✌️', actionLabel: 'Elegir tijera' },
  lizard: { label: 'Lagarto', emoji: '🦎', actionLabel: 'Elegir lagarto' },
  spock: { label: 'Spock', emoji: '🖖', actionLabel: 'Elegir Spock' },
};
/** Minimum delay (ms) before the machine reveals its pick. */
export const MACHINE_REVEAL_DELAY_MS = 1200;

/** Points awarded per won round. */
export const POINTS_PER_WIN = 1;

/** Points subtracted per lost round. Score may go negative. */
export const POINTS_PER_LOSS = 1;

/** AsyncStorage key for local score persistence. */
export const STORAGE_KEY_SCORES = '@bbva-rps:scores';

/** AsyncStorage key for zustand store persistence. */
export const STORAGE_KEY_GAME_STORE = '@bbva-rps:game-store';

/** Vibration duration (ms) on web when the player loses. */
export const LOSE_VIBRATION_MS = 200;
