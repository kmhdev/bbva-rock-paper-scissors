import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import {
  claimUsername as claimUsernameService,
  fetchProfile,
  getSupabaseClient,
} from '../services/supabaseScoreStorage';
import type { SupabaseAuthState, UserProfile } from '../types/types';

type AuthStatus = 'idle' | 'loading' | 'ready' | 'unconfigured';
type ProfileStatus = 'idle' | 'loading' | 'ready';

/**
 * Auth con Google vía Supabase, portado de espanografia (`useSupabaseAuth`)
 * adaptado a Expo web (desktop y móvil). En nativo el login no está
 * soportado: el ranking sigue funcionando offline con las marcas locales.
 *
 * El nombre online se reclama una sola vez (perfiles inmutables): mientras
 * `requiresUsername` sea true la app debe pedirlo con UsernameSetup.
 *
 * Requiere en Supabase Dashboard: Authentication > Providers > Google
 * habilitado, más Site URL / Redirect URLs con el origen de la web.
 */
export function useSupabaseAuth(): SupabaseAuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('idle');
  const [isClaimingUsername, setIsClaimingUsername] = useState(false);
  const userId = session?.user.id;
  const activeProfile = profile?.user_id === userId ? profile : null;

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setStatus('unconfigured');
      return;
    }
    let isMounted = true;
    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isMounted) return;
      if (sessionError) {
        setError(sessionError.message);
      }
      setSession(data.session);
      setStatus('ready');
    });
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsSigningIn(false);
      setStatus('ready');
    });
    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setProfileStatus('idle');
      return;
    }
    let isMounted = true;
    setProfileStatus('loading');
    void fetchProfile(userId).then((nextProfile) => {
      if (!isMounted) return;
      setProfile(nextProfile);
      setProfileStatus('ready');
    });
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const signInWithGoogle = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) return;
    if (Platform.OS !== 'web') {
      setError('El login con Google solo está disponible en la versión web.');
      return;
    }
    setError('');
    setIsSigningIn(true);
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error: signInError } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (signInError) {
      setIsSigningIn(false);
      setError(signInError.message);
    }
    // Sin error el navegador redirige a Google; al volver,
    // onAuthStateChange actualiza la sesión y apaga isSigningIn.
  }, []);

  const signOut = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) return;
    setError('');
    const { error: signOutError } = await client.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
    }
  }, []);

  const claimUsername = useCallback(async (username: string) => {
    const client = getSupabaseClient();
    if (!client) return;
    setError('');
    setIsClaimingUsername(true);
    const result = await claimUsernameService(username);
    setIsClaimingUsername(false);
    if (!result.ok) {
      setError(result.error ?? 'No se pudo reservar el nombre.');
      return;
    }
    if (result.profile) {
      setProfile(result.profile);
    }
  }, []);

  return {
    user: session?.user ?? null,
    session,
    profile: activeProfile,
    requiresUsername: Boolean(userId && profileStatus === 'ready' && !activeProfile),
    isClaimingUsername,
    isConfigured: status !== 'unconfigured',
    isLoading: status === 'loading' || Boolean(userId && profileStatus !== 'ready'),
    isSigningIn,
    error,
    claimUsername,
    signInWithGoogle,
    signOut,
  };
}
