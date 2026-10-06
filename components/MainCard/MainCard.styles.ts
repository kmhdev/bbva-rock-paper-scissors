import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../types/types';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    cardOuter: {
      width: '100%',
      maxWidth: 420,
      alignSelf: 'center',
      marginHorizontal: 'auto',
    },
    card: {
      width: '100%',
      backgroundColor: theme.card,
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 16,
      minHeight: 96,
      gap: 16,
      alignItems: 'center',
    },
  });
};
