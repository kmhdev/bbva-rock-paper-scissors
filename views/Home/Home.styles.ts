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
    topBar: {
      position: 'absolute',
      top: 24,
      right: 24,
      zIndex: 10,
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
      maxWidth: WEB_CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      marginHorizontal: 'auto',
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      color: theme.text,
      fontSize: 16,
    },
    formError: {
      color: theme.danger,
      fontSize: 14,
    },
  });
};
