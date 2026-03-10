// @ts-nocheck
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const createMockQuery = (data = null) => {
  const query = {
    select: () => query,
    eq: () => query,
    single: () => Promise.resolve({ data, error: null }),
    order: () => query,
    limit: () => query,
    insert: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null }),
    then: (fn) => Promise.resolve({ data, error: null }).then(fn),
    catch: (fn) => Promise.resolve({ data, error: null }).catch(fn)
  };
  return query;
};

let supabaseInstance;
try {
  if (supabaseUrl && supabaseAnonKey && typeof supabaseUrl === 'string' && supabaseUrl.startsWith('http')) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn("Supabase credentials missing or invalid. Using mock.");
    supabaseInstance = {
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: async () => ({ data: { session: null } }),
        signInWithOAuth: () => Promise.resolve({ error: null }),
        signOut: () => Promise.resolve({ error: null })
      },
      from: () => createMockQuery()
    };
  }
} catch (e) {
  console.error("Failed to initialize Supabase client", e);
  supabaseInstance = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: async () => ({ data: { session: null } }),
      signInWithOAuth: () => Promise.resolve({ error: null }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => createMockQuery()
  };
}

export const supabase = supabaseInstance;
