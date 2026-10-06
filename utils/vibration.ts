import { LOSE_VIBRATION_MS } from '../constants/game.constants';

export type VibrationResult = 'web' | 'haptics' | 'none';

/**
 * Bonus: vibrate when the player loses.
 * Web PWA uses navigator.vibrate (Android/Chrome); iOS ignores it gracefully.
 * Native uses expo-haptics, lazily imported so unit tests stay dependency-free.
 */
export async function vibrateOnLoss(): Promise<VibrationResult> {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(LOSE_VIBRATION_MS);
      return 'web';
    }
  } catch {
    return 'none';
  }

  try {
    const Haptics = await import('expo-haptics');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    return 'haptics';
  } catch {
    return 'none';
  }
}
