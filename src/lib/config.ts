// Configuración de variables de entorno
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY, // Variable del servidor (no pública)
  },
};

// Función para validar configuración en runtime
export function validateConfig() {
  const errors: string[] = [];
  
  if (!config.supabase.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL no está configurada');
  }
  
  if (!config.supabase.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada');
  }
  
  // Solo validar Google API key en el servidor
  if (typeof window === 'undefined' && !config.google.apiKey) {
    errors.push('GOOGLE_API_KEY no está configurada en el servidor');
  }
  
  if (errors.length > 0) {
    console.error('❌ Errores de configuración:', errors.join(', '));
    return false;
  }
  
  return true;
}

// Función para obtener configuración segura
export function getSafeConfig() {
  return {
    supabase: {
      url: config.supabase.url || '',
      anonKey: config.supabase.anonKey || '',
    },
    google: {
      apiKey: config.google.apiKey || '',
    },
  };
} 