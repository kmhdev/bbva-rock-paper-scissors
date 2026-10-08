import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import * as supabaseStorage from '../services/supabaseScoreStorage';
import { getScoreService, useGameStore } from '../store/appStore';
import HomeView from '../views/Home/Home';
import { LOCAL_NAME_TAKEN_ONLINE_ERROR } from '../views/Home/Home.helpers';

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

  it('renders title, name input, mode selector and ranking link', async () => {
    await renderHome();
    expect(screen.getByText('Piedra, papel o tijera')).toBeTruthy();
    expect(screen.getByPlaceholderText('Tu nombre')).toBeTruthy();
    expect(screen.getByText('Clásico (3)')).toBeTruthy();
    expect(screen.getByText('Lagarto-Spock (5)')).toBeTruthy();
    expect(screen.getByText('Ranking')).toBeTruthy();
  });

  it('uses the reusable username setup for the first local name', async () => {
    await renderHome();
    expect(screen.getByText('¿Cómo te llamamos?')).toBeTruthy();
    expect(screen.getByText('Este será tu nombre de jugador en este dispositivo.')).toBeTruthy();
    expect(screen.getByText('¡Elige bien! No podrás cambiarlo después.')).toBeTruthy();
  });

  it('shows a validation error for short names', async () => {
    await renderHome();
    await fireEvent.changeText(screen.getByPlaceholderText('Tu nombre'), 'a');
    await fireEvent.press(screen.getByLabelText('Empezar a jugar'));
    expect(await screen.findByText('Usa entre 2 y 20 caracteres.')).toBeTruthy();
    expect(mockSetScreen).not.toHaveBeenCalled();
  });

  it('registers a new player and navigates to game', async () => {
    await renderHome();
    await fireEvent.changeText(screen.getByPlaceholderText('Tu nombre'), 'Ana');
    await fireEvent.press(screen.getByLabelText('Empezar a jugar'));
    await waitFor(() => expect(mockSetScreen).toHaveBeenCalledWith('game'));
    expect(useGameStore.getState().playerName).toBe('Ana');
    expect(useGameStore.getState().lastUsername).toBe('Ana');
  });

  it('resumes an existing player keeping their score', async () => {
    await getScoreService().saveScore('Kike', 7);
    await renderHome();
    await fireEvent.changeText(screen.getByPlaceholderText('Tu nombre'), 'kike');
    await fireEvent.press(screen.getByLabelText('Empezar a jugar'));
    await waitFor(() => expect(mockSetScreen).toHaveBeenCalledWith('game'));
    expect(useGameStore.getState().score).toBe(7);
  });

  it('blocks local names already used by an online player', async () => {
    const spy = jest
      .spyOn(supabaseStorage, 'fetchRemoteScores')
      .mockResolvedValue([{ username: 'ZoeOnline', score: 9 }]);
    try {
      await renderHome();
      await fireEvent.changeText(screen.getByPlaceholderText('Tu nombre'), 'zoeonline');
      await fireEvent.press(screen.getByLabelText('Empezar a jugar'));
      expect(await screen.findByText(LOCAL_NAME_TAKEN_ONLINE_ERROR)).toBeTruthy();
      expect(mockSetScreen).not.toHaveBeenCalledWith('game');
      expect(useGameStore.getState().playerName).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });

  it('releases a stale locked name taken online instead of getting stuck', async () => {
    const spy = jest
      .spyOn(supabaseStorage, 'fetchRemoteScores')
      .mockResolvedValue([{ username: 'zoeonline', score: 9 }]);
    try {
      useGameStore.setState({ lastUsername: 'ZoeOnline' });
      await renderHome();
      expect(screen.getByText('Hola, ZoeOnline 😊')).toBeTruthy();
      await fireEvent.press(screen.getByLabelText('Empezar a jugar'));
      expect(await screen.findByText(LOCAL_NAME_TAKEN_ONLINE_ERROR)).toBeTruthy();
      expect(useGameStore.getState().lastUsername).toBeNull();
      expect(mockSetScreen).not.toHaveBeenCalledWith('game');
      expect(screen.getByPlaceholderText('Tu nombre')).toBeTruthy();
    } finally {
      spy.mockRestore();
    }
  });

  it('locks the local name once selected and does not allow changing it', async () => {
    useGameStore.setState({ lastUsername: 'Ana' });
    await renderHome();
    expect(screen.getByText('Hola, Ana 😊')).toBeTruthy();
    expect(screen.queryByText('¿Cómo te llamamos?')).toBeNull();
    expect(screen.queryByLabelText('Nombre del jugador')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Empezar a jugar'));
    await waitFor(() => expect(mockSetScreen).toHaveBeenCalledWith('game'));
    expect(useGameStore.getState().playerName).toBe('Ana');
  });

  it('switches game mode', async () => {
    await renderHome();
    await fireEvent.press(screen.getByLabelText('Modo Lagarto-Spock (5)'));
    expect(useGameStore.getState().gameMode).toBe('extended');
  });

  it('redirects to game when a session is already active', async () => {
    useGameStore.setState({ playerName: 'Ana', lastUsername: 'Ana' });
    await renderHome();
    await waitFor(() => expect(mockSetScreen).toHaveBeenCalledWith('game'));
  });

  it('navigates to ranking', async () => {
    await renderHome();
    await fireEvent.press(screen.getByLabelText('Ranking'));
    expect(mockSetScreen).toHaveBeenCalledWith('ranking');
  });
});
