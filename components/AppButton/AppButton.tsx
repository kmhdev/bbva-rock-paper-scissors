import { Pressable, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { AppButtonProps } from '../../types/types';
import { getStyles } from './AppButton.styles';

/**
 * Botón reutilizable con el accent del tema.
 * `variant="primary"` relleno con accent; `variant="ghostlight"` solo borde.
 */
export default function AppButton({
  title,
  onPress,
  accessibilityLabel,
  variant = 'primary',
  disabled = false,
  testID,
}: AppButtonProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const isGhostlight = variant === 'ghostlight';

  return (
    <Pressable
      style={[
        styles.button,
        isGhostlight ? styles.buttonGhostlight : styles.buttonPrimary,
        disabled && styles.buttonDisabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
    >
      <Text
        style={[
          styles.buttonLabel,
          isGhostlight ? styles.buttonLabelGhostlight : styles.buttonLabelPrimary,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
