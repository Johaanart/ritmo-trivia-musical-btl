import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function validateSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return 'Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para conectar Supabase.';
  }

  try {
    const parsedUrl = new URL(supabaseUrl);
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      throw new Error();
    }
  } catch {
    return 'VITE_SUPABASE_URL debe ser una URL válida que empiece con https:// o http://.';
  }

  return '';
}

export const supabaseConfigurationError = validateSupabaseConfig();
export const isSupabaseConfigured = !supabaseConfigurationError;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function requireSupabase() {
  if (!supabase) {
    throw new Error(supabaseConfigurationError || 'La conexión con Supabase no está disponible.');
  }
  return supabase;
}
