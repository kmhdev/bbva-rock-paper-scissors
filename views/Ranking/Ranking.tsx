import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import AppButton from '../../components/AppButton/AppButton';
import GoogleSignInButton from '../../components/GoogleSignInButton/GoogleSignInButton';
import MainCard from '../../components/MainCard/MainCard';
import RankingRow from '../../components/RankingRow/RankingRow';
import TopBar from '../../components/TopBar/TopBar';
import UsernameSetup from '../../components/UsernameSetup/UsernameSetup';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { useOnlineClaim } from '../../hooks/useOnlineClaim';
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
  isLocalCurrentUser,
  shouldShowClaim,
  shouldSubmitOnlineScore,
} from './Ranking.helpers';
import { getStyles } from './Ranking.styles';

/** Vista bonus de ranking: mejor marca por jugador, una sola puntuación. */
export default function RankingView() {
  const { setScreen } = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const storeScore = useGameStore((state) => state.score);
  const [rows, setRows] = useState<PlayerScore[]>([]);
  const [localScores, setLocalScores] = useState<PlayerScore[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshScores = useCallback(async () => {
    const local = await getScoreService().getAllScores();
    setLocalScores(local);
    setRows(mergeScores(local, await fetchRemoteScores()));
  }, []);

  const {
    auth,
    playerName,
    lastUsername,
    hasOnlineIdentity: isAuthenticatedWithProfile,
    autoClaimName,
    showAutoClaimPending,
    handleClaimUsername,
  } = useOnlineClaim({ afterMigration: refreshScores });

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
  const claimSuggestion = playerName ?? lastUsername ?? '';

  useEffect(() => {
    if (
      isAuthenticatedWithProfile &&
      localCurrent !== null &&
      shouldSubmitOnlineScore(localCurrent, auth.profile?.username ?? null)
    ) {
      void submitOnlineScore(localCurrent.score);
    }
  }, [isAuthenticatedWithProfile, localCurrent, auth.profile]);

  // Lista de marcas: vacío amable o filas del ranking.
  const renderRankingList = () => {
    if (rows.length === 0) {
      return (
        <Text style={styles.rankingEmpty}>
          Aún no hay puntuaciones. ¡Sé la primera persona en jugar!
        </Text>
      );
    }
    return (
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
    );
  };

  // Reclamo de la marca local vía Google: botón, espera o formulario.
  const renderClaimContent = () => {
    if (auth.user === null) {
      return (
        <GoogleSignInButton
          onPress={auth.signInWithGoogle}
          loading={auth.isSigningIn}
          testID="claim-google-button"
        />
      );
    }
    if (showAutoClaimPending) {
      return (
        <Text style={styles.rankingLoading} testID="claim-auto-claim">
          Reservando tu nombre @{autoClaimName}…
        </Text>
      );
    }
    return (
      <UsernameSetup
        error={auth.error}
        isSaving={auth.isClaimingUsername}
        initialUsername={claimSuggestion}
        onClaimUsername={handleClaimUsername}
        onSignOut={auth.signOut}
      />
    );
  };

  const renderClaimBox = () => {
    if (!showClaim) return null;
    return (
      <View style={styles.claimBox} testID="claim-score-box">
        <Text style={styles.claimText}>Reclama tu puntuación logeándote con Google</Text>
        {auth.error !== '' && <Text style={styles.rankingEmpty}>{auth.error}</Text>}
        {renderClaimContent()}
      </View>
    );
  };

  // Contenido bajo el título: carga, o lista + reclamo.
  const renderRankingContent = () => {
    if (loading) {
      return <Text style={styles.rankingLoading}>Cargando puntuaciones…</Text>;
    }
    return (
      <>
        {renderRankingList()}
        {renderClaimBox()}
      </>
    );
  };

  return (
    <View style={styles.rankingScreen}>
      <TopBar />
      <MainCard>
        <Text testID="ranking-title" style={styles.rankingTitle}>
          Ranking
        </Text>
        {renderRankingContent()}
        <AppButton
          title="Volver"
          accessibilityLabel="Volver"
          onPress={() => setScreen(playerName === null ? 'home' : 'game')}
        />
      </MainCard>
    </View>
  );
}
