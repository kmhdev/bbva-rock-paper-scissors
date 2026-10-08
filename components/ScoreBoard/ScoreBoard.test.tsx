import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../context/ThemeContext';
import ScoreBoard from './ScoreBoard';

describe('ScoreBoard', () => {
  it('shows only the points', async () => {
    await render(
      <ThemeProvider>
        <ScoreBoard score={3} />
      </ThemeProvider>,
    );
    expect(screen.getByText('Puntos: 3')).toBeTruthy();
    expect(screen.queryByText('Hola, Ana')).toBeNull();
  });
});
