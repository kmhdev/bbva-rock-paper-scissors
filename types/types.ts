import type { Session, User } from '@supabase/supabase-js';

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

/**
 * Comparativa local vs online por jugador para el ranking.
 * `null` significa que ese origen no tiene marca registrada.
 */
export interface MergedScoreRow {
  username: string;
  localScore: number | null;
  remoteScore: number | null;
  best: number;
}

export interface RankingRowProps {
  position: number;
  username: string;
  score: number;
}

export interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}

/** Claimed public username (ported from espanografia profiles). Immutable. */
export interface UserProfile {
  user_id: string;
  username: string;
  created_at?: string;
}

/** Estado de auth con Google vía Supabase (portado de espanografia). */
export interface SupabaseAuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  requiresUsername: boolean;
  isClaimingUsername: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  isSigningIn: boolean;
  error: string;
  claimUsername: (username: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export interface UsernameSetupProps {
  error: string;
  isSaving: boolean;
  initialUsername?: string;
  onClaimUsername: (username: string) => Promise<void> | void;
  onSignOut?: () => Promise<void> | void;
  description?: string;
  submitTitle?: string;
  submitAccessibilityLabel?: string;
  secondaryTitle?: string;
  secondaryAccessibilityLabel?: string;
  inputAccessibilityLabel?: string;
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

export type AppButtonVariant = 'primary' | 'secondary' | 'ghostlight';

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
