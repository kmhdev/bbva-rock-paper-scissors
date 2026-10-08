import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../../context/ThemeContext';
import ToolsButton from './ToolsButton';

jest.mock('../../hooks/useIsMobilePlatform', () => ({
  useIsMobilePlatform: () => true,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

async function renderButton(visible = true) {
  const onPress = jest.fn();
  await render(
    <ThemeProvider>
      <ToolsButton visible={visible} onPress={onPress} />
    </ThemeProvider>,
  );
  return { onPress };
}

describe('ToolsButton', () => {
  it('opens the menu on press', async () => {
    const { onPress } = await renderButton(true);
    const button = await screen.findByLabelText('Abrir menú');
    expect(button).toBeTruthy();
    await fireEvent.press(button);
    await waitFor(() => expect(onPress).toHaveBeenCalledTimes(1));
  });

  it('renders nothing when hidden', async () => {
    await renderButton(false);
    expect(screen.queryByLabelText('Abrir menú')).toBeNull();
  });
});
