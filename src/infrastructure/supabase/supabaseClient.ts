import { createClient } from '@supabase/supabase-js';
import { clientEnv } from '../env/clientEnv';

export const supabase = createClient(clientEnv.SUPABASE_URL, clientEnv.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export type SupabaseClientType = typeof supabase;
