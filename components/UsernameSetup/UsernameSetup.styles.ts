import { StyleSheet } from 'react-native';
import { WEB_CONTENT_MAX_WIDTH } from '../../constants/layout.constants';
import type { ThemeColors } from '../../types/types';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    card: {
      width: '100%',
      maxWidth: WEB_CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      marginHorizontal: 'auto',
      gap: 10,
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    title: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
    },
    description: {
      color: theme.textMuted,
      fontSize: 14,
      textAlign: 'center',
    },
    fieldLabel: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '600',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
    },
    inputRowError: {
      borderColor: theme.danger,
    },
    atSign: {
      color: theme.textMuted,
      fontSize: 16,
      fontWeight: '700',
    },
    input: {
      flex: 1,
      paddingVertical: 12,
      color: theme.text,
      fontSize: 16,
    },
    rules: {
      color: theme.textMuted,
      fontSize: 12,
    },
    error: {
      color: theme.danger,
      fontSize: 14,
      textAlign: 'center',
    },
    lockNote: {
      color: theme.textMuted,
      fontSize: 13,
      textAlign: 'center',
    },
  });
};
