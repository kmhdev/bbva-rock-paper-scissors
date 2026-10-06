import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../types/types';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    homeScreen: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    },
    topBar: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    homeTitle: {
      color: theme.text,
      fontSize: 26,
      fontWeight: '800',
      textAlign: 'center',
    },
    homeSubtitle: {
      color: theme.textMuted,
      fontSize: 16,
      textAlign: 'center',
    },
    nameInput: {
      width: '100%',
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      color: theme.text,
      fontSize: 16,
    },
    formError: {
      color: theme.danger,
      fontSize: 14,
    },
    startButton: {
      width: '100%',
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.accent,
      alignItems: 'center',
    },
    startButtonLabel: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    modeRow: {
      flexDirection: 'row',
      width: '100%',
      gap: 8,
    },
    modeOption: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: 'center',
    },
    modeOptionChecked: {
      borderColor: theme.accent,
    },
    modeOptionLabel: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    rankingLink: {
      color: theme.accent,
      fontSize: 15,
      fontWeight: '600',
    },
  });
};
