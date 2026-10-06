import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../types/types';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    choiceButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderRadius: 16,
      backgroundColor: theme.background,
      borderWidth: 2,
      borderColor: theme.border,
      gap: 8,
    },
    choiceButtonSelected: {
      borderColor: theme.accent,
    },
    choiceEmoji: {
      fontSize: 40,
    },
    choiceLabel: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });
};
