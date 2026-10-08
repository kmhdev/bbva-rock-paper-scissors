import { LOSE_VIBRATION_MS } from '../constants/game.constants';

export type VibrationResult = 'web' | 'haptics' | 'none';

/**
 * Bonus: vibra cuando el jugador pierde.
 * En web PWA usa navigator.vibrate (Android/Chrome); iOS lo ignora sin fallar.
 * En nativo usa expo-haptics, importado en diferido para no cargar
 * dependencias en los tests unitarios.
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
