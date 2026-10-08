import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import AppButton from '../../components/AppButton/AppButton';
import ChoiceButton from '../../components/ChoiceButton/ChoiceButton';
import SegmentedToggle from '../../components/SegmentedToggle/SegmentedToggle';
import MainCard from '../../components/MainCard/MainCard';
import RoundResult from '../../components/RoundResult/RoundResult';
import ScoreBoard from '../../components/ScoreBoard/ScoreBoard';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { MACHINE_REVEAL_DELAY_MS } from '../../constants/game.constants';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { useIsMobilePlatform } from '../../hooks/useIsMobilePlatform';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { getChoicesForMode } from '../../services/gameLogicService';
import { randomMachineStrategy, smartMachineStrategy } from '../../services/machineStrategies';
import { submitOnlineScore } from '../../services/supabaseScoreStorage';
import { useGameStore } from '../../store/appStore';
import type { Choice, SegmentedToggleOption } from '../../types/types';
import { vibrateOnLoss } from '../../utils/vibration';
import { getStyles } from './Game.styles';

type HardModeValue = 'off' | 'on';

const HARD_MODE_OPTIONS: ReadonlyArray<SegmentedToggleOption<HardModeValue>> = [
  { value: 'off', label: 'OFF', accessibilityLabel: 'Desactivar máquina inteligente' },
  { value: 'on', label: 'ON', accessibilityLabel: 'Activar máquina inteligente' },
];

/**
 * Game view: intentionally thin. It injects service A (scores, via the
 * store), service B (rules, inside the store) and service C (machine
 * strategies) and orchestrates them with the reveal delay.
 */
export default function GameView() {
  const { setScreen } = useNavigation();
  const { theme } = useTheme();
  const isMobile = useIsMobilePlatform();
  const styles = getStyles(theme);
  const playerName = useGameStore((state) => state.playerName);
  const score = useGameStore((state) => state.score);
  const gameMode = useGameStore((state) => state.gameMode);
  const smartMachine = useGameStore((state) => state.smartMachine);
  const playerPick = useGameStore((state) => state.playerPick);
  const machinePick = useGameStore((state) => state.machinePick);
  const outcome = useGameStore((state) => state.outcome);
  const machineThinking = useGameStore((state) => state.machineThinking);
  const auth = useSupabaseAuth();
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (revealTimer.current !== null) {
        clearTimeout(revealTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (playerName === null) {
      setScreen('home');
    }
  }, [playerName, setScreen]);

  if (playerName === null) {
    return null;
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
          // El servidor resuelve el nombre desde el perfil reclamado;
          // sin login o sin perfil la marca queda solo en local.
          if (auth.user !== null && auth.profile !== null && !auth.requiresUsername) {
            void submitOnlineScore(settled.score);
          }
        }
      });
    }, MACHINE_REVEAL_DELAY_MS);
  };

  const handleExit = () => {
    if (revealTimer.current !== null) {
      clearTimeout(revealTimer.current);
    }
    useGameStore.getState().exitToHome();
    setScreen('home');
  };

  return (
    <View style={styles.gameScreen}>
      {!isMobile && (
        <View style={styles.topBar}>
          <ThemeToggle />
        </View>
      )}
      <MainCard>
        <ScoreBoard score={score} />
        <RoundResult
          playerPick={playerPick}
          machinePick={machinePick}
          thinking={machineThinking}
          outcome={outcome}
        />
        <View style={choices.length > 3 ? styles.choicesRowWrapped : styles.choicesRow}>
          {choices.map((choice) => (
            <ChoiceButton
              key={choice}
              choice={choice}
              selected={playerPick === choice && outcome === null}
              disabled={machineThinking}
              onPress={handlePick}
            />
          ))}
        </View>
        <SegmentedToggle
          value={smartMachine ? 'on' : 'off'}
          options={HARD_MODE_OPTIONS}
          onChange={(next) => useGameStore.getState().setSmartMachine(next === 'on')}
          variant="compact"
          topLabel="Hard mode"
          disabled={machineThinking}
        />
        <AppButton title="Salir" accessibilityLabel="Salir del juego" onPress={handleExit} />
      </MainCard>
    </View>
  );
}
