import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import type { ThemeColors } from '../../types/types';
import {
  SIDEBAR_WIDTH,
  createPanX,
  createSlideAnim,
  getSidebarPanResponder,
  getSidebarStyles,
  startOverlayFade,
  startSidebarSlideAnimation,
} from './Sidebar.styles';

export function useSidebarLogic({
  open,
  onClose,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  theme: ThemeColors;
}) {
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(createSlideAnim(SIDEBAR_WIDTH)).current;
  const panX = useRef(createPanX()).current;

  useEffect(() => {
    if (open) {
      setShowOverlay(true);
      startOverlayFade(overlayAnim, true);
    } else {
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start(() => setShowOverlay(false));
    }
  }, [open, overlayAnim]);

  useEffect(() => {
    startSidebarSlideAnimation(slideAnim, open, SIDEBAR_WIDTH);
  }, [open, slideAnim]);

  const handleOverlayClose = () => {
    Animated.timing(overlayAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setShowOverlay(false));
    onClose();
  };

  const handleDragClose = () => {
    Animated.timing(overlayAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setShowOverlay(false);
      onClose();
    });
  };

  const panResponder = useRef(
    getSidebarPanResponder(panX, slideAnim, SIDEBAR_WIDTH, handleDragClose),
  ).current;

  const styles = getSidebarStyles(theme);
  const animatedLeft = Animated.add(slideAnim, panX);

  return {
    panResponder,
    styles,
    animatedLeft,
    showOverlay,
    overlayAnim,
    handleOverlayClose,
  };
}

export function useThemeFade(toggleTheme: () => void) {
  const [themeFade] = useState(new Animated.Value(1));

  const handleThemeChange = () => {
    Animated.sequence([
      Animated.timing(themeFade, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(themeFade, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      toggleTheme();
    });
  };

  return { themeFade, handleThemeChange };
}
