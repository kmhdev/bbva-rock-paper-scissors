import { describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { NavigationProvider, useNavigation } from './NavigationContext';

function ScreenProbe() {
  const { screen: current, setScreen } = useNavigation();
  return (
    <>
      <Text testID="current-screen">{current}</Text>
      <Text testID="go-ranking" onPress={() => setScreen('ranking')}>
        go
      </Text>
    </>
  );
}

describe('NavigationContext', () => {
  it('starts on home and switches screen', async () => {
    await render(
      <NavigationProvider>
        <ScreenProbe />
      </NavigationProvider>,
    );
    expect(screen.getByTestId('current-screen').props.children).toBe('home');
    await fireEvent.press(screen.getByTestId('go-ranking'));
    expect(screen.getByTestId('current-screen').props.children).toBe('ranking');
  });
});
