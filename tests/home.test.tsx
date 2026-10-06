import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { getScoreService, useGameStore } from '../store/appStore';
import HomeView from '../views/Home/Home';

const mockSetScreen = jest.fn();

jest.mock('../context/NavigationContext', () => ({
  useNavigation: () => ({ screen: 'home', setScreen: mockSetScreen }),
  NavigationProvider: ({ children }: { children: ReactNode }) => children,
}));

async function renderHome() {
  await render(
    <ThemeProvider>
      <HomeView />
    </ThemeProvider>,
  );
}

describe('HomeScreen', () => {
  beforeEach(async () => {
    mockSetScreen.mockClear();
    useGameStore.setState({
      playerName: null,
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

  it('renders title, name input, mode selector and ranking link', async () => {
    await renderHome();
    expect(screen.getByText('Piedra, papel o tijera')).toBeTruthy();
    expect(screen.getByPlaceholderText('Tu nombre')).toBeTruthy();
    expect(screen.getByText('Clásico (3)')).toBeTruthy();
    expect(screen.getByText('Lagarto-Spock (5)')).toBeTruthy();
    expect(screen.getByText('Ver ranking')).toBeTruthy();
  });

  it('shows a validation error for short names', async () => {
    await renderHome();
    await fireEvent.changeText(screen.getByPlaceholderText('Tu nombre'), 'a');
    await fireEvent.press(screen.getByLabelText('Empezar a jugar'));
    expect(await screen.findByText('Introduce un nombre con al menos 2 caracteres.')).toBeTruthy();
    expect(mockSetScreen).not.toHaveBeenCalled();
  });

  it('registers a new player and navigates to game', async () => {
    await renderHome();
    await fireEvent.changeText(screen.getByPlaceholderText('Tu nombre'), 'Ana');
    await fireEvent.press(screen.getByLabelText('Empezar a jugar'));
    await waitFor(() => expect(mockSetScreen).toHaveBeenCalledWith('game'));
    expect(useGameStore.getState().playerName).toBe('Ana');
  });

  it('resumes an existing player keeping their score', async () => {
    await getScoreService().saveScore('Kike', 7);
    await renderHome();
    await fireEvent.changeText(screen.getByPlaceholderText('Tu nombre'), 'kike');
    await fireEvent.press(screen.getByLabelText('Empezar a jugar'));
    await waitFor(() => expect(mockSetScreen).toHaveBeenCalledWith('game'));
    expect(useGameStore.getState().score).toBe(7);
  });

  it('switches game mode', async () => {
    await renderHome();
    await fireEvent.press(screen.getByLabelText('Modo Lagarto-Spock (5)'));
    expect(useGameStore.getState().gameMode).toBe('extended');
  });

  it('redirects to game when a session is already active', async () => {
    useGameStore.setState({ playerName: 'Ana' });
    await renderHome();
    await waitFor(() => expect(mockSetScreen).toHaveBeenCalledWith('game'));
  });

  it('navigates to ranking', async () => {
    await renderHome();
    await fireEvent.press(screen.getByLabelText('Ver ranking'));
    expect(mockSetScreen).toHaveBeenCalledWith('ranking');
  });
});
