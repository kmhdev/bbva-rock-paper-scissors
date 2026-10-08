import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../context/ThemeContext';
import { NavigationProvider } from '../../context/NavigationContext';
import Sidebar from './Sidebar';

jest.mock('../../hooks/useIsMobilePlatform', () => ({
  useIsMobilePlatform: () => true,
}));

jest.mock('../../hooks/useSupabaseAuth', () => ({
  useSupabaseAuth: () => ({
    isConfigured: false,
    isLoading: false,
    user: null,
    error: '',
    signOut: jest.fn(),
  }),
}));

async function renderSidebar(open = true) {
  const onClose = jest.fn();
  await render(
    <ThemeProvider>
      <NavigationProvider>
        <Sidebar open={open} onClose={onClose} />
      </NavigationProvider>
    </ThemeProvider>,
  );
  return { onClose };
}

describe('Sidebar', () => {
  it('shows the menu and navigates to ranking', async () => {
    const { onClose } = await renderSidebar(true);
    expect(await screen.findByLabelText('Inicio')).toBeTruthy();
    expect(screen.getByLabelText('Juego')).toBeTruthy();
    expect(screen.getByLabelText('Ranking')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Ranking'));
    expect(onClose).toHaveBeenCalled();
  });

  it('toggles the theme from the menu', async () => {
    await renderSidebar(true);
    expect(await screen.findByLabelText(/Cambiar a tema/)).toBeTruthy();
  });
});
