import { Animated, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useIsMobilePlatform } from '../../hooks/useIsMobilePlatform';
import type { ToolsButtonProps } from '../../types/types';
import { useToolsButtonAnimations } from './ToolsButton.helpers';
import {
  getMobileActionsAnimatedStyle,
  getStyles,
  getToolsButtonScaleStyle,
} from './ToolsButton.styles';

export default function ToolsButton({ onPress, visible = true }: ToolsButtonProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const isMobile = useIsMobilePlatform();
  const { mobileActionsFade, sidebarButtonAnim, handlePress } = useToolsButtonAnimations(
    visible,
    onPress,
  );

  if (!isMobile || !visible) return null;

  return (
    <Animated.View
      style={[
        styles.mobileActions,
        { bottom: Math.max(insets.bottom + 16, 20) },
        getMobileActionsAnimatedStyle(mobileActionsFade),
      ]}
      pointerEvents="box-none"
    >
      <Animated.View style={getToolsButtonScaleStyle(sidebarButtonAnim)}>
        <Pressable
          accessibilityLabel="Abrir menú"
          accessibilityRole="button"
          onPress={handlePress}
          style={styles.mobileSidebarButton}
        >
          <MaterialCommunityIcons name="menu" size={18} color={theme.background} />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
