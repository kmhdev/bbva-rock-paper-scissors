import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../context/ThemeContext';
import TopBar from './TopBar';

jest.mock('../../hooks/useIsMobilePlatform', () => ({
  useIsMobilePlatform: jest.fn(() => false),
}));

import { useIsMobilePlatform } from '../../hooks/useIsMobilePlatform';

const mockIsMobile = useIsMobilePlatform as jest.Mock;

describe('TopBar', () => {
  it('shows the theme toggle on desktop web', async () => {
    mockIsMobile.mockReturnValue(false);
    await render(
      <ThemeProvider>
        <TopBar />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText('Cambiar tema')).toBeTruthy();
  });

  it('renders nothing on mobile', async () => {
    mockIsMobile.mockReturnValue(true);
    await render(
      <ThemeProvider>
        <TopBar />
      </ThemeProvider>,
    );
    expect(screen.queryByLabelText('Cambiar tema')).toBeNull();
  });
});
