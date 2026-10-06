import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import AppButton from '../../components/AppButton/AppButton';
import SegmentedToggle from '../../components/SegmentedToggle/SegmentedToggle';
import MainCard from '../../components/MainCard/MainCard';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { useIsMobilePlatform } from '../../hooks/useIsMobilePlatform';
import { useGameStore } from '../../store/appStore';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import type { GameMode, SegmentedToggleOption } from '../../types/types';
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
  const gameMode = useGameStore((state) => state.gameMode);
  const setGameMode = useGameStore((state) => state.setGameMode);
  const registerPlayer = useGameStore((state) => state.registerPlayer);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (playerName !== null) {
      setScreen('game');
    }
  }, [playerName, setScreen]);

  const handleStart = async () => {
    const result = await registerPlayer(name);
    if (!result.ok) {
      setFormError(result.error ?? 'Nombre no válido.');
      return;
    }
    setFormError(null);
    setScreen('game');
  };

  return (
    <View style={styles.homeScreen}>
      {!isMobile && (
        <View style={styles.topBar}>
          <ThemeToggle />
        </View>
      )}
      <MainCard>
        <Text style={styles.homeTitle}>Piedra, papel o tijera</Text>
        <Text style={styles.homeSubtitle}>Introduce tu nombre para jugar</Text>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
          placeholderTextColor={theme.textMuted}
          accessibilityLabel="Nombre del jugador"
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={handleStart}
        />
        {formError !== null && <Text style={styles.formError}>{formError}</Text>}
        <SegmentedToggle
          value={gameMode}
          options={MODE_OPTIONS}
          onChange={setGameMode}
          variant="fill"
          trackAccessibilityLabel="Selector de modo de juego"
        />
        <AppButton title="Jugar" accessibilityLabel="Empezar a jugar" onPress={handleStart} />
        <AppButton
          title="Ver ranking"
          accessibilityLabel="Ver ranking"
          variant="ghostlight"
          onPress={() => setScreen('ranking')}
        />
      </MainCard>
    </View>
  );
}
