import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getStyles } from './RankingRow.styles';

interface RankingRowProps {
  position: number;
  username: string;
  score: number;
}

/** One reusable ranking row: position, player name and best score. */
export default function RankingRow({ position, username, score }: RankingRowProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.rankingRow}>
      <Text style={styles.position}>#{position}</Text>
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.score}>
        {score} {score === 1 ? 'pto' : 'pts'}
      </Text>
    </View>
  );
}
