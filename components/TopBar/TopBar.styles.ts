import { StyleSheet } from 'react-native';

export const getStyles = () =>
  StyleSheet.create({
    topBar: {
      position: 'absolute',
      top: 24,
      right: 24,
      zIndex: 10,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  });
