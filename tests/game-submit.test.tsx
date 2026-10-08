import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { User } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { MACHINE_REVEAL_DELAY_MS } from '../constants/game.constants';
import { ThemeProvider } from '../context/ThemeContext';
import * as authHook from '../hooks/useSupabaseAuth';
import { submitOnlineScore } from '../services/supabaseScoreStorage';
import { useGameStore } from '../store/appStore';
import type { SupabaseAuthState } from '../types/types';
import GameView from '../views/Game/Game';

const mockSetScreen = jest.fn();

jest.mock('../context/NavigationContext', () => ({
  useNavigation: () => ({ screen: 'game', setScreen: mockSetScreen }),
  NavigationProvider: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('../services/machineStrategies', () => ({
  randomMachineStrategy: { name: 'random', pickMove: () => 'scissors' },
  smartMachineStrategy: { name: 'smart', pickMove: () => 'paper' },
}));

jest.mock('../services/supabaseScoreStorage', () => {
  const actual = jest.requireActual('../services/supabaseScoreStorage') as Record<string, unknown>;
  return { ...actual, submitOnlineScore: jest.fn(() => Promise.resolve()) };
});

jest.mock('../utils/vibration', () => ({ vibrateOnLoss: jest.fn() }));

const mockSubmit = submitOnlineScore as jest.Mock;

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

async function renderGame() {
  await render(
    <ThemeProvider>
      <GameView />
    </ThemeProvider>,
  );
}

describe('GameScreen online submit', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    mockSetScreen.mockClear();
    mockSubmit.mockClear();
    jest.restoreAllMocks();
    await AsyncStorage.clear();
    useGameStore.setState({
      playerName: 'AnaOnline',
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

  afterEach(() => {
    jest.useRealTimers();
  });

  it('submits the score when logged with a claimed username', async () => {
    jest.spyOn(authHook, 'useSupabaseAuth').mockReturnValue(
      makeAuth({
        user: { id: 'user-1' } as User,
        profile: { user_id: 'user-1', username: 'AnaOnline' },
      }),
    );
    await renderGame();
    await fireEvent.press(screen.getByLabelText('Elegir piedra'));
    await act(async () => {
      await jest.advanceTimersByTimeAsync(MACHINE_REVEAL_DELAY_MS);
    });
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith(1);
  });

  it('skips the online submit when anonymous', async () => {
    jest.spyOn(authHook, 'useSupabaseAuth').mockReturnValue(makeAuth());
    await renderGame();
    await fireEvent.press(screen.getByLabelText('Elegir piedra'));
    await act(async () => {
      await jest.advanceTimersByTimeAsync(MACHINE_REVEAL_DELAY_MS);
    });
    expect(screen.getByText('Puntos: 1')).toBeTruthy();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('skips the online submit while the username is still unclaimed', async () => {
    jest
      .spyOn(authHook, 'useSupabaseAuth')
      .mockReturnValue(makeAuth({ user: { id: 'user-1' } as User, requiresUsername: true }));
    await renderGame();
    await fireEvent.press(screen.getByLabelText('Elegir piedra'));
    await act(async () => {
      await jest.advanceTimersByTimeAsync(MACHINE_REVEAL_DELAY_MS);
    });
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
