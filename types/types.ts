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

export interface SegmentedToggleOption<T extends string> {
  value: T;
  label: string;
  emoji?: string;
  accessibilityLabel?: string;
}

export type SegmentedToggleVariant = 'fill' | 'compact';

export interface SegmentedToggleProps<T extends string> {
  value: T;
  options: readonly SegmentedToggleOption<T>[];
  onChange: (value: T) => void;
  variant?: SegmentedToggleVariant;
  disabled?: boolean;
  topLabel?: string;
  trackAccessibilityLabel?: string;
}

export type Screen = 'home' | 'game' | 'ranking';

export type AppButtonVariant = 'primary' | 'ghostlight';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: AppButtonVariant;
  disabled?: boolean;
  testID?: string;
}

export interface NavigationContextValue {
  screen: Screen;
  setScreen: (screen: Screen) => void;
}

export interface AppLogoProps {
  size?: number;
  accessibilityLabel?: string;
  testID?: string;
}
