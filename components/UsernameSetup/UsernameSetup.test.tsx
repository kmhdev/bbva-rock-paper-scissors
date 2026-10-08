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
});
