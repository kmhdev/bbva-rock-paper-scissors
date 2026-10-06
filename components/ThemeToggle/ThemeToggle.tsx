import { Animated, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../context/ThemeContext';
import { getStyles } from './ThemeToggle.styles';
import { useThemeFadeAnimation } from './ThemeToggle.helpers';

/**
 * Theme toggle button (ported from quiniela-native ToolbarWeb): sun icon in
 * dark mode, moon icon in light mode, with a fade animation on switch.
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
