import { Pressable, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { AppButtonProps } from '../../types/types';
import { getButtonContainerStyle, getButtonLabelStyle, getStyles } from './AppButton.styles';

/**
 * Botón reutilizable con el accent del tema.
 * `variant="primary"` relleno con accent; `variant="secondary"` relleno con
 * `#f0c446`; `variant="ghostlight"` solo borde.
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

  return (
    <Pressable
      style={[
        styles.button,
        getButtonContainerStyle(styles, variant),
        disabled && styles.buttonDisabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
    >
      <Text style={[styles.buttonLabel, getButtonLabelStyle(styles, variant)]}>{title}</Text>
    </Pressable>
  );
}
