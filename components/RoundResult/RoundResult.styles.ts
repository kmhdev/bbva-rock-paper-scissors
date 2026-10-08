import { StyleSheet } from 'react-native';
import { WEB_CONTENT_MAX_WIDTH } from '../../constants/layout.constants';
import type { RoundOutcome, ThemeColors } from '../../types/types';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    roundResult: {
      width: '100%',
      maxWidth: WEB_CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      marginHorizontal: 'auto',
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 6,
    },
    picks: {
      color: theme.text,
      fontSize: 16,
    },
    thinking: {
      color: theme.textMuted,
      fontSize: 16,
      fontStyle: 'italic',
    },
    outcomeWin: {
      color: theme.success,
      fontSize: 18,
      fontWeight: '700',
    },
    outcomeLose: {
      color: theme.danger,
      fontSize: 18,
      fontWeight: '700',
    },
    outcomeDraw: {
      color: theme.textMuted,
      fontSize: 18,
      fontWeight: '700',
    },
  });
};

type RoundResultStyles = ReturnType<typeof getStyles>;

/** Estilo del veredicto según el resultado de la ronda. */
export function resolveOutcomeStyle(styles: RoundResultStyles, outcome: RoundOutcome | null) {
  if (outcome === 'win') return styles.outcomeWin;
  if (outcome === 'lose') return styles.outcomeLose;
  return styles.outcomeDraw;
}
