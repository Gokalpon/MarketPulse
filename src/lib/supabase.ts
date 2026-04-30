import { createClient } from '@supabase/supabase-js';

// iOS App için Env bazlı konfigürasyon (Vite standartları)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Resilient initialization: Don't crash if env vars are missing
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : ({
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => ({ data: [], error: null }),
            eq: () => ({ data: [], error: null }),
            maybeSingle: () => ({ data: null, error: null })
          }),
          eq: () => ({
            order: () => ({ limit: () => ({ data: [], error: null }) }),
            maybeSingle: () => ({ data: null, error: null })
          })
        }),
        insert: () => ({ error: null }),
        upsert: () => ({ error: null }),
        delete: () => ({ eq: () => ({ error: null }) })
      }),
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async () => ({ data: { user: null }, error: new Error("Supabase env missing") }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null })
      }
    } as any);

// Tip güvenliği için App Insights standardı
export type MarketInsight = {
  id: string;
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  last_update: string;
};
