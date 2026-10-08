import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { getScoreService, useGameStore } from '../store/appStore';
import RankingView from '../views/Ranking/Ranking';

const mockSetScreen = jest.fn();

jest.mock('../context/NavigationContext', () => ({
  useNavigation: () => ({ screen: 'ranking', setScreen: mockSetScreen }),
  NavigationProvider: ({ children }: { children: ReactNode }) => children,
}));

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
    await AsyncStorage.clear();
    useGameStore.setState({ playerName: null });
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
    expect(await screen.findByText('Ana')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    const pointCells = screen.getAllByText(/^(1 pto|[0-9]+ pts)$/);
    expect(pointCells.map((cell) => cell.children.join(''))).toEqual(['5 pts', '2 pts']);
    expect(screen.getByText('Volver')).toBeTruthy();
  });

  it('shows a single best score per player without local/online split', async () => {
    const scores = getScoreService();
    await scores.saveScore('Ana', 5);
    useGameStore.setState({ playerName: 'Ana' });
    await renderRanking();
    expect(await screen.findByText('Ana')).toBeTruthy();
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
});
