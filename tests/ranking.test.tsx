import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import * as authHook from '../hooks/useSupabaseAuth';
import { submitOnlineScore } from '../services/supabaseScoreStorage';
import { getScoreService, useGameStore } from '../store/appStore';
import type { SupabaseAuthState } from '../types/types';
import RankingView from '../views/Ranking/Ranking';

const mockSetScreen = jest.fn();

jest.mock('../context/NavigationContext', () => ({
  useNavigation: () => ({ screen: 'ranking', setScreen: mockSetScreen }),
  NavigationProvider: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('../services/supabaseScoreStorage', () => {
  const actual = jest.requireActual('../services/supabaseScoreStorage') as Record<string, unknown>;
  return { ...actual, submitOnlineScore: jest.fn(() => Promise.resolve()) };
});

const mockSubmit = submitOnlineScore as jest.Mock;

function makeAuth(overrides: Partial<SupabaseAuthState> = {}): SupabaseAuthState {
  return {
    user: null,
    session: null,
    profile: null,
    requiresUsername: false,
    isClaimingUsername: false,
    isConfigured: false,
    isLoading: false,
    isSigningIn: false,
    error: '',
    claimUsername: () => Promise.resolve(),
    signInWithGoogle: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    ...overrides,
  };
}

async function renderRanking() {
  await render(
    <ThemeProvider>
      <RankingView />
    </ThemeProvider>,
  );
}

describe('RankingScreen', () => {
  beforeEach(async () => {
    mockSetScreen.mockClear();
    mockSubmit.mockClear();
    jest.restoreAllMocks();
    await AsyncStorage.clear();
    useGameStore.setState({ playerName: null, lastUsername: null, score: 0, ownedOnlineNames: [] });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows an empty state when nobody has played yet', async () => {
    await renderRanking();
    expect(
      await screen.findByText('Aún no hay puntuaciones. ¡Sé la primera persona en jugar!'),
    ).toBeTruthy();
  });

  it('lists every player ordered by score desc', async () => {
    const scores = getScoreService();
    await scores.saveScore('Bob', 2);
    await scores.saveScore('Ana', 5);
    useGameStore.setState({ playerName: 'Ana' });
    await renderRanking();
    expect(await screen.findByText('Ana (tú)')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    const pointCells = screen.getAllByText(/^(-?1 pto|-?[0-9]+ pts)$/);
    expect(pointCells.map((cell) => cell.children.join(''))).toEqual(['5 pts', '2 pts']);
    expect(screen.getByText('Volver')).toBeTruthy();
  });

  it('shows a single best score per player without local/online split', async () => {
    const scores = getScoreService();
    await scores.saveScore('Ana', 5);
    useGameStore.setState({ playerName: 'Ana' });
    await renderRanking();
    expect(await screen.findByText('Ana (tú)')).toBeTruthy();
    expect(screen.getByText('5 pts')).toBeTruthy();
    expect(screen.queryByText('Local')).toBeNull();
    expect(screen.queryByText('Online')).toBeNull();
  });

  it('goes back to game when a session is active', async () => {
    useGameStore.setState({ playerName: 'Ana' });
    await renderRanking();
    await fireEvent.press(screen.getByLabelText('Volver'));
    expect(mockSetScreen).toHaveBeenCalledWith('game');
  });

  it('goes back home when there is no session', async () => {
    useGameStore.setState({ playerName: null });
    await renderRanking();
    await fireEvent.press(screen.getByLabelText('Volver'));
    expect(mockSetScreen).toHaveBeenCalledWith('home');
  });

  it('marks the local user with (tú) in the leaderboard without a separate box', async () => {
    const scores = getScoreService();
    await scores.saveScore('Ana', 5);
    useGameStore.setState({ playerName: 'Ana', lastUsername: 'Ana', score: 5 });
    await renderRanking();
    expect(await screen.findByText('Ana (tú)')).toBeTruthy();
    expect(screen.queryByTestId('current-score')).toBeNull();
    expect(screen.queryByText('Tu puntuación actual')).toBeNull();
  });

  it('shows the claim CTA when configured but anonymous', async () => {
    jest.spyOn(authHook, 'useSupabaseAuth').mockReturnValue(makeAuth({ isConfigured: true }));
    const scores = getScoreService();
    await scores.saveScore('Ana', 5);
    useGameStore.setState({ playerName: 'Ana', lastUsername: 'Ana', score: 5 });
    await renderRanking();
    expect(await screen.findByTestId('claim-score-box')).toBeTruthy();
    expect(screen.getByText('Reclama tu puntuación logeándote con Google')).toBeTruthy();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('persists the local score in Supabase when logged with a profile', async () => {
    jest.spyOn(authHook, 'useSupabaseAuth').mockReturnValue(
      makeAuth({
        isConfigured: true,
        user: { id: 'user-1' } as User,
        profile: { user_id: 'user-1', username: 'Ana' },
      }),
    );
    const scores = getScoreService();
    await scores.saveScore('Ana', 5);
    useGameStore.setState({ playerName: 'Ana', lastUsername: 'Ana', score: 5 });
    await renderRanking();
    expect(await screen.findByText('Ana (tú)')).toBeTruthy();
    expect(screen.queryByTestId('claim-score-box')).toBeNull();
    expect(mockSubmit).toHaveBeenCalledWith(5);
  });

  it('auto-claims the local name after login instead of asking for a new one', async () => {
    const claimUsername = jest.fn(() =>
      Promise.resolve({ ok: true, profile: { user_id: 'user-1', username: 'Pepe' } }),
    );
    jest.spyOn(authHook, 'useSupabaseAuth').mockReturnValue(
      makeAuth({
        isConfigured: true,
        user: { id: 'user-1' } as User,
        requiresUsername: true,
        claimUsername,
      }),
    );
    const scores = getScoreService();
    await scores.saveScore('Pepe', 5);
    useGameStore.setState({ playerName: 'Pepe', lastUsername: 'Pepe', score: 5 });
    await renderRanking();
    expect(await screen.findByTestId('claim-auto-claim')).toBeTruthy();
    await waitFor(() => expect(claimUsername).toHaveBeenCalledWith('Pepe'));
    expect(screen.queryByLabelText('Nombre de usuario online')).toBeNull();
  });

  it('falls back to the manual form when the local name is taken online', async () => {
    const claimUsername = jest.fn(() =>
      Promise.resolve({ ok: false, error: 'Ese nombre ya está en uso. Prueba con otro.' }),
    );
    jest.spyOn(authHook, 'useSupabaseAuth').mockReturnValue(
      makeAuth({
        isConfigured: true,
        user: { id: 'user-1' } as User,
        requiresUsername: true,
        error: 'Ese nombre ya está en uso. Prueba con otro.',
        claimUsername,
      }),
    );
    const scores = getScoreService();
    await scores.saveScore('Pepe', 5);
    useGameStore.setState({ playerName: 'Pepe', lastUsername: 'Pepe', score: 5 });
    await renderRanking();
    expect(await screen.findByDisplayValue('Pepe')).toBeTruthy();
  });
});
