import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../context/ThemeContext';
import RankingRow from './RankingRow';

describe('RankingRow', () => {
  it('shows position, username and plural points', async () => {
    await render(
      <ThemeProvider>
        <RankingRow position={1} username="Ana" score={5} />
      </ThemeProvider>,
    );
    expect(screen.getByText('#1')).toBeTruthy();
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByText('5 pts')).toBeTruthy();
  });

  it('uses singular for one point', async () => {
    await render(
      <ThemeProvider>
        <RankingRow position={2} username="Bob" score={1} />
      </ThemeProvider>,
    );
    expect(screen.getByText('1 pto')).toBeTruthy();
  });
});
