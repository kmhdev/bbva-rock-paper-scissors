import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import MainCard from '../components/MainCard/MainCard';
import RankingRow from '../components/RankingRow/RankingRow';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { fetchRemoteScores, mergeScores } from '../services/supabaseScoreStorage';
import { getScoreService, useGameStore } from '../store/appStore';
import type { PlayerScore } from '../types/types';
import { getStyles } from './ranking.styles';

/** Bonus ranking view: best score per registered player (local + online). */
export default function RankingScreen() {
  const { theme } = useTheme();
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
      <View style={styles.topBar}>
        <ThemeToggle />
      </View>
      <MainCard>
        <Text style={styles.rankingTitle}>Ranking</Text>
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
        <Link href={playerName === null ? '/' : '/game'} style={styles.backLink}>
          Volver
        </Link>
      </MainCard>
    </View>
  );
}
