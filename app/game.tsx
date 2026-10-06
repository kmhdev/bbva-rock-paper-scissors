import { Redirect, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import ChoiceButton from '../components/ChoiceButton/ChoiceButton';
import RoundResult from '../components/RoundResult/RoundResult';
import ScoreBoard from '../components/ScoreBoard/ScoreBoard';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import { MACHINE_REVEAL_DELAY_MS } from '../constants/game.constants';
import { useTheme } from '../context/ThemeContext';
import { getChoicesForMode } from '../services/gameLogicService';
import { randomMachineStrategy, smartMachineStrategy } from '../services/machineStrategies';
import { pushRemoteScore } from '../services/supabaseScoreStorage';
import { useGameStore } from '../store/appStore';
import type { Choice } from '../types/types';
import { vibrateOnLoss } from '../utils/vibration';
import { getStyles } from './game.styles';

/**
 * Game view: intentionally thin. It injects service A (scores, via the
 * store), service B (rules, inside the store) and service C (machine
 * strategies) and orchestrates them with the reveal delay.
 */
export default function GameScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const playerName = useGameStore((state) => state.playerName);
  const score = useGameStore((state) => state.score);
  const gameMode = useGameStore((state) => state.gameMode);
  const smartMachine = useGameStore((state) => state.smartMachine);
  const playerPick = useGameStore((state) => state.playerPick);
  const machinePick = useGameStore((state) => state.machinePick);
  const outcome = useGameStore((state) => state.outcome);
  const machineThinking = useGameStore((state) => state.machineThinking);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (revealTimer.current !== null) {
        clearTimeout(revealTimer.current);
      }
    };
  }, []);

  if (playerName === null) {
    return <Redirect href="/" />;
  }

  const choices = getChoicesForMode(gameMode);

  const handlePick = (pick: Choice) => {
    const store = useGameStore.getState();
    if (store.machineThinking) return;
    store.startRound(pick);
    if (revealTimer.current !== null) {
      clearTimeout(revealTimer.current);
    }
    revealTimer.current = setTimeout(() => {
      const latest = useGameStore.getState();
      const strategy = latest.smartMachine ? smartMachineStrategy : randomMachineStrategy;
      const machineChoice = strategy.pickMove({
        playerHistory: latest.playerHistory,
        machineHistory: latest.machineHistory,
        availableChoices: getChoicesForMode(latest.gameMode),
      });
      void latest.resolveRound(machineChoice).then(() => {
        const settled = useGameStore.getState();
        if (settled.outcome === 'lose') {
          void vibrateOnLoss();
        }
        if (settled.outcome === 'win' && settled.playerName !== null) {
          void pushRemoteScore(settled.playerName, settled.score);
        }
      });
    }, MACHINE_REVEAL_DELAY_MS);
  };

  const handleExit = () => {
    if (revealTimer.current !== null) {
      clearTimeout(revealTimer.current);
    }
    useGameStore.getState().exitToHome();
    router.replace('/');
  };

  return (
    <View style={styles.gameScreen}>
      <View style={styles.topBar}>
        <ThemeToggle />
      </View>
      <ScoreBoard playerName={playerName} score={score} />
      <View style={choices.length > 3 ? styles.choicesRowWrapped : styles.choicesRow}>
        {choices.map((choice) => (
          <ChoiceButton
            key={choice}
            choice={choice}
            selected={playerPick === choice}
            disabled={machineThinking}
            onPress={handlePick}
          />
        ))}
      </View>
      <RoundResult
        playerPick={playerPick}
        machinePick={machinePick}
        thinking={machineThinking}
        outcome={outcome}
      />
      <View style={styles.smartRow}>
        <Text style={styles.smartLabel}>Máquina inteligente</Text>
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Activar máquina inteligente"
          accessibilityState={{ checked: smartMachine }}
          onPress={() => useGameStore.getState().setSmartMachine(!smartMachine)}
          style={[styles.smartToggle, smartMachine && styles.smartToggleOn]}
        >
          <Text style={styles.smartToggleLabel}>{smartMachine ? 'ON' : 'OFF'}</Text>
        </Pressable>
      </View>
      <Pressable
        style={styles.exitButton}
        accessibilityRole="button"
        accessibilityLabel="Salir del juego"
        onPress={handleExit}
      >
        <Text style={styles.exitButtonLabel}>Salir</Text>
      </Pressable>
    </View>
  );
}
