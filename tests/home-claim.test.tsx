import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { User } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import * as authHook from '../hooks/useSupabaseAuth';
import * as supabaseStorage from '../services/supabaseScoreStorage';
import { useGameStore } from '../store/appStore';
import type { SupabaseAuthState } from '../types/types';
import HomeView from '../views/Home/Home';

const mockSetScreen = jest.fn();

jest.mock('../context/NavigationContext', () => ({
  useNavigation: () => ({ screen: 'home', setScreen: mockSetScreen }),
  NavigationProvider: ({ children }: { children: ReactNode }) => children,
}));

const mockUser = { id: 'user-1', email: 'ana@example.com', user_metadata: {} } as User;

function makeAuth(overrides: Partial<SupabaseAuthState> = {}): SupabaseAuthState {
  return {
    user: null,
    session: null,
    profile: null,
    requiresUsername: false,
    isClaimingUsername: false,
    isConfigured: true,
    isLoading: false,
    isSigningIn: false,
    error: '',
    claimUsername: () => Promise.resolve(),
    signInWithGoogle: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    ...overrides,
  };
}

async function renderHome() {
  await render(
    <ThemeProvider>
      <HomeView />
    </ThemeProvider>,
  );
}

describe('HomeScreen with claimed identity', () => {
  beforeEach(() => {
    mockSetScreen.mockClear();
    jest.restoreAllMocks();
    useGameStore.setState({
      playerName: null,
      lastUsername: null,
      score: 0,
      gameMode: 'classic',
      smartMachine: false,
      playerPick: null,
      machinePick: null,
      outcome: null,
      machineThinking: false,
      playerHistory: [],
      machineHistory: [],
    });
  });

  it('asks for a username once after login and blocks play until claimed', async () => {
    const claimUsername = jest.fn<() => Promise<void>>();
    jest
      .spyOn(authHook, 'useSupabaseAuth')
      .mockReturnValue(makeAuth({ user: mockUser, requiresUsername: true, claimUsername }));
    await renderHome();
    expect(screen.getByText('¿Cómo te llamamos?')).toBeTruthy();
    expect(screen.queryByLabelText('Empezar a jugar')).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Nombre de usuario online'), 'AnaOnline');
    await fireEvent.press(screen.getByLabelText('Reservar nombre'));
    expect(claimUsername).toHaveBeenCalledWith('AnaOnline');
  });

  it('allows playing with your own claimed online name', async () => {
    const remoteSpy = jest
      .spyOn(supabaseStorage, 'fetchRemoteScores')
      .mockResolvedValue([{ username: 'anaonline', score: 9 }]);
    try {
      jest.spyOn(authHook, 'useSupabaseAuth').mockReturnValue(
        makeAuth({
          user: mockUser,
          profile: { user_id: 'user-1', username: 'AnaOnline' },
        }),
      );
      await renderHome();
      await fireEvent.press(screen.getByLabelText('Empezar a jugar'));
      await waitFor(() => expect(mockSetScreen).toHaveBeenCalledWith('game'));
      expect(useGameStore.getState().playerName).toBe('AnaOnline');
    } finally {
      remoteSpy.mockRestore();
    }
  });

  it('greets with the claimed username instead of showing the name input', async () => {
    jest.spyOn(authHook, 'useSupabaseAuth').mockReturnValue(
      makeAuth({
        user: mockUser,
        profile: { user_id: 'user-1', username: 'AnaOnline' },
      }),
    );
    await renderHome();
    expect(screen.getByText('Hola, AnaOnline 😊')).toBeTruthy();
    expect(screen.queryByLabelText('Nombre del jugador')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Empezar a jugar'));
    await waitFor(() => expect(mockSetScreen).toHaveBeenCalledWith('game'));
    expect(useGameStore.getState().playerName).toBe('AnaOnline');
  });
});
