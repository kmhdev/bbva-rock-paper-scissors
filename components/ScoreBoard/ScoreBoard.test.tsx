import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../context/ThemeContext';
import ScoreBoard from './ScoreBoard';

describe('ScoreBoard', () => {
  it('shows the player name and points', async () => {
    await render(
      <ThemeProvider>
        <ScoreBoard playerName="Ana" score={3} />
      </ThemeProvider>,
    );
    expect(screen.getByText('Hola, Ana')).toBeTruthy();
    expect(screen.getByText('Puntos: 3')).toBeTruthy();
  });
});
