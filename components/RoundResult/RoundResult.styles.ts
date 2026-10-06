import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../types/types';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    roundResult: {
      width: '100%',
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.card,
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
