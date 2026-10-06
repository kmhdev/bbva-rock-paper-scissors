import { describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider, useTheme } from './ThemeContext';

describe('ThemeContext', () => {
  it('throws when used outside the provider', async () => {
    const Boom = () => {
      useTheme();
      return null;
    };
    await expect(render(<Boom />)).rejects.toThrow('useTheme must be used within a ThemeProvider');
  });

  it('exposes setTheme to switch explicitly', async () => {
    function Probe() {
      const { theme, setTheme } = useTheme();
      return (
        <Text
          accessibilityLabel="Aplicar tema claro"
          onPress={() =>
            setTheme({
              name: 'light',
              background: '#fff',
              card: '#fff',
              text: '#000',
              textMuted: '#666',
              accent: '#00f',
              danger: '#f00',
              success: '#0f0',
              border: '#ccc',
            })
          }
        >{`theme:${theme.name}`}</Text>
      );
    }
    await render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByText('theme:dark')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Aplicar tema claro'));
    expect(screen.getByText('theme:light')).toBeTruthy();
  });
});
