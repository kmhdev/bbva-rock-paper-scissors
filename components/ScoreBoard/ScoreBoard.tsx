import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getStyles } from './ScoreBoard.styles';

interface ScoreBoardProps {
  score: number;
}

/** Header card showing the current points. */
export default function ScoreBoard({ score }: ScoreBoardProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.scoreBoard} accessibilityRole="header">
      <Text style={styles.playerScore}>Puntos: {score}</Text>
    </View>
  );
}
