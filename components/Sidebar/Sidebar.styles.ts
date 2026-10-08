import { Animated, Dimensions, Easing, PanResponder, StyleSheet } from 'react-native';
import type { ThemeColors } from '../../types/types';

const { width } = Dimensions.get('window');

export const SIDEBAR_WIDTH = Math.round(width * 0.82);

export const getSidebarStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    sidebar: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: SIDEBAR_WIDTH,
      backgroundColor: theme.background,
      shadowColor: theme.name === 'dark' ? '#000' : '#aaa',
      shadowOffset: { width: 4, height: 0 },
      shadowOpacity: 0.18,
      shadowRadius: 18,
      elevation: 20,
      zIndex: 2000,
      flexDirection: 'row',
      borderTopRightRadius: 24,
      borderBottomRightRadius: 24,
      overflow: 'hidden',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      zIndex: 1999,
    },
    overlayPressable: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingTop: 48,
      paddingHorizontal: 28,
      backgroundColor: 'transparent',
      justifyContent: 'flex-start',
    },
    menu: {
      marginTop: 24,
      marginBottom: 24,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 22,
    },
    menuIcon: {
      marginRight: 20,
      color: theme.text,
      opacity: 0.85,
    },
    liveMenuIcon: {
      marginRight: 20,
      color: theme.accent,
    },
    menuText: {
      fontSize: 22,
      color: theme.text,
      fontWeight: '500',
    },
    liveMenuText: {
      fontSize: 22,
      color: theme.accent,
      fontWeight: '700',
    },
    authError: {
      fontSize: 14,
      color: theme.danger,
      marginBottom: 8,
    },
  });

export const OVERLAY_MAX_OPACITY = 0.32;
export const OVERLAY_ANIMATION_DURATION = 180;
export const SIDEBAR_OPEN_DURATION = 350;
export const SIDEBAR_CLOSE_DURATION = 250;
export const SIDEBAR_DRAG_CLOSE_THRESHOLD = 0.25;

export const createSlideAnim = (sidebarWidth: number) => new Animated.Value(-sidebarWidth);

export const createPanX = () => new Animated.Value(0);

export const startSidebarSlideAnimation = (
  slideAnim: Animated.Value,
  open: boolean,
  sidebarWidth: number,
): void => {
  Animated.timing(slideAnim, {
    toValue: open ? 0 : -sidebarWidth,
    duration: open ? SIDEBAR_OPEN_DURATION : SIDEBAR_CLOSE_DURATION,
    easing: open ? Easing.out(Easing.exp) : Easing.in(Easing.exp),
    useNativeDriver: false,
  }).start();
};

export const startOverlayFade = (overlayAnim: Animated.Value, open: boolean): void => {
  Animated.timing(overlayAnim, {
    toValue: open ? 1 : 0,
    duration: OVERLAY_ANIMATION_DURATION,
    useNativeDriver: true,
  }).start();
};

export const getOverlayAnimatedStyle = (overlayAnim: Animated.Value) => ({
  opacity: overlayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, OVERLAY_MAX_OPACITY],
  }),
});

export const getThemeFadeStyle = (themeFade: Animated.Value) => ({
  opacity: themeFade,
});

export const getSidebarPanResponder = (
  panX: Animated.Value,
  slideAnim: Animated.Value,
  sidebarWidth: number,
  onClose: () => void,
) =>
  PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dx < -10,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        panX.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -sidebarWidth * SIDEBAR_DRAG_CLOSE_THRESHOLD) {
        Animated.timing(slideAnim, {
          toValue: -sidebarWidth,
          duration: SIDEBAR_CLOSE_DURATION,
          useNativeDriver: false,
        }).start(() => {
          panX.setValue(0);
          onClose();
        });
      } else {
        Animated.spring(panX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });
