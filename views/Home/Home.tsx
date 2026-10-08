import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import AppButton from '../../components/AppButton/AppButton';
import AppLogo from '../../components/AppLogo/AppLogo';
import GoogleSignInButton from '../../components/GoogleSignInButton/GoogleSignInButton';
import SegmentedToggle from '../../components/SegmentedToggle/SegmentedToggle';
import UsernameSetup from '../../components/UsernameSetup/UsernameSetup';
import MainCard from '../../components/MainCard/MainCard';
import TopBar from '../../components/TopBar/TopBar';
import { useOnlineClaim } from '../../hooks/useOnlineClaim';
import { useGameStore } from '../../store/appStore';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import type { GameMode, SegmentedToggleOption } from '../../types/types';
import { fetchRemoteScores } from '../../services/supabaseScoreStorage';
import {
  getGoogleNameSuggestion,
  isUsernameTakenOnline,
  LOCAL_NAME_TAKEN_ONLINE_ERROR,
  needsIdentitySwitch,
  resolveOwnOnlineName,
} from './Home.helpers';
import { getStyles } from './Home.styles';

const MODE_OPTIONS: ReadonlyArray<SegmentedToggleOption<GameMode>> = [
  { value: 'classic', label: 'Clásico (3)', emoji: '✊', accessibilityLabel: 'Modo Clásico (3)' },
  {
    value: 'extended',
    label: 'Lagarto-Spock (5)',
    emoji: '🦎',
    accessibilityLabel: 'Modo Lagarto-Spock (5)',
  },
];

/** Vista Home: pantalla por defecto. Registra al jugador y empieza el juego. */
export default function HomeView() {
  const { setScreen } = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const gameMode = useGameStore((state) => state.gameMode);
  const setGameMode = useGameStore((state) => state.setGameMode);
  const registerPlayer = useGameStore((state) => state.registerPlayer);
  const clearLastUsername = useGameStore((state) => state.clearLastUsername);
  const ownedOnlineNames = useGameStore((state) => state.ownedOnlineNames);
  const [formError, setFormError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const {
    auth,
    playerName,
    lastUsername,
    claimedUsername,
    hasOnlineIdentity,
    autoClaimName,
    showAutoClaimPending,
    handleClaimUsername: handleClaimOnline,
  } = useOnlineClaim();

  // El nombre local ya se cotejó contra el online al empezar a jugar:
  // tras el login se reclama solo, sin pedir otro nombre. El formulario
  // manual solo queda como fallback (alta fresca sin nombre local, o si
  // entretanto lo ocuparon). Si el reclamado difiere del local, se mueve
  // su mejor marca local al reclamado para no duplicar.
  const claimSuggestion = playerName ?? lastUsername ?? getGoogleNameSuggestion(auth.user);

  useEffect(() => {
    if (playerName === null) return;
    // Nombre de usuario único: con perfil reclamado la sesión local debe ser el
    // nombre online. Si se jugaba como "x" y el perfil es "y",
    // cambiamos a "y" en vez de seguir como "x".
    if (hasOnlineIdentity && claimedUsername !== null) {
      if (needsIdentitySwitch(playerName, claimedUsername)) {
        void registerPlayer(claimedUsername).then(() => setScreen('game'));
        return;
      }
    }
    setScreen('game');
  }, [playerName, setScreen, hasOnlineIdentity, claimedUsername, registerPlayer]);

  const lockedName = claimedUsername ?? lastUsername;

  // Registro local unificado: lo usan tanto el formulario de nombre nuevo
  // como el botón "Jugar" cuando ya hay nombre guardado. Solo cambia qué
  // hacer si el nombre está ocupado online (limpiar el guardado o no).
  const handleRegisterLocalName = async (username: string, clearStoredNameOnTaken: boolean) => {
    setFormError('');
    setIsRegistering(true);
    try {
      const remote = await fetchRemoteScores();
      // El nombre propio (reclamado antes aquí, aunque se haya cerrado
      // sesión) está exento del bloqueo: es seguir en local, no suplantar.
      const ownOnlineName = claimedUsername ?? resolveOwnOnlineName(ownedOnlineNames, username);
      if (isUsernameTakenOnline(username, remote, ownOnlineName)) {
        if (clearStoredNameOnTaken) clearLastUsername();
        setFormError(LOCAL_NAME_TAKEN_ONLINE_ERROR);
        return;
      }
      const result = await registerPlayer(username);
      if (!result.ok) {
        setFormError(result.error ?? 'Nombre no válido.');
        return;
      }
      setScreen('game');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleClaimLocal = (username: string) => handleRegisterLocalName(username, false);

  const handlePlayLocked = () => {
    if (lockedName === null || isRegistering) return;
    void handleRegisterLocalName(lockedName, true);
  };

  const renderModeSelector = () => (
    <SegmentedToggle
      value={gameMode}
      options={MODE_OPTIONS}
      onChange={setGameMode}
      variant="fill"
      trackAccessibilityLabel="Selector de modo de juego"
    />
  );

  const renderAuthBox = () => {
    if (!auth.isConfigured || auth.isLoading) {
      return null;
    }
    if (auth.user === null) {
      return (
        <View style={styles.authBox}>
          {auth.error !== '' && <Text style={styles.authError}>{auth.error}</Text>}
          <GoogleSignInButton onPress={auth.signInWithGoogle} loading={auth.isSigningIn} />
        </View>
      );
    }
    return (
      <View style={styles.authBox}>
        {auth.error !== '' && <Text style={styles.authError}>{auth.error}</Text>}
        <AppButton
          title="Cerrar sesión"
          accessibilityLabel="Cerrar sesión de Google"
          variant="ghostlight"
          onPress={auth.signOut}
        />
      </View>
    );
  };

  // Contenido del reclamo online (tras login sin nombre): o espera del
  // auto-reclamo o formulario manual como fallback.
  const renderClaimOnlineContent = () =>
    showAutoClaimPending ? (
      <Text style={styles.greeting} testID="claim-auto-claim">
        Reservando tu nombre @{autoClaimName}…
      </Text>
    ) : (
      <UsernameSetup
        error={auth.error}
        isSaving={auth.isClaimingUsername}
        initialUsername={claimSuggestion}
        onClaimUsername={handleClaimOnline}
        onSignOut={auth.signOut}
      />
    );

  // Formulario para darse de alta sin nombre guardado.
  const renderGuestForm = () => (
    <>
      {renderModeSelector()}
      <UsernameSetup
        error={formError}
        isSaving={isRegistering}
        initialUsername=""
        onClaimUsername={handleClaimLocal}
        description="Este será tu nombre de jugador en este dispositivo."
        submitTitle="Jugar"
        submitAccessibilityLabel="Empezar a jugar"
        inputAccessibilityLabel="Nombre del jugador"
      />
    </>
  );

  // Saludo + botón de jugar cuando ya hay nombre guardado.
  const renderWelcomeBack = () =>
    lockedName === null ? null : (
      <>
        <Text style={styles.greeting}>Hola, {lockedName} 😊</Text>
        {formError !== '' && <Text style={styles.formError}>{formError}</Text>}
        {renderModeSelector()}
        <AppButton
          title="Jugar"
          accessibilityLabel="Empezar a jugar"
          disabled={isRegistering}
          onPress={handlePlayLocked}
        />
      </>
    );

  // Solo cambia la zona central: el marco (logo, título, ranking) es común.
  const renderMainContent = () => {
    if (auth.requiresUsername) return renderClaimOnlineContent();
    if (lockedName === null) return renderGuestForm();
    return renderWelcomeBack();
  };

  return (
    <View style={styles.homeScreen}>
      <TopBar />
      <View style={styles.heroLogo}>
        <AppLogo size={112} />
      </View>
      <MainCard>
        <Text style={styles.homeTitle}>Piedra, papel o tijera</Text>
        {renderMainContent()}
        <AppButton
          title="Ranking"
          accessibilityLabel="Ranking"
          variant="secondary"
          onPress={() => setScreen('ranking')}
        />
        {!auth.requiresUsername && renderAuthBox()}
      </MainCard>
    </View>
  );
}
