import { StyleSheet } from 'react-native';
import { WEB_CONTENT_MAX_WIDTH } from '../../constants/layout.constants';
import type { AppButtonVariant, ThemeColors } from '../../types/types';

export const getStyles = (theme: ThemeColors) => {
  const secondaryBackground = theme.secondary ?? '#f0c446';
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
    buttonSecondary: {
      backgroundColor: secondaryBackground,
      borderColor: secondaryBackground,
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
    buttonLabelSecondary: {
      color: '#000000',
    },
    buttonLabelGhostlight: {
      color: theme.text,
    },
  });
};

type AppButtonStyleSheets = ReturnType<typeof getStyles>;

export function getButtonContainerStyle(styles: AppButtonStyleSheets, variant: AppButtonVariant) {
  if (variant === 'ghostlight') {
    return styles.buttonGhostlight;
  }
  if (variant === 'secondary') {
    return styles.buttonSecondary;
  }
  return styles.buttonPrimary;
}

export function getButtonLabelStyle(styles: AppButtonStyleSheets, variant: AppButtonVariant) {
  if (variant === 'ghostlight') {
    return styles.buttonLabelGhostlight;
  }
  if (variant === 'secondary') {
    return styles.buttonLabelSecondary;
  }
  return styles.buttonLabelPrimary;
}
