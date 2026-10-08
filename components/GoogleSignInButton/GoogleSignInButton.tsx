import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import type { GoogleSignInButtonProps } from '../../types/types';
import { GOOGLE_LOGO_PATHS } from './GoogleSignInButton.helpers';
import { getStyles } from './GoogleSignInButton.styles';

/**
 * Botón "Continuar con Google" (portado del AuthPanel de espanografia).
 * Usa el logo "G" oficial a 4 colores con los paths y fills exactos de
 * espanografia: #4285F4, #34A853, #FBBC05, #EA4335.
 */
export default function GoogleSignInButton({
  onPress,
  loading = false,
  disabled = false,
  testID,
}: GoogleSignInButtonProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={[styles.button, isDisabled && styles.buttonDisabled]}
      accessibilityRole="button"
      accessibilityLabel="Continuar con Google"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#1f1f1f" />
      ) : (
        <View style={styles.content}>
          <Svg width={20} height={20} viewBox="0 0 24 24" testID="google-logo">
            {GOOGLE_LOGO_PATHS.map((path) => (
              <Path key={path.fill} d={path.d} fill={path.fill} />
            ))}
          </Svg>
          <Text style={styles.label}>Continuar con Google</Text>
        </View>
      )}
    </Pressable>
  );
}
