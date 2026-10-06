import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../types/types';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    rankingScreen: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 24,
      alignItems: 'center',
      gap: 12,
    },
    rankingTitle: {
      color: theme.text,
      fontSize: 24,
      fontWeight: '800',
    },
    rankingList: {
      width: '100%',
      gap: 8,
    },
    rankingEmpty: {
      color: theme.textMuted,
      fontSize: 16,
      textAlign: 'center',
    },
    rankingLoading: {
      color: theme.textMuted,
      fontSize: 16,
    },
    backLink: {
      color: theme.accent,
      fontSize: 15,
      fontWeight: '600',
    },
  });
};
