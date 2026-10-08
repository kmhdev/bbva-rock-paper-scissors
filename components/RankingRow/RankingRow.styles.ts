import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../types/types';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    rankingRow: {
      width: '100%',
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 8,
    },
    mainLine: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    position: {
      color: theme.accent,
      fontSize: 16,
      fontWeight: '700',
      minWidth: 32,
    },
    username: {
      flex: 1,
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
    score: {
      color: theme.textMuted,
      fontSize: 16,
    },
  });
};
