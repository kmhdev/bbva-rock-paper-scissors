import { Animated, Easing, StyleSheet } from 'react-native';
import type { ThemeColors } from '../../types/types';

export const getStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    mobileActions: {
      position: 'absolute',
      right: 20,
      alignItems: 'center',
      gap: 12,
      zIndex: 100,
    },
    mobileSidebarButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accent,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 8,
    },
    buttonPressed: {
      opacity: 0.7,
    },
  });

export const MOBILE_ACTIONS_FADE_DURATION = 280;
export const TOOLS_BUTTON_PRESS_IN_DURATION = 90;
export const TOOLS_BUTTON_PRESS_OUT_DURATION = 120;
export const TOOLS_BUTTON_PRESSED_VALUE = 0.25;

export const startMobileActionsFadeIn = (fade: Animated.Value): void => {
  fade.stopAnimation();
  Animated.timing(fade, {
    toValue: 1,
    duration: MOBILE_ACTIONS_FADE_DURATION,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
};

export const resetMobileActionsFade = (fade: Animated.Value): void => {
  fade.stopAnimation();
  fade.setValue(0);
};

export const getMobileActionsAnimatedStyle = (fade: Animated.Value) => ({
  opacity: fade,
  transform: [
    {
      translateY: fade.interpolate({
        inputRange: [0, 1],
        outputRange: [8, 0],
      }),
    },
  ],
});

export const getToolsButtonScaleStyle = (pressAnim: Animated.Value) => ({
  opacity: pressAnim,
  transform: [
    {
      scale: pressAnim.interpolate({
        inputRange: [TOOLS_BUTTON_PRESSED_VALUE, 1],
        outputRange: [0.88, 1],
      }),
    },
  ],
});

export const startToolsButtonPressAnimation = (
  pressAnim: Animated.Value,
  onFinished: () => void,
): void => {
  pressAnim.stopAnimation();
  Animated.sequence([
    Animated.timing(pressAnim, {
      toValue: TOOLS_BUTTON_PRESSED_VALUE,
      duration: TOOLS_BUTTON_PRESS_IN_DURATION,
      useNativeDriver: true,
    }),
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: TOOLS_BUTTON_PRESS_OUT_DURATION,
      useNativeDriver: true,
    }),
  ]).start(({ finished }) => {
    if (finished) onFinished();
  });
};
