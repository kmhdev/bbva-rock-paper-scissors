import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { RankingRowProps } from '../../types/types';
import { getStyles } from './RankingRow.styles';

/** Fila de ranking reutilizable: posición, jugador y mejor marca. */
export default function RankingRow({ position, username, score }: RankingRowProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.rankingRow}>
      <View style={styles.mainLine}>
        <Text style={styles.position}>#{position}</Text>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.score}>
          {score} {score === 1 ? 'pto' : 'pts'}
        </Text>
      </View>
    </View>
  );
}
