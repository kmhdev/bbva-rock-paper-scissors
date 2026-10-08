import { Text, View } from 'react-native';
import { CHOICE_META } from '../../constants/game.constants';
import { useTheme } from '../../context/ThemeContext';
import type { Choice, RoundOutcome } from '../../types/types';
import { getStyles } from './RoundResult.styles';

interface RoundResultProps {
  playerPick: Choice | null;
  machinePick: Choice | null;
  thinking: boolean;
  outcome: RoundOutcome | null;
}

const OUTCOME_MESSAGE: Record<RoundOutcome, string> = {
  win: '¡Has ganado! +1 punto',
  lose: 'Has perdido -1 punto',
  draw: 'Empate',
};

/** Muestra la jugada del jugador, la de la máquina (tras su retardo) y el veredicto. */
export default function RoundResult({
  playerPick,
  machinePick,
  thinking,
  outcome,
}: RoundResultProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  if (playerPick === null) {
    return (
      <View style={styles.roundResult}>
        <Text style={styles.thinking}>Elige tu jugada para empezar la ronda.</Text>
      </View>
    );
  }

  const outcomeStyle =
    outcome === 'win'
      ? styles.outcomeWin
      : outcome === 'lose'
        ? styles.outcomeLose
        : styles.outcomeDraw;

  return (
    <View style={styles.roundResult}>
      <Text style={styles.picks}>
        Tú: {CHOICE_META[playerPick].emoji} {CHOICE_META[playerPick].label}
      </Text>
      {thinking || machinePick === null ? (
        <Text style={styles.thinking}>La máquina está pensando…</Text>
      ) : (
        <Text style={styles.picks}>
          Máquina: {CHOICE_META[machinePick].emoji} {CHOICE_META[machinePick].label}
        </Text>
      )}
      {!thinking && outcome !== null && (
        <Text style={outcomeStyle}>{OUTCOME_MESSAGE[outcome]}</Text>
      )}
    </View>
  );
}
