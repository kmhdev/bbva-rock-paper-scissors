import { StyleSheet } from 'react-native';
import { WEB_CONTENT_MAX_WIDTH } from '../../constants/layout.constants';
import type { ThemeColors } from '../../types/types';

export const getStyles = (theme: ThemeColors) => {
  return StyleSheet.create({
    gameScreen: {
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
    choicesRow: {
      flexDirection: 'row',
      width: '100%',
      maxWidth: WEB_CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      marginHorizontal: 'auto',
      gap: 8,
    },
    choicesRowWrapped: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '100%',
      maxWidth: WEB_CONTENT_MAX_WIDTH,
      alignSelf: 'center',
      marginHorizontal: 'auto',
      gap: 8,
    },
  });
};
