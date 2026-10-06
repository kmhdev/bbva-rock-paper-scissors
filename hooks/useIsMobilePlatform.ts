import { useMemo } from 'react';
import { Platform } from 'react-native';

/**
 * Retorna true si la plataforma es mobile (app nativa o navegador móvil),
 * false si es desktop web. Portado de quiniela-native.
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
