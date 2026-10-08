import { View } from 'react-native';
import { useIsMobilePlatform } from '../../hooks/useIsMobilePlatform';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { getStyles } from './TopBar.styles';

/**
 * Barra superior con el cambio de tema, solo en web de escritorio.
 * En móvil el tema se cambia desde el menú lateral.
 */
export default function TopBar() {
  const isMobile = useIsMobilePlatform();
  const styles = getStyles();

  if (isMobile) return null;

  return (
    <View style={styles.topBar}>
      <ThemeToggle />
    </View>
  );
}
