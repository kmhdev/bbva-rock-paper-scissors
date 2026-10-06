import { StyleSheet } from 'react-native';
import { WEB_CONTENT_MAX_WIDTH } from '../constants/layout.constants';
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
    topBar: {
      width: '100%',
      maxWidth: WEB_CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      marginHorizontal: 'auto',
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    rankingTitle: {
      color: theme.text,
      fontSize: 24,
      fontWeight: '800',
    },
    rankingList: {
      width: '100%',
      maxWidth: WEB_CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      marginHorizontal: 'auto',
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
