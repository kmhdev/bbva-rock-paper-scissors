import { StyleSheet } from 'react-native';
import { WEB_CONTENT_MAX_WIDTH } from '../../constants/layout.constants';
import type { ThemeColors } from '../../types/types';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    button: {
      width: '100%',
      maxWidth: WEB_CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      marginHorizontal: 'auto',
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    buttonPrimary: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    buttonGhostlight: {
      backgroundColor: 'transparent',
      borderColor: theme.border,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonLabel: {
      fontSize: 16,
      fontWeight: '700',
    },
    buttonLabelPrimary: {
      color: '#ffffff',
    },
    buttonLabelGhostlight: {
      color: theme.text,
    },
  });
};
