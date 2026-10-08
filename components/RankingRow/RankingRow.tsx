import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { RankingRowProps } from '../../types/types';
import { getPointsLabel, getStyles } from './RankingRow.styles';

/** Fila de ranking reutilizable: posición, jugador y mejor marca. */
export default function RankingRow({
  position,
  username,
  score,
  isCurrentUser = false,
}: RankingRowProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.rankingRow}>
      <View style={styles.mainLine}>
        <Text style={styles.position}>#{position}</Text>
        <Text style={styles.username}>
          {username}
          {isCurrentUser ? ' (tú)' : ''}
        </Text>
        <Text style={styles.score}>
          {score} {getPointsLabel(score)}
        </Text>
      </View>
    </View>
  );
}
