import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import type { UsernameSetupProps } from '../../types/types';
import AppButton from '../AppButton/AppButton';
import { validateUsername } from './UsernameSetup.helpers';
import { getStyles } from './UsernameSetup.styles';

/**
 * Reclamo del nombre público online (portado de espanografia
 * UsernameSetup). Se muestra una sola vez tras el login con Google;
 * el nombre es inmutable y único en el ranking online.
 */
export default function UsernameSetup({
  error,
  isSaving,
  initialUsername = '',
  onClaimUsername,
  onSignOut,
  description = 'Este será tu nombre público en el ranking online.',
  submitTitle = 'Reservar nombre',
  submitAccessibilityLabel = 'Reservar nombre',
  secondaryTitle = 'Cancelar y cerrar sesión',
  secondaryAccessibilityLabel = 'Cancelar y cerrar sesión',
  inputAccessibilityLabel = 'Nombre de usuario online',
}: UsernameSetupProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [username, setUsername] = useState(initialUsername);
  const [validationError, setValidationError] = useState(() =>
    initialUsername === '' ? '' : validateUsername(initialUsername),
  );
  const [submittedUsername, setSubmittedUsername] = useState<string | null>(null);

  const visibleServerError =
    submittedUsername === null || submittedUsername === username ? error : '';
  const visibleError = validationError !== '' ? validationError : visibleServerError;

  const handleChange = (next: string) => {
    setUsername(next);
    setValidationError(validateUsername(next));
  };

  const handleSubmit = () => {
    const nextError = validateUsername(username);
    setValidationError(nextError);
    if (nextError !== '') return;
    setSubmittedUsername(username);
    void onClaimUsername(username);
  };

  return (
    <View style={styles.card} accessibilityLabel="Elegir nombre de usuario">
      <Text style={styles.title}>¿Cómo te llamamos?</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.fieldLabel}>Nombre de usuario</Text>
      <View style={[styles.inputRow, visibleError !== '' && styles.inputRowError]}>
        <Text style={styles.atSign} aria-hidden>
          @
        </Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={handleChange}
          placeholder="Tu nombre"
          placeholderTextColor={theme.textMuted}
          accessibilityLabel={inputAccessibilityLabel}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
          editable={!isSaving}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      </View>
      <Text style={styles.rules}>De 2 a 20 caracteres.</Text>
      {visibleError !== '' && (
        <Text style={styles.error} role="alert">
          {visibleError}
        </Text>
      )}
      <Text style={styles.lockNote}>¡Elige bien! No podrás cambiarlo después.</Text>
      <AppButton
        title={isSaving ? 'Guardando…' : submitTitle}
        accessibilityLabel={submitAccessibilityLabel}
        disabled={isSaving}
        onPress={handleSubmit}
      />
      {onSignOut !== undefined && (
        <AppButton
          title={secondaryTitle}
          accessibilityLabel={secondaryAccessibilityLabel}
          variant="ghostlight"
          disabled={isSaving}
          onPress={() => {
            void onSignOut();
          }}
        />
      )}
    </View>
  );
}
