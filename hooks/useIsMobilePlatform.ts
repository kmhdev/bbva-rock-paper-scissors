import { useMemo } from 'react';
import { Platform } from 'react-native';

/**
 * Indica si la plataforma es móvil (app nativa o navegador móvil) o
 * escritorio web. Portado de quiniela-native.
 */
export function useIsMobilePlatform(): boolean {
  return useMemo(() => {
    if (Platform.OS !== 'web') return true;
    if (typeof navigator === 'undefined') return false;
    const isModernIPad =
      navigator.platform === 'MacIntel' &&
      typeof navigator.maxTouchPoints === 'number' &&
      navigator.maxTouchPoints > 1;
    const isMobile = /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(
      navigator.userAgent,
    );
    return isMobile || isModernIPad;
  }, []);
}
