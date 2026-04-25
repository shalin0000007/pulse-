import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a dummy client that won't crash during build
    // Real calls will fail gracefully at runtime
    console.warn('Supabase env vars not set — using placeholder');
    _supabase = createClient('https://placeholder.supabase.co', 'placeholder');
    return _supabase;
  }

  _supabase = createClient(url, key);
  return _supabase;
}

// Lazy-initialized client (safe during build)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as Record<string | symbol, unknown>)[prop];
  },
});

// Server-side Supabase client
export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(url || 'https://placeholder.supabase.co', serviceKey || anonKey || 'placeholder');
}
