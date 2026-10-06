import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { useGameStore } from '../store/appStore';
import type { GameMode } from '../types/types';
import { getStyles } from './index.styles';

const MODE_OPTIONS: Array<{ mode: GameMode; label: string }> = [
  { mode: 'classic', label: 'Clásico (3)' },
  { mode: 'extended', label: 'Lagarto-Spock (5)' },
];

/** Home view: default route. Registers the player and starts the game. */
export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const playerName = useGameStore((state) => state.playerName);
  const gameMode = useGameStore((state) => state.gameMode);
  const setGameMode = useGameStore((state) => state.setGameMode);
  const registerPlayer = useGameStore((state) => state.registerPlayer);
  const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (playerName !== null) {
      router.replace('/game');
    }
  }, [playerName, router]);

  const handleStart = async () => {
    const result = await registerPlayer(name);
    if (!result.ok) {
      setFormError(result.error ?? 'Nombre no válido.');
      return;
    }
    setFormError(null);
    router.replace('/game');
  };

  return (
    <View style={styles.homeScreen}>
      <View style={styles.topBar}>
        <ThemeToggle />
      </View>
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
      <View style={styles.modeRow}>
        {MODE_OPTIONS.map((option) => (
          <Pressable
            key={option.mode}
            accessibilityRole="radio"
            accessibilityState={{ checked: gameMode === option.mode }}
            accessibilityLabel={`Modo ${option.label}`}
            onPress={() => setGameMode(option.mode)}
            style={[styles.modeOption, gameMode === option.mode && styles.modeOptionChecked]}
          >
            <Text style={styles.modeOptionLabel}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        style={styles.startButton}
        accessibilityRole="button"
        accessibilityLabel="Empezar a jugar"
        onPress={handleStart}
      >
        <Text style={styles.startButtonLabel}>Jugar</Text>
      </Pressable>
      <Link href="/ranking" style={styles.rankingLink}>
        Ver ranking
      </Link>
    </View>
  );
}
