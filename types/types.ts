export type ClassicChoice = 'rock' | 'paper' | 'scissors';

export type ExtendedChoice = ClassicChoice | 'lizard' | 'spock';

export type Choice = ClassicChoice | ExtendedChoice;

export type GameMode = 'classic' | 'extended';

export type RoundOutcome = 'win' | 'lose' | 'draw';

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textMuted: string;
  accent: string;
  danger: string;
  success: string;
  border: string;
}

export interface PlayerScore {
  username: string;
  score: number;
}
