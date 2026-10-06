import { Image, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { AppLogoProps } from '../../types/types';
import { getLogoImageStyle, getStyles, resolveLogoSize } from './AppLogo.styles';

const LOGO_BLACK_SOURCE = require('../../assets/logo-black.png');
const LOGO_WHITE_SOURCE = require('../../assets/logo-white.png');

/**
 * Emblema piedra-papel-tijera (de logoinsp.png), sin fondo ni encuadrado:
 * tinta negra en tema claro y blanca en tema oscuro para ser visible en ambos.
 */
export default function AppLogo({
  size,
  accessibilityLabel = 'Logo de BBVA Rock Paper Scissors',
  testID,
}: AppLogoProps) {
  const { theme } = useTheme();
  const styles = getStyles();
  const logoSize = resolveLogoSize(size);
  const source = theme.name === 'dark' ? LOGO_WHITE_SOURCE : LOGO_BLACK_SOURCE;

  return (
    <View
      style={styles.logoWrap}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Image
        source={source}
        style={[styles.logoImage, getLogoImageStyle(logoSize)]}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}
