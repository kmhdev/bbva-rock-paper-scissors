import { StyleSheet } from 'react-native';
import { WEB_CONTENT_MAX_WIDTH } from '../../constants/layout.constants';
import type { ThemeColors } from '../../types/types';

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
    homeTitle: {
      color: theme.text,
      fontSize: 26,
      fontWeight: '800',
      textAlign: 'center',
    },
    heroLogo: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    greeting: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
    },
    formError: {
      color: theme.danger,
      fontSize: 14,
    },
    authBox: {
      width: '100%',
      maxWidth: WEB_CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      marginHorizontal: 'auto',
      gap: 8,
    },
    authError: {
      color: theme.danger,
      fontSize: 14,
      textAlign: 'center',
    },
  });
};
