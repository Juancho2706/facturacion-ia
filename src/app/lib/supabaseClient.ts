import { createClient } from '@supabase/supabase-js';
import { getSafeConfig } from '@/lib/config';

const config = getSafeConfig();

// Solo validar en runtime, no durante el build
if (typeof window !== 'undefined') {
  if (!config.supabase.url) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL no está configurada en las variables de entorno');
    console.error('Asegúrate de tener un archivo .env.local con NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url');
  }
  if (!config.supabase.anonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada en las variables de entorno');
    console.error('Asegúrate de tener un archivo .env.local con NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key');
  }
}

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
