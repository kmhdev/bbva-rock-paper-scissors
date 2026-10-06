import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../context/ThemeContext';
import RoundResult from './RoundResult';

describe('RoundResult', () => {
  it('asks for a pick when the round has not started', async () => {
    await render(
      <ThemeProvider>
        <RoundResult playerPick={null} machinePick={null} thinking={false} outcome={null} />
      </ThemeProvider>,
    );
    expect(screen.getByText('Elige tu jugada para empezar la ronda.')).toBeTruthy();
  });

  it('shows thinking state while the machine delays its pick', async () => {
    await render(
      <ThemeProvider>
        <RoundResult playerPick="rock" machinePick={null} thinking={true} outcome={null} />
      </ThemeProvider>,
    );
    expect(screen.getByText('Tú: ✊ Piedra')).toBeTruthy();
    expect(screen.getByText('La máquina está pensando…')).toBeTruthy();
  });

  it('shows a win with both picks', async () => {
    await render(
      <ThemeProvider>
        <RoundResult playerPick="rock" machinePick="scissors" thinking={false} outcome="win" />
      </ThemeProvider>,
    );
    expect(screen.getByText('Máquina: ✌️ Tijera')).toBeTruthy();
    expect(screen.getByText('¡Has ganado! +1 punto')).toBeTruthy();
  });

  it('shows a loss message', async () => {
    await render(
      <ThemeProvider>
        <RoundResult playerPick="rock" machinePick="paper" thinking={false} outcome="lose" />
      </ThemeProvider>,
    );
    expect(screen.getByText('Has perdido')).toBeTruthy();
  });

  it('shows a draw message', async () => {
    await render(
      <ThemeProvider>
        <RoundResult playerPick="paper" machinePick="paper" thinking={false} outcome="draw" />
      </ThemeProvider>,
    );
    expect(screen.getByText('Empate')).toBeTruthy();
  });
});
