import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { Choice, RoundOutcome } from '../../types/types';
import {
  formatMachinePick,
  formatPlayerPick,
  getOutcomeMessage,
  isThinkingPlaceholder,
  shouldShowOutcome,
} from './RoundResult.helpers';
import { getStyles, resolveOutcomeStyle } from './RoundResult.styles';

interface RoundResultProps {
  playerPick: Choice | null;
  machinePick: Choice | null;
  thinking: boolean;
  outcome: RoundOutcome | null;
}

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

  const outcomeStyle = resolveOutcomeStyle(styles, outcome);

  return (
    <View style={styles.roundResult}>
      <Text style={styles.picks}>{formatPlayerPick(playerPick)}</Text>
      {isThinkingPlaceholder(thinking, machinePick) ? (
        <Text style={styles.thinking}>La máquina está pensando…</Text>
      ) : (
        machinePick !== null && <Text style={styles.picks}>{formatMachinePick(machinePick)}</Text>
      )}
      {shouldShowOutcome(thinking, outcome) && outcome !== null && (
        <Text style={outcomeStyle}>{getOutcomeMessage(outcome)}</Text>
      )}
    </View>
  );
}
