import { Animated, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '../../context/NavigationContext';
import type { Screen } from '../../types/types';
import { useTheme } from '../../context/ThemeContext';
import { useIsMobilePlatform } from '../../hooks/useIsMobilePlatform';
import { useGameStore } from '../../store/appStore';
import type { SidebarProps } from '../../types/types';
import { useSidebarLogic, useThemeFade } from './Sidebar.helpers';
import { getOverlayAnimatedStyle } from './Sidebar.styles';

const MENU_ROUTES = [
  { screen: 'home' as Screen, label: 'Inicio', icon: 'home-outline' },
  { screen: 'game' as Screen, label: 'Juego', icon: 'game-controller-outline' },
  { screen: 'ranking' as Screen, label: 'Ranking', icon: 'trophy-outline' },
] as const;

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobilePlatform();
  const { screen, setScreen } = useNavigation();
  const playerName = useGameStore((state) => state.playerName);
  const { panResponder, styles, animatedLeft, showOverlay, overlayAnim, handleOverlayClose } =
    useSidebarLogic({ open, onClose, theme });
  const { themeFade, handleThemeChange } = useThemeFade(toggleTheme);

  if (!isMobile) return null;

  const displayName = playerName ?? 'Invitado';
  const displayHandle = `@${displayName.toLowerCase().replace(/\s+/g, '_')}`;

  return (
    <>
      {showOverlay && (
        <Animated.View style={[styles.overlay, getOverlayAnimatedStyle(overlayAnim)]}>
          <Pressable style={styles.overlayPressable} onPress={handleOverlayClose} />
        </Animated.View>
      )}
      <Animated.View
        aria-hidden={!open}
        testID="sidebar-panel"
        style={[styles.sidebar, { left: animatedLeft }]}
        {...panResponder.panHandlers}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'left']}>
          <View style={styles.content}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar} />
              <Text style={styles.username}>{displayName}</Text>
              <Text style={styles.userHandle}>{displayHandle}</Text>
            </View>
            <View style={styles.menu}>
              {MENU_ROUTES.map((item) => {
                const isActive = screen === item.screen;
                return (
                  <Pressable
                    key={item.screen}
                    style={styles.menuItem}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    onPress={() => {
                      setScreen(item.screen);
                      onClose();
                    }}
                  >
                    <Ionicons
                      name={item.icon}
                      size={24}
                      style={isActive ? styles.liveMenuIcon : styles.menuIcon}
                    />
                    <Text style={isActive ? styles.liveMenuText : styles.menuText}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.bottomArea}>
              <Animated.View style={[styles.themeRow, { opacity: themeFade }]}>
                <Pressable
                  style={styles.themeBtnMinimal}
                  accessibilityRole="button"
                  accessibilityLabel="Cambiar tema"
                  onPress={handleThemeChange}
                >
                  <Ionicons
                    name={theme.name === 'dark' ? 'sunny-outline' : 'moon-outline'}
                    size={28}
                    color={theme.accent}
                  />
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </>
  );
}
