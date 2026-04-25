import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (uses service key if available, falls back to anon)
export function getServerSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  return createClient(supabaseUrl, serviceKey || supabaseAnonKey);
}
