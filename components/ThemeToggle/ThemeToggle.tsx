import { Animated, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../context/ThemeContext';
import { getStyles } from './ThemeToggle.styles';
import { useThemeFadeAnimation } from './ThemeToggle.helpers';

/**
 * Botón de cambio de tema (portado de ToolbarWeb de quiniela-native): icono de
 * sol en modo oscuro y de luna en modo claro, con animación de fundido.
 */
export default function ThemeToggle() {
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = getStyles(theme);
  const { fade, handleThemeChange } = useThemeFadeAnimation(toggleTheme);

  return (
    <Animated.View style={{ opacity: fade }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cambiar tema"
        accessibilityState={{ checked: isDark }}
        onPress={handleThemeChange}
        style={({ pressed }) => [styles.themeToggle, pressed && styles.themeTogglePressed]}
      >
        <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={24} color={theme.accent} />
      </Pressable>
    </Animated.View>
  );
}
