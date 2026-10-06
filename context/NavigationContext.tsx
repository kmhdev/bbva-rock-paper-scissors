import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { NavigationContextValue, Screen } from '../types/types';

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

/** App navigation (ported from quiniela-native): single entry, state-driven screens. */
export function NavigationProvider({ children }: { children: ReactNode }) {
  const [screen, setScreenState] = useState<Screen>('home');

  const setScreen = useCallback((next: Screen) => {
    setScreenState(next);
  }, []);

  const value = useMemo(() => ({ screen, setScreen }), [screen, setScreen]);

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within a NavigationProvider');
  return context;
}

export type { Screen };
