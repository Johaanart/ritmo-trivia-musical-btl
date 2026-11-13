import { useCallback, useEffect, useState } from 'react';
import {
  isSupabaseConfigured,
  requireSupabase,
  supabaseConfigurationError,
} from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError(supabaseConfigurationError);
      setIsLoading(false);
      return undefined;
    }

    let active = true;
    const client = requireSupabase();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    client.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) setError(`No se pudo recuperar la sesión: ${sessionError.message}`);
        setUser(data.session?.user ?? null);
        setIsLoading(false);
      })
      .catch((sessionError) => {
        if (!active) return;
        setError(`No se pudo recuperar la sesión: ${sessionError.message}`);
        setIsLoading(false);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    setIsSubmitting(true);
    setError('');
    try {
      const { error: signInError } = await requireSupabase().auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
    } catch (authError) {
      const message = `No se pudo iniciar sesión: ${authError.message}`;
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signUp = useCallback(async ({ email, password, username }) => {
    setIsSubmitting(true);
    setError('');
    try {
      const { data, error: signUpError } = await requireSupabase().auth.signUp({
        email,
        password,
        options: {
          data: { username: username.trim() },
        },
      });
      if (signUpError) throw signUpError;
      return { requiresEmailConfirmation: !data.session };
    } catch (authError) {
      const message = `No se pudo crear la cuenta: ${authError.message}`;
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError('');
    try {
      const { error: signOutError } = await requireSupabase().auth.signOut();
      if (signOutError) throw signOutError;
      setUser(null);
    } catch (authError) {
      const message = `No se pudo cerrar sesión: ${authError.message}`;
      setError(message);
      throw new Error(message);
    }
  }, []);

  return {
    user,
    isLoading,
    isSubmitting,
    error,
    signIn,
    signUp,
    signOut,
  };
}
