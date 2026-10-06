import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { registerServiceWorker } from '../utils/pwa';
import RootLayout from '../app/_layout';

jest.mock('expo-router', () => {
  const mockReact = jest.requireActual('react') as typeof import('react');
  return {
    Stack: Object.assign(
      ({ children }: { children?: ReactNode }) =>
        mockReact.createElement(mockReact.Fragment, null, children),
      { Screen: () => null },
    ),
  };
});

jest.mock('react-native-gesture-handler', () => {
  const mockReact = jest.requireActual('react') as typeof import('react');
  const mockRN = jest.requireActual('react-native') as typeof import('react-native');
  return {
    GestureHandlerRootView: ({
      children,
      style,
    }: {
      children?: ReactNode;
      style?: StyleProp<ViewStyle>;
    }) => mockReact.createElement(mockRN.View, { style }, children),
  };
});

jest.mock('../utils/pwa', () => ({ registerServiceWorker: jest.fn() }));

describe('RootLayout', () => {
  it('registers the offline service worker on mount', async () => {
    await render(<RootLayout />);
    expect(registerServiceWorker).toHaveBeenCalledTimes(1);
  });
});
