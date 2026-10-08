import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '../../context/ThemeContext';
import UsernameSetup from './UsernameSetup';

describe('UsernameSetup', () => {
  it('renders the claim form with the lock warning', async () => {
    const onClaimUsername = jest.fn<() => Promise<void>>();
    const onSignOut = jest.fn<() => Promise<void>>();
    await render(
      <ThemeProvider>
        <UsernameSetup
          error=""
          isSaving={false}
          onClaimUsername={onClaimUsername}
          onSignOut={onSignOut}
        />
      </ThemeProvider>,
    );
    expect(screen.getByText('¿Cómo te llamamos?')).toBeTruthy();
    expect(screen.getByLabelText('Nombre de usuario online')).toBeTruthy();
    expect(screen.getByText('¡Elige bien! No podrás cambiarlo después.')).toBeTruthy();
  });

  it('prefills the Google name suggestion', async () => {
    const onClaimUsername = jest.fn<() => Promise<void>>();
    const onSignOut = jest.fn<() => Promise<void>>();
    await render(
      <ThemeProvider>
        <UsernameSetup
          error=""
          isSaving={false}
          initialUsername="Ana García"
          onClaimUsername={onClaimUsername}
          onSignOut={onSignOut}
        />
      </ThemeProvider>,
    );
    expect(screen.getByDisplayValue('Ana García')).toBeTruthy();
  });

  it('shows a validation error for short names', async () => {
    const onClaimUsername = jest.fn<() => Promise<void>>();
    const onSignOut = jest.fn<() => Promise<void>>();
    await render(
      <ThemeProvider>
        <UsernameSetup
          error=""
          isSaving={false}
          onClaimUsername={onClaimUsername}
          onSignOut={onSignOut}
        />
      </ThemeProvider>,
    );
    await fireEvent.changeText(screen.getByLabelText('Nombre de usuario online'), 'a');
    await fireEvent.press(screen.getByLabelText('Reservar nombre'));
    expect(screen.getByText('Usa entre 2 y 20 caracteres.')).toBeTruthy();
    expect(onClaimUsername).not.toHaveBeenCalled();
  });

  it('claims the typed username', async () => {
    const onClaimUsername = jest.fn<() => Promise<void>>();
    const onSignOut = jest.fn<() => Promise<void>>();
    await render(
      <ThemeProvider>
        <UsernameSetup
          error=""
          isSaving={false}
          onClaimUsername={onClaimUsername}
          onSignOut={onSignOut}
        />
      </ThemeProvider>,
    );
    await fireEvent.changeText(screen.getByLabelText('Nombre de usuario online'), 'AnaOnline');
    await fireEvent.press(screen.getByLabelText('Reservar nombre'));
    expect(onClaimUsername).toHaveBeenCalledWith('AnaOnline');
  });

  it('shows server errors and signs out on cancel', async () => {
    const onClaimUsername = jest.fn<() => Promise<void>>();
    const onSignOut = jest.fn<() => Promise<void>>();
    await render(
      <ThemeProvider>
        <UsernameSetup
          error="Ese nombre ya está en uso. Prueba con otro."
          isSaving={false}
          onClaimUsername={onClaimUsername}
          onSignOut={onSignOut}
        />
      </ThemeProvider>,
    );
    expect(screen.getByText('Ese nombre ya está en uso. Prueba con otro.')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Cancelar y cerrar sesión'));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('hides the secondary action when reused without sign out (local mode)', async () => {
    const onClaimUsername = jest.fn<() => Promise<void>>();
    await render(
      <ThemeProvider>
        <UsernameSetup
          error=""
          isSaving={false}
          onClaimUsername={onClaimUsername}
          description="Este será tu nombre de jugador en este dispositivo."
          submitTitle="Jugar"
          submitAccessibilityLabel="Empezar a jugar"
          inputAccessibilityLabel="Nombre del jugador"
        />
      </ThemeProvider>,
    );
    expect(screen.getByText('Este será tu nombre de jugador en este dispositivo.')).toBeTruthy();
    expect(screen.getByLabelText('Empezar a jugar')).toBeTruthy();
    expect(screen.queryByLabelText('Cancelar y cerrar sesión')).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Nombre del jugador'), 'Ana');
    await fireEvent.press(screen.getByLabelText('Empezar a jugar'));
    expect(onClaimUsername).toHaveBeenCalledWith('Ana');
  });
});
