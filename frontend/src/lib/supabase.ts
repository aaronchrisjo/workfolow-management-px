import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'FATAL: VITE_SUPABASE_URL is missing. Ensure .env file exists in frontend/ and contains VITE_SUPABASE_URL.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'FATAL: VITE_SUPABASE_ANON_KEY is missing. Ensure .env file exists in frontend/ and contains VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
