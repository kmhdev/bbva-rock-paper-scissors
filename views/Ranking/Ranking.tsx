import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import AppButton from '../../components/AppButton/AppButton';
import GoogleSignInButton from '../../components/GoogleSignInButton/GoogleSignInButton';
import MainCard from '../../components/MainCard/MainCard';
import RankingRow from '../../components/RankingRow/RankingRow';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import UsernameSetup from '../../components/UsernameSetup/UsernameSetup';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { useIsMobilePlatform } from '../../hooks/useIsMobilePlatform';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import {
  fetchRemoteScores,
  mergeScores,
  submitOnlineScore,
} from '../../services/supabaseScoreStorage';
import { getScoreService, useGameStore } from '../../store/appStore';
import type { PlayerScore } from '../../types/types';
import {
  getAuthenticatedLocalScore,
  getLocalCurrentScore,
  shouldShowClaim,
  shouldSubmitOnlineScore,
} from './Ranking.helpers';
import { getStyles } from './Ranking.styles';

/** Bonus ranking view: mejor marca por jugador, una sola puntuación. */
export default function RankingView() {
  const { setScreen } = useNavigation();
  const { theme } = useTheme();
  const isMobile = useIsMobilePlatform();
  const styles = getStyles(theme);
  const playerName = useGameStore((state) => state.playerName);
  const lastUsername = useGameStore((state) => state.lastUsername);
  const storeScore = useGameStore((state) => state.score);
  const auth = useSupabaseAuth();
  const [rows, setRows] = useState<PlayerScore[]>([]);
  const [localScores, setLocalScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadRanking = async () => {
      const local = await getScoreService().getAllScores();
      const remote = await fetchRemoteScores();
      if (!cancelled) {
        setLocalScores(local);
        setRows(mergeScores(local, remote));
        setLoading(false);
      }
    };
    void loadRanking();
    return () => {
      cancelled = true;
    };
  }, []);

  const isAuthenticatedWithProfile =
    auth.user !== null && auth.profile !== null && !auth.requiresUsername;

  const localCurrent = useMemo(() => {
    if (isAuthenticatedWithProfile && auth.profile) {
      // Con perfil reclamado la marca actual es la del nombre online;
      // la marca de otro nombre local ("x" vs "y") no se reclama.
      return getAuthenticatedLocalScore(auth.profile.username, playerName, storeScore, localScores);
    }
    return getLocalCurrentScore(playerName, lastUsername, storeScore, localScores);
  }, [playerName, lastUsername, storeScore, localScores, isAuthenticatedWithProfile, auth.profile]);

  const showClaim = shouldShowClaim(localCurrent, auth.isConfigured, isAuthenticatedWithProfile);

  useEffect(() => {
    if (
      isAuthenticatedWithProfile &&
      localCurrent !== null &&
      shouldSubmitOnlineScore(localCurrent, auth.profile?.username ?? null)
    ) {
      void submitOnlineScore(localCurrent.score);
    }
  }, [isAuthenticatedWithProfile, localCurrent, auth.profile]);

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
        ) : (
          <>
            {localCurrent !== null && (
              <View style={styles.currentScoreBox} testID="current-score">
                <Text style={styles.currentScoreTitle}>Tu puntuación actual</Text>
                <Text style={styles.currentScoreLine}>
                  {localCurrent.username}: {localCurrent.score}{' '}
                  {localCurrent.score === 1 ? 'pto' : 'pts'}
                </Text>
              </View>
            )}
            {rows.length === 0 ? (
              <Text style={styles.rankingEmpty}>
                Aún no hay puntuaciones. ¡Sé la primera persona en jugar!
              </Text>
            ) : (
              <View style={styles.rankingList}>
                {rows.map((entry, index) => (
                  <RankingRow
                    key={entry.username.toLowerCase()}
                    position={index + 1}
                    username={entry.username}
                    score={entry.score}
                  />
                ))}
              </View>
            )}
            {showClaim && (
              <View style={styles.claimBox} testID="claim-score-box">
                <Text style={styles.claimText}>Reclama tu puntuación logeándote con Google</Text>
                {auth.error !== '' && <Text style={styles.rankingEmpty}>{auth.error}</Text>}
                {auth.user === null ? (
                  <GoogleSignInButton
                    onPress={auth.signInWithGoogle}
                    loading={auth.isSigningIn}
                    testID="claim-google-button"
                  />
                ) : (
                  <UsernameSetup
                    error={auth.error}
                    isSaving={auth.isClaimingUsername}
                    onClaimUsername={auth.claimUsername}
                    onSignOut={auth.signOut}
                  />
                )}
              </View>
            )}
          </>
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
