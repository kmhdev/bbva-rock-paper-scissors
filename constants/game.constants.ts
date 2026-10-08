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

/** Para cada jugada, las jugadas a las que gana. Única fuente de verdad de las reglas. */
export const BEATS: Record<Choice, readonly Choice[]> = {
  rock: ['scissors', 'lizard'],
  paper: ['rock', 'spock'],
  scissors: ['paper', 'lizard'],
  lizard: ['paper', 'spock'],
  spock: ['rock', 'scissors'],
};

/** Metadatos de IU por jugada: etiquetas en español, emoji y nombres accesibles. */
export const CHOICE_META: Record<Choice, { label: string; emoji: string; actionLabel: string }> = {
  rock: { label: 'Piedra', emoji: '✊', actionLabel: 'Elegir piedra' },
  paper: { label: 'Papel', emoji: '✋', actionLabel: 'Elegir papel' },
  scissors: { label: 'Tijera', emoji: '✌️', actionLabel: 'Elegir tijera' },
  lizard: { label: 'Lagarto', emoji: '🦎', actionLabel: 'Elegir lagarto' },
  spock: { label: 'Spock', emoji: '🖖', actionLabel: 'Elegir Spock' },
};
/** Retardo mínimo (ms) antes de que la máquina muestre su jugada. */
export const MACHINE_REVEAL_DELAY_MS = 1200;

/** Puntos que se suman por ronda ganada. */
export const POINTS_PER_WIN = 1;

/** Puntos que se restan por ronda perdida. La puntuación puede quedar en negativo. */
export const POINTS_PER_LOSS = 1;

/** Clave de AsyncStorage para guardar las puntuaciones en local. */
export const STORAGE_KEY_SCORES = '@bbva-rps:scores';

/** Clave de AsyncStorage para persistir el store de zustand. */
export const STORAGE_KEY_GAME_STORE = '@bbva-rps:game-store';

/** Duración de la vibración (ms) en web cuando el jugador pierde. */
export const LOSE_VIBRATION_MS = 200;
