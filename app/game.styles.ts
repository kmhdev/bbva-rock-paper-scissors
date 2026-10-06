import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../types/types';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    gameScreen: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 24,
      alignItems: 'center',
      gap: 16,
    },
    topBar: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    choicesRow: {
      flexDirection: 'row',
      width: '100%',
      gap: 8,
    },
    choicesRowWrapped: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%',
      gap: 8,
    },
    smartRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    smartLabel: {
      color: theme.textMuted,
      fontSize: 14,
    },
    smartToggle: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    smartToggleOn: {
      borderColor: theme.accent,
    },
    smartToggleLabel: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    exitButton: {
      width: '100%',
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    exitButtonLabel: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });
};
