import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { WEB_CONTENT_MAX_WIDTH } from '../../constants/layout.constants';
import type { SegmentedToggleVariant, ThemeColors } from '../../types/types';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    wrapperFill: {
      width: '100%',
      maxWidth: WEB_CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      marginHorizontal: 'auto',
    },
    wrapperCompact: {
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    topLabel: {
      color: theme.textMuted,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    trackFill: {
      flexDirection: 'row',
      width: '100%',
      padding: SEGMENTED_TOGGLE_PADDING_FILL,
      borderRadius: 999,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      position: 'relative',
    },
    trackCompact: {
      flexDirection: 'row',
      alignItems: 'center',
      width: SEGMENTED_TOGGLE_WIDTH_COMPACT,
      height: SEGMENTED_TOGGLE_HEIGHT_COMPACT,
      padding: SEGMENTED_TOGGLE_PADDING_COMPACT,
      borderRadius: 999,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      position: 'relative',
    },
    trackDisabled: {
      opacity: 0.5,
    },
    pillFill: {
      position: 'absolute',
      top: SEGMENTED_TOGGLE_PADDING_FILL,
      bottom: SEGMENTED_TOGGLE_PADDING_FILL,
      left: SEGMENTED_TOGGLE_PADDING_FILL,
      borderRadius: 999,
      backgroundColor: theme.accent,
      shadowColor: '#000000',
      shadowOpacity: 0.18,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    pillCompact: {
      position: 'absolute',
      top: SEGMENTED_TOGGLE_PADDING_COMPACT,
      bottom: SEGMENTED_TOGGLE_PADDING_COMPACT,
      left: SEGMENTED_TOGGLE_PADDING_COMPACT,
      borderRadius: 999,
      backgroundColor: theme.accent,
      shadowColor: '#000000',
      shadowOpacity: 0.18,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    segmentFill: {
      flex: 1,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 6,
      gap: 6,
      zIndex: 1,
    },
    segmentCompact: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },
    segmentEmoji: {
      fontSize: 16,
    },
    labelFill: {
      fontSize: 14,
      fontWeight: '700',
    },
    labelCompact: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    labelActive: {
      color: '#ffffff',
    },
    labelInactive: {
      color: theme.textMuted,
    },
  });
};

// ---------------------------------------------------------------------------
// Helpers de animación (siempre después de StyleSheet.create, según AGENTS.md)
// Pill deslizante: un único Animated.Value -> translateX sobre el ancho medido
// con onLayout (patrón Switch Selector de https://motionary.dev/components/switch
// adaptado a la Animated API nativa, sin dependencias extra).
// ---------------------------------------------------------------------------

export const SEGMENTED_TOGGLE_PADDING_FILL = 4;

export const SEGMENTED_TOGGLE_PADDING_COMPACT = 3;

export const SEGMENTED_TOGGLE_WIDTH_COMPACT = 92;

export const SEGMENTED_TOGGLE_HEIGHT_COMPACT = 32;

export const SEGMENTED_TOGGLE_SPRING = {
  damping: 18,
  stiffness: 240,
  mass: 0.7,
} as const;

export function getSegmentedTogglePadding(variant: SegmentedToggleVariant): number {
  return variant === 'compact' ? SEGMENTED_TOGGLE_PADDING_COMPACT : SEGMENTED_TOGGLE_PADDING_FILL;
}

export function getSegmentWidth(
  trackWidth: number,
  optionsCount: number,
  variant: SegmentedToggleVariant,
): number {
  if (trackWidth <= 0 || optionsCount <= 0) return 0;
  return (trackWidth - getSegmentedTogglePadding(variant) * 2) / optionsCount;
}

export function useSegmentedToggleAnimation(
  activeIndex: number,
  optionsCount: number,
  variant: SegmentedToggleVariant,
) {
  const progress = useRef(new Animated.Value(activeIndex)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    Animated.spring(progress, {
      toValue: activeIndex,
      useNativeDriver: true,
      ...SEGMENTED_TOGGLE_SPRING,
    }).start();
  }, [activeIndex, progress]);

  const onTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const segmentWidth = getSegmentWidth(trackWidth, optionsCount, variant);
  const lastIndex = Math.max(optionsCount - 1, 1);

  const pillAnimatedStyle = {
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, lastIndex],
          outputRange: [0, segmentWidth * lastIndex],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, lastIndex / 2, lastIndex],
          outputRange: [1, 0.93, 1],
        }),
      },
    ],
  };

  return { onTrackLayout, segmentWidth, pillAnimatedStyle };
}
