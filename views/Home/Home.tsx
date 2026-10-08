import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import AppButton from '../../components/AppButton/AppButton';
import AppLogo from '../../components/AppLogo/AppLogo';
import GoogleSignInButton from '../../components/GoogleSignInButton/GoogleSignInButton';
import SegmentedToggle from '../../components/SegmentedToggle/SegmentedToggle';
import UsernameSetup from '../../components/UsernameSetup/UsernameSetup';
import MainCard from '../../components/MainCard/MainCard';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { useIsMobilePlatform } from '../../hooks/useIsMobilePlatform';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
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

/** Home view: default screen. Registers the player and starts the game. */
export default function HomeView() {
  const { setScreen } = useNavigation();
  const { theme } = useTheme();
  const isMobile = useIsMobilePlatform();
  const styles = getStyles(theme);
  const playerName = useGameStore((state) => state.playerName);
  const lastUsername = useGameStore((state) => state.lastUsername);
  const gameMode = useGameStore((state) => state.gameMode);
  const setGameMode = useGameStore((state) => state.setGameMode);
  const registerPlayer = useGameStore((state) => state.registerPlayer);
  const clearLastUsername = useGameStore((state) => state.clearLastUsername);
  const [formError, setFormError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const auth = useSupabaseAuth();

  const claimedUsername = auth.profile?.username ?? null;
  const hasOnlineIdentity = auth.user !== null && auth.profile !== null && !auth.requiresUsername;

  useEffect(() => {
    if (playerName === null) return;
    // Username único: con perfil reclamado la sesión local debe ser el
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

  const handleClaimLocal = async (username: string) => {
    setFormError('');
    setIsRegistering(true);
    try {
      const remote = await fetchRemoteScores();
      if (isUsernameTakenOnline(username, remote, claimedUsername)) {
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

  const handlePlayLocked = async () => {
    if (lockedName === null || isRegistering) return;
    setFormError('');
    setIsRegistering(true);
    try {
      const remote = await fetchRemoteScores();
      if (isUsernameTakenOnline(lockedName, remote, claimedUsername)) {
        clearLastUsername();
        setFormError(LOCAL_NAME_TAKEN_ONLINE_ERROR);
        return;
      }
      const result = await registerPlayer(lockedName);
      if (!result.ok) {
        setFormError(result.error ?? 'Nombre no válido.');
        return;
      }
      setScreen('game');
    } finally {
      setIsRegistering(false);
    }
  };

  if (auth.requiresUsername) {
    return (
      <View style={styles.homeScreen}>
        {!isMobile && (
          <View style={styles.topBar}>
            <ThemeToggle />
          </View>
        )}
        <View style={styles.heroLogo}>
          <AppLogo size={112} />
        </View>
        <MainCard>
          <Text style={styles.homeTitle}>Piedra, papel o tijera</Text>
          <UsernameSetup
            error={auth.error}
            isSaving={auth.isClaimingUsername}
            initialUsername={getGoogleNameSuggestion(auth.user)}
            onClaimUsername={auth.claimUsername}
            onSignOut={auth.signOut}
          />
          <AppButton
            title="Ranking"
            accessibilityLabel="Ranking"
            variant="secondary"
            onPress={() => setScreen('ranking')}
          />
        </MainCard>
      </View>
    );
  }

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

  if (lockedName === null) {
    return (
      <View style={styles.homeScreen}>
        {!isMobile && (
          <View style={styles.topBar}>
            <ThemeToggle />
          </View>
        )}
        <View style={styles.heroLogo}>
          <AppLogo size={112} />
        </View>
        <MainCard>
          <Text style={styles.homeTitle}>Piedra, papel o tijera</Text>
          <SegmentedToggle
            value={gameMode}
            options={MODE_OPTIONS}
            onChange={setGameMode}
            variant="fill"
            trackAccessibilityLabel="Selector de modo de juego"
          />
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
          <AppButton
            title="Ranking"
            accessibilityLabel="Ranking"
            variant="secondary"
            onPress={() => setScreen('ranking')}
          />
          {renderAuthBox()}
        </MainCard>
      </View>
    );
  }

  return (
    <View style={styles.homeScreen}>
      {!isMobile && (
        <View style={styles.topBar}>
          <ThemeToggle />
        </View>
      )}
      <View style={styles.heroLogo}>
        <AppLogo size={112} />
      </View>
      <MainCard>
        <Text style={styles.homeTitle}>Piedra, papel o tijera</Text>
        <Text style={styles.greeting}>Hola, {lockedName} 😊</Text>
        {formError !== '' && <Text style={styles.formError}>{formError}</Text>}
        <SegmentedToggle
          value={gameMode}
          options={MODE_OPTIONS}
          onChange={setGameMode}
          variant="fill"
          trackAccessibilityLabel="Selector de modo de juego"
        />
        <AppButton
          title="Jugar"
          accessibilityLabel="Empezar a jugar"
          disabled={isRegistering}
          onPress={handlePlayLocked}
        />
        <AppButton
          title="Ranking"
          accessibilityLabel="Ranking"
          variant="secondary"
          onPress={() => setScreen('ranking')}
        />
        {renderAuthBox()}
      </MainCard>
    </View>
  );
}
