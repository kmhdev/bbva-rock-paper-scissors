import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getStyles } from './MainCard.styles';

interface MainCardProps {
  children: ReactNode;
}

/** Contenedor principal tipo MatchCard de quiniela-native, con colores tematizados. */
export default function MainCard({ children }: MainCardProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.cardOuter}>
      <View style={styles.card}>{children}</View>
    </View>
  );
}
