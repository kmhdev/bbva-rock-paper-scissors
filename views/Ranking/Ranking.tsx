import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import AppButton from '../../components/AppButton/AppButton';
import GoogleSignInButton from '../../components/GoogleSignInButton/GoogleSignInButton';
import MainCard from '../../components/MainCard/MainCard';
import RankingRow from '../../components/RankingRow/RankingRow';
import TopBar from '../../components/TopBar/TopBar';
import UsernameSetup from '../../components/UsernameSetup/UsernameSetup';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import {
  fetchRemoteScores,
  mergeScores,
  submitOnlineScore,
} from '../../services/supabaseScoreStorage';
import { ScoreService } from '../../services/scoreService';
import { getScoreService, useGameStore } from '../../store/appStore';
import type { PlayerScore } from '../../types/types';
import {
  getAuthenticatedLocalScore,
  getLocalCurrentScore,
  isLocalCurrentUser,
  shouldShowClaim,
  shouldSubmitOnlineScore,
} from './Ranking.helpers';
import { getStyles } from './Ranking.styles';

/** Bonus ranking view: mejor marca por jugador, una sola puntuación. */
export default function RankingView() {
  const { setScreen } = useNavigation();
  const { theme } = useTheme();
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

  // El nombre local ya se cotejó contra el online al empezar a jugar:
  // tras el login se reclama solo, sin pedir otro nombre. El formulario
  // manual solo queda como fallback (p. ej. si entretanto lo ocuparon).
  // Si el reclamado difiere del local, se mueve su mejor marca local al
  // nombre reclamado para no duplicar usuarios ni perder puntos.
  const claimSuggestion = playerName ?? lastUsername ?? '';
  const handleClaimUsername = useCallback(
    async (username: string) => {
      const localName = useGameStore.getState().playerName ?? useGameStore.getState().lastUsername;
      const result = await auth.claimUsername(username);
      if (!result || !result.ok || !result.profile) return;
      const claimed = result.profile.username;
      useGameStore.getState().rememberOwnedOnlineName(claimed);
      // Solo hay que migrar si el reclamado difiere del local; con el
      // mismo nombre no hay duplicidad y el efecto de submit ya envía
      // la marca sin tocar la sesión en curso.
      if (localName && !ScoreService.isSameUsername(localName, claimed)) {
        const { score: liveScore } = useGameStore.getState();
        await getScoreService().transferScore(localName, claimed, liveScore);
        await useGameStore.getState().registerPlayer(claimed);
        const local = await getScoreService().getAllScores();
        setLocalScores(local);
        setRows(mergeScores(local, await fetchRemoteScores()));
      }
    },
    [auth],
  );

  const autoClaimName = playerName ?? lastUsername ?? null;
  const autoClaimAttemptedRef = useRef<string | null>(null);
  const showAutoClaimPending = auth.requiresUsername && autoClaimName !== null && auth.error === '';
  useEffect(() => {
    if (!showAutoClaimPending || auth.isClaimingUsername) return;
    const attemptKey = `${auth.user?.id ?? ''}:${autoClaimName ?? ''}`;
    if (autoClaimAttemptedRef.current === attemptKey) return;
    autoClaimAttemptedRef.current = attemptKey;
    void handleClaimUsername(autoClaimName ?? '');
  }, [
    showAutoClaimPending,
    auth.isClaimingUsername,
    auth.user,
    autoClaimName,
    handleClaimUsername,
  ]);

  useEffect(() => {
    if (isAuthenticatedWithProfile && auth.profile) {
      // El perfil visto es propio: se recuerda para poder seguir en
      // local con el mismo nombre tras cerrar sesión.
      useGameStore.getState().rememberOwnedOnlineName(auth.profile.username);
    }
  }, [isAuthenticatedWithProfile, auth.profile]);

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
      <TopBar />
      <MainCard>
        <Text testID="ranking-title" style={styles.rankingTitle}>
          Ranking
        </Text>
        {loading ? (
          <Text style={styles.rankingLoading}>Cargando puntuaciones…</Text>
        ) : (
          <>
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
                    isCurrentUser={isLocalCurrentUser(entry.username, localCurrent?.username)}
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
                ) : showAutoClaimPending ? (
                  <Text style={styles.rankingLoading} testID="claim-auto-claim">
                    Reservando tu nombre @{autoClaimName}…
                  </Text>
                ) : (
                  <UsernameSetup
                    error={auth.error}
                    isSaving={auth.isClaimingUsername}
                    initialUsername={claimSuggestion}
                    onClaimUsername={handleClaimUsername}
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
