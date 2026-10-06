export type ClassicChoice = 'rock' | 'paper' | 'scissors';

export type ExtendedChoice = ClassicChoice | 'lizard' | 'spock';

export type Choice = ClassicChoice | ExtendedChoice;

export type GameMode = 'classic' | 'extended';

export type RoundOutcome = 'win' | 'lose' | 'draw';

export type ThemeName = 'light' | 'dark';

export interface ThemeColors {
  name: ThemeName;
  background: string;
  card: string;
  text: string;
  textMuted: string;
  accent: string;
  danger: string;
  success: string;
  border: string;
  secondary?: string;
  textSecondary?: string;
  scorePanel?: string;
  successBg?: string;
  errorBg?: string;
}

export interface PlayerScore {
  username: string;
  score: number;
}

export interface ToolsButtonProps {
  onPress: () => void;
  visible?: boolean;
}

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
}
