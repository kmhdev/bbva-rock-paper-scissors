import { useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import {
  resetMobileActionsFade,
  startMobileActionsFadeIn,
  startToolsButtonPressAnimation,
} from './ToolsButton.styles';

export function useToolsButtonAnimations(visible: boolean, onPress: () => void) {
  const mobileActionsFade = useRef(new Animated.Value(0)).current;
  const sidebarButtonAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      resetMobileActionsFade(mobileActionsFade);
      return;
    }
    startMobileActionsFadeIn(mobileActionsFade);
  }, [mobileActionsFade, visible]);

  const handlePress = useCallback(() => {
    startToolsButtonPressAnimation(sidebarButtonAnim, onPress);
  }, [sidebarButtonAnim, onPress]);

  return { mobileActionsFade, sidebarButtonAnim, handlePress };
}
