import { useEffect } from 'react';
import { View } from 'react-native';
import AppButton from '../../components/AppButton/AppButton';
import ChoiceButton from '../../components/ChoiceButton/ChoiceButton';
import SegmentedToggle from '../../components/SegmentedToggle/SegmentedToggle';
import MainCard from '../../components/MainCard/MainCard';
import RoundResult from '../../components/RoundResult/RoundResult';
import ScoreBoard from '../../components/ScoreBoard/ScoreBoard';
import TopBar from '../../components/TopBar/TopBar';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import { getChoicesForMode } from '../../services/gameLogicService';
import { useGameStore } from '../../store/appStore';
import { HARD_MODE_OPTIONS, shouldForceExitToHome, useGameRound } from './Game.helpers';
import { getStyles, resolveChoicesRowStyle } from './Game.styles';

/**
 * Vista Game: intencionadamente fina. Inyecta el servicio A (puntos, vía el
 * store), el servicio B (reglas, dentro del store) y el servicio C
 * (estrategias de la máquina) y los orquesta con el retardo de revelado.
 */
export default function GameView() {
  const { setScreen } = useNavigation();
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
  const auth = useSupabaseAuth();
  const claimedUsername = auth.profile?.username ?? null;
  const hasOnlineIdentity = auth.user !== null && auth.profile !== null && !auth.requiresUsername;
  const { handlePick, handleExit } = useGameRound({
    hasOnlineIdentity,
    claimedUsername,
    onExit: () => setScreen('home'),
  });

  useEffect(() => {
    if (playerName === null) {
      setScreen('home');
    }
  }, [playerName, setScreen]);

  // Nombre de usuario único: con perfil reclamado no se puede jugar como otro
  // nombre local ("x"); la marca de "x" nunca debe enviarse como "y".
  useEffect(() => {
    if (shouldForceExitToHome(hasOnlineIdentity, claimedUsername, playerName)) {
      useGameStore.getState().exitToHome();
      setScreen('home');
    }
  }, [hasOnlineIdentity, claimedUsername, playerName, setScreen]);

  if (playerName === null) {
    return null;
  }

  const choices = getChoicesForMode(gameMode);

  const renderChoicesRow = () => (
    <View style={resolveChoicesRowStyle(styles, choices.length)}>
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
  );

  return (
    <View style={styles.gameScreen}>
      <TopBar />
      <MainCard>
        <ScoreBoard score={score} />
        <RoundResult
          playerPick={playerPick}
          machinePick={machinePick}
          thinking={machineThinking}
          outcome={outcome}
        />
        {renderChoicesRow()}
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
