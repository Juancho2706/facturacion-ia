import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  if (typeof window !== 'undefined') {
    console.log('Supabase URL defined:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase Key defined:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  )
}