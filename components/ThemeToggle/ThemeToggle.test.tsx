import { describe, expect, it } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

function ThemeNameProbe() {
  const { theme } = useTheme();
  return <Text>{`theme:${theme.name}`}</Text>;
}

async function renderToggle() {
  await render(
    <ThemeProvider>
      <ThemeNameProbe />
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe('ThemeToggle', () => {
  it('starts in dark mode and switches to light on press', async () => {
    await renderToggle();
    expect(screen.getByText('theme:dark')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Cambiar tema'));
    expect(await screen.findByText('theme:light')).toBeTruthy();
  });

  it('switches back to dark on second press', async () => {
    await renderToggle();
    await fireEvent.press(screen.getByLabelText('Cambiar tema'));
    expect(await screen.findByText('theme:light')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Cambiar tema'));
    expect(await screen.findByText('theme:dark')).toBeTruthy();
  });

  it('persists the chosen theme', async () => {
    await AsyncStorage.clear();
    await renderToggle();
    await fireEvent.press(screen.getByLabelText('Cambiar tema'));
    expect(await screen.findByText('theme:light')).toBeTruthy();
    await expect(AsyncStorage.getItem('@bbva-rps:theme')).resolves.toBe('light');
  });
});
