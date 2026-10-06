import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { MACHINE_REVEAL_DELAY_MS } from '../constants/game.constants';
import { ThemeProvider } from '../context/ThemeContext';
import type { Choice } from '../types/types';
import { useGameStore } from '../store/appStore';
import { vibrateOnLoss } from '../utils/vibration';
import GameView from '../views/Game/Game';

const mockSetScreen = jest.fn();
let mockRandomPick: Choice = 'scissors';
let mockSmartPick: Choice = 'paper';

jest.mock('../context/NavigationContext', () => ({
  useNavigation: () => ({ screen: 'game', setScreen: mockSetScreen }),
  NavigationProvider: ({ children }: { children: ReactNode }) => children,
}));

jest.mock('../services/machineStrategies', () => ({
  randomMachineStrategy: { name: 'random', pickMove: () => mockRandomPick },
  smartMachineStrategy: { name: 'smart', pickMove: () => mockSmartPick },
}));

jest.mock('../utils/vibration', () => ({ vibrateOnLoss: jest.fn() }));

function seedSession(partial?: Partial<ReturnType<typeof useGameStore.getState>>) {
  useGameStore.setState({
    playerName: 'Ana',
    score: 0,
    gameMode: 'classic',
    smartMachine: false,
    playerPick: null,
    machinePick: null,
    outcome: null,
    machineThinking: false,
    playerHistory: [],
    machineHistory: [],
    ...partial,
  });
}

async function renderGame() {
  await render(
    <ThemeProvider>
      <GameView />
    </ThemeProvider>,
  );
}

async function playRound(choiceLabel: string) {
  await fireEvent.press(screen.getByLabelText(choiceLabel));
  await act(async () => {
    await jest.advanceTimersByTimeAsync(MACHINE_REVEAL_DELAY_MS);
  });
}

describe('GameScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSetScreen.mockClear();
    mockRandomPick = 'scissors';
    mockSmartPick = 'paper';
    (vibrateOnLoss as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('redirects home when there is no active player', async () => {
    useGameStore.setState({ playerName: null });
    await renderGame();
    expect(mockSetScreen).toHaveBeenCalledWith('home');
  });

  it('shows name, score and the three classic choices', async () => {
    seedSession();
    await renderGame();
    expect(screen.getByText('Hola, Ana')).toBeTruthy();
    expect(screen.getByText('Puntos: 0')).toBeTruthy();
    expect(screen.getByLabelText('Elegir piedra')).toBeTruthy();
    expect(screen.getByLabelText('Elegir papel')).toBeTruthy();
    expect(screen.getByLabelText('Elegir tijera')).toBeTruthy();
  });

  it('resolves a win and adds one point', async () => {
    seedSession();
    await renderGame();
    mockRandomPick = 'scissors';
    await playRound('Elegir piedra');
    expect(screen.getByText('Máquina: ✌️ Tijera')).toBeTruthy();
    expect(screen.getByText('¡Has ganado! +1 punto')).toBeTruthy();
    expect(screen.getByText('Puntos: 1')).toBeTruthy();
    expect(vibrateOnLoss).not.toHaveBeenCalled();
  });

  it('resolves a loss, keeps the score and vibrates', async () => {
    seedSession();
    await renderGame();
    mockRandomPick = 'paper';
    await playRound('Elegir piedra');
    expect(screen.getByText('Has perdido')).toBeTruthy();
    expect(screen.getByText('Puntos: 0')).toBeTruthy();
    expect(vibrateOnLoss).toHaveBeenCalledTimes(1);
  });

  it('resolves a draw', async () => {
    seedSession();
    await renderGame();
    mockRandomPick = 'rock';
    await playRound('Elegir piedra');
    expect(screen.getByText('Empate')).toBeTruthy();
    expect(screen.getByText('Puntos: 0')).toBeTruthy();
  });

  it('ignores extra picks while the machine is thinking', async () => {
    seedSession();
    await renderGame();
    await fireEvent.press(screen.getByLabelText('Elegir piedra'));
    await fireEvent.press(screen.getByLabelText('Elegir papel'));
    expect(screen.getByText('Tú: ✊ Piedra')).toBeTruthy();
    await act(async () => {
      await jest.advanceTimersByTimeAsync(MACHINE_REVEAL_DELAY_MS);
    });
    expect(useGameStore.getState().playerHistory).toEqual(['rock']);
  });

  it('uses the smart strategy when enabled', async () => {
    seedSession({ smartMachine: true });
    await renderGame();
    mockSmartPick = 'paper';
    await playRound('Elegir piedra');
    expect(screen.getByText('Máquina: ✋ Papel')).toBeTruthy();
    expect(screen.getByText('Has perdido')).toBeTruthy();
  });

  it('toggles the smart machine switch', async () => {
    seedSession();
    await renderGame();
    await fireEvent.press(screen.getByLabelText('Activar máquina inteligente'));
    expect(useGameStore.getState().smartMachine).toBe(true);
  });

  it('disables the hard mode toggle while the machine is thinking', async () => {
    seedSession({ playerPick: 'rock', machineThinking: true });
    await renderGame();
    const toggle = screen.getByLabelText('Activar máquina inteligente');
    expect(toggle.props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(toggle);
    expect(useGameStore.getState().smartMachine).toBe(false);
  });

  it('shows five choices in extended mode', async () => {
    seedSession({ gameMode: 'extended' });
    await renderGame();
    expect(screen.getByLabelText('Elegir lagarto')).toBeTruthy();
    expect(screen.getByLabelText('Elegir Spock')).toBeTruthy();
  });

  it('exits to home clearing the session', async () => {
    seedSession();
    await renderGame();
    await fireEvent.press(screen.getByLabelText('Salir del juego'));
    expect(useGameStore.getState().playerName).toBeNull();
    expect(mockSetScreen).toHaveBeenCalledWith('home');
  });
});
