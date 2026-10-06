import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import AppButton from '../../components/AppButton/AppButton';
import MainCard from '../../components/MainCard/MainCard';
import RankingRow from '../../components/RankingRow/RankingRow';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { useIsMobilePlatform } from '../../hooks/useIsMobilePlatform';
import { fetchRemoteScores, mergeScores } from '../../services/supabaseScoreStorage';
import { getScoreService, useGameStore } from '../../store/appStore';
import type { PlayerScore } from '../../types/types';
import { getStyles } from './Ranking.styles';

/** Bonus ranking view: best score per registered player (local + online). */
export default function RankingView() {
  const { setScreen } = useNavigation();
  const { theme } = useTheme();
  const isMobile = useIsMobilePlatform();
  const styles = getStyles(theme);
  const playerName = useGameStore((state) => state.playerName);
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadRanking = async () => {
      const local = await getScoreService().getAllScores();
      const remote = await fetchRemoteScores();
      if (!cancelled) {
        setScores(mergeScores(local, remote));
        setLoading(false);
      }
    };
    void loadRanking();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.rankingScreen}>
      {!isMobile && (
        <View style={styles.topBar}>
          <ThemeToggle />
        </View>
      )}
      <MainCard>
        <Text testID="ranking-title" style={styles.rankingTitle}>
          Ranking
        </Text>
        {loading ? (
          <Text style={styles.rankingLoading}>Cargando puntuaciones…</Text>
        ) : scores.length === 0 ? (
          <Text style={styles.rankingEmpty}>
            Aún no hay puntuaciones. ¡Sé la primera persona en jugar!
          </Text>
        ) : (
          <View style={styles.rankingList}>
            {scores.map((entry, index) => (
              <RankingRow
                key={entry.username.toLowerCase()}
                position={index + 1}
                username={entry.username}
                score={entry.score}
              />
            ))}
          </View>
        )}
        <AppButton
          title="Volver"
          accessibilityLabel="Volver"
          onPress={() => setScreen(playerName === null ? 'home' : 'game')}
        />
      </MainCard>
    </View>
  );
}
