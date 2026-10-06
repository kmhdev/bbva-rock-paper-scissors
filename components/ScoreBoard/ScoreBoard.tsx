import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getStyles } from './ScoreBoard.styles';

interface ScoreBoardProps {
  playerName: string;
  score: number;
}

/** Header card showing who is playing and their current points. */
export default function ScoreBoard({ playerName, score }: ScoreBoardProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.scoreBoard} accessibilityRole="header">
      <Text style={styles.playerName}>Hola, {playerName}</Text>
      <Text style={styles.playerScore}>Puntos: {score}</Text>
    </View>
  );
}
