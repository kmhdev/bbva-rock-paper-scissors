import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import type { SegmentedToggleVariant } from '../../types/types';

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

// Pill deslizante: un único Animated.Value -> translateX sobre el ancho medido
// con onLayout (patrón Switch Selector adaptado a la Animated API nativa,
// sin dependencias extra).
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
