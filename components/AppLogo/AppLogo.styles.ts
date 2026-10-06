import { StyleSheet } from 'react-native';

export const getStyles = () => {
  return StyleSheet.create({
    logoWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    logoImage: {
      backgroundColor: 'transparent',
    },
  });
};

export const LOGO_DEFAULT_SIZE = 96;

export const resolveLogoSize = (size?: number): number => size ?? LOGO_DEFAULT_SIZE;

export const getLogoImageStyle = (logoSize: number) => ({
  width: logoSize,
  height: logoSize,
});
