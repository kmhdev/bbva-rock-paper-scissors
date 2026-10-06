import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../context/ThemeContext';
import ChoiceButton from './ChoiceButton';

async function renderButton(props?: Partial<React.ComponentProps<typeof ChoiceButton>>) {
  const onPress = jest.fn();
  await render(
    <ThemeProvider>
      <ChoiceButton choice="rock" selected={false} disabled={false} onPress={onPress} {...props} />
    </ThemeProvider>,
  );
  return { onPress };
}

describe('ChoiceButton', () => {
  it('renders the emoji and Spanish label', async () => {
    await renderButton();
    expect(screen.getByText('✊')).toBeTruthy();
    expect(screen.getByText('Piedra')).toBeTruthy();
  });

  it('calls onPress with the choice when pressed', async () => {
    const { onPress } = await renderButton();
    await fireEvent.press(screen.getByLabelText('Elegir piedra'));
    expect(onPress).toHaveBeenCalledWith('rock');
  });

  it('does not call onPress when disabled', async () => {
    const { onPress } = await renderButton({ disabled: true });
    await fireEvent.press(screen.getByLabelText('Elegir piedra'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('exposes selected state for assistive tech', async () => {
    await renderButton({ selected: true });
    expect(screen.getByLabelText('Elegir piedra').props.accessibilityState).toMatchObject({
      selected: true,
    });
  });
});
