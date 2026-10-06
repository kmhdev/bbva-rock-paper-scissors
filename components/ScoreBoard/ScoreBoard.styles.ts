import { StyleSheet } from 'react-native';
import { WEB_CONTENT_MAX_WIDTH } from '../../constants/layout.constants';
import type { ThemeColors } from '../../types/types';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    scoreBoard: {
      width: '100%',
      maxWidth: WEB_CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      marginHorizontal: 'auto',
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 4,
    },
    playerName: {
      color: theme.text,
      fontSize: 20,
      fontWeight: '700',
    },
    playerScore: {
      color: theme.textMuted,
      fontSize: 16,
    },
  });
};
