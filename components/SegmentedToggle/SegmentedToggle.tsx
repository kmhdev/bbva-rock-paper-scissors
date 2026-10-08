import { Animated, Pressable, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { SegmentedToggleProps } from '../../types/types';
import { getStyles } from './SegmentedToggle.styles';
import { useSegmentedToggleAnimation } from './SegmentedToggle.helpers';

/**
 * Toggle segmentado reutilizable con pill deslizante animada (spring).
 * `variant="fill"` ocupa todo el ancho (modo de juego);
 * `variant="compact"` es fijo y pequeño (hard mode ON/OFF).
 */
export default function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
  variant = 'fill',
  disabled = false,
  topLabel,
  trackAccessibilityLabel,
}: SegmentedToggleProps<T>) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const activeIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );
  const { onTrackLayout, segmentWidth, pillAnimatedStyle } = useSegmentedToggleAnimation(
    activeIndex,
    options.length,
    variant,
  );

  const isCompact = variant === 'compact';

  return (
    <View style={isCompact ? styles.wrapperCompact : styles.wrapperFill}>
      {topLabel !== undefined && <Text style={styles.topLabel}>{topLabel}</Text>}
      <View
        style={[
          isCompact ? styles.trackCompact : styles.trackFill,
          disabled && styles.trackDisabled,
        ]}
        onLayout={onTrackLayout}
        accessibilityRole="tablist"
        accessibilityLabel={trackAccessibilityLabel}
      >
        {segmentWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              isCompact ? styles.pillCompact : styles.pillFill,
              { width: segmentWidth },
              pillAnimatedStyle,
            ]}
          />
        ) : null}
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled }}
              accessibilityLabel={option.accessibilityLabel ?? option.label}
              disabled={disabled}
              onPress={() => onChange(option.value)}
              style={isCompact ? styles.segmentCompact : styles.segmentFill}
            >
              {option.emoji !== undefined && (
                <Text style={styles.segmentEmoji}>{option.emoji}</Text>
              )}
              <Text
                style={[
                  isCompact ? styles.labelCompact : styles.labelFill,
                  selected ? styles.labelActive : styles.labelInactive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
