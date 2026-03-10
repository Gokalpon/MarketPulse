// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export function useSupabase() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfileExists(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfileExists(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureProfileExists = async (u: any) => {
    try {
      const { data, error } = await supabase.from('users').select('id').eq('id', u.id).single();
      if (!data) {
        await supabase.from('users').insert({
          id: u.id,
          username: u.user_metadata?.name || u.email?.split('@')[0] || 'User',
          email: u.email
        });
      }
    } catch(err) { console.error('Error ensuring profile', err); }
  };

  const loginGoogle = () => supabase.auth.signInWithOAuth({ provider: 'google' });
  const loginApple = () => supabase.auth.signInWithOAuth({ provider: 'apple' });
  const logout = () => supabase.auth.signOut();

  return { session, user, loginGoogle, loginApple, logout };
}
