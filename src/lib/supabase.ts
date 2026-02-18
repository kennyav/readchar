import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const environment = import.meta.env.VITE_ENVIRONMENT;
export const isAuthEnabled = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(
  supabaseUrl ?? environment.VITE_SUPABASE_URL,
  supabaseAnonKey ?? environment.VITE_SUPABASE_ANON_KEY
);
