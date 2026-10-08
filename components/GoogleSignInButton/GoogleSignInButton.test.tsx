import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../context/ThemeContext';
import GoogleSignInButton from './GoogleSignInButton';

describe('GoogleSignInButton', () => {
  it('renders the Google action', async () => {
    await render(
      <ThemeProvider>
        <GoogleSignInButton onPress={() => {}} />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText('Continuar con Google')).toBeTruthy();
    expect(screen.getByText('Continuar con Google')).toBeTruthy();
    expect(screen.getByTestId('google-logo')).toBeTruthy();
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(
      <ThemeProvider>
        <GoogleSignInButton onPress={onPress} />
      </ThemeProvider>,
    );
    await fireEvent.press(screen.getByLabelText('Continuar con Google'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disables the button while loading', async () => {
    const onPress = jest.fn();
    await render(
      <ThemeProvider>
        <GoogleSignInButton onPress={onPress} loading />
      </ThemeProvider>,
    );
    await fireEvent.press(screen.getByLabelText('Continuar con Google'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
