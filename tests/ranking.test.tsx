import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReactNode } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { getScoreService, useGameStore } from '../store/appStore';
import RankingScreen from '../app/ranking';

jest.mock('expo-router', () => {
  const mockReact = jest.requireActual('react') as typeof import('react');
  const mockRN = jest.requireActual('react-native') as typeof import('react-native');
  return {
    useRouter: () => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() }),
    Redirect: ({ href }: { href: string }) =>
      mockReact.createElement(mockRN.Text, null, `redirect:${href}`),
    Link: ({ children }: { children: ReactNode }) =>
      mockReact.createElement(mockRN.Text, null, children),
    Stack: Object.assign(
      ({ children }: { children?: ReactNode }) =>
        mockReact.createElement(mockReact.Fragment, null, children),
      { Screen: () => null },
    ),
  };
});

async function renderRanking() {
  await render(
    <ThemeProvider>
      <RankingScreen />
    </ThemeProvider>,
  );
}

describe('RankingScreen', () => {
  beforeEach(async () => {
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
});
