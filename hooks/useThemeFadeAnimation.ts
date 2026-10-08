import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';

const THEME_FADE_DURATION_MS = 180;

/** Fundido de salida, cambio de tema y fundido de entrada (portado de quiniela-native). */
export function useThemeFadeAnimation(toggleTheme: () => void) {
  const fade = useRef(new Animated.Value(1)).current;

  const handleThemeChange = useCallback(() => {
    Animated.sequence([
      Animated.timing(fade, {
        toValue: 0,
        duration: THEME_FADE_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: THEME_FADE_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start(() => {
      toggleTheme();
    });
  }, [fade, toggleTheme]);

  return { fade, handleThemeChange };
}
