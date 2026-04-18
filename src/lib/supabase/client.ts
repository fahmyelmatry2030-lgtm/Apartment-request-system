import { createClient } from '@supabase/supabase-js';

let browserClient: any = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
     console.error('[SUPABASE] ❌ Missing public environment variables! Using local mock fallback.');
     if (typeof window !== 'undefined') {
         console.warn('%c DATABASE OFFLINE: Environment variables missing on Vercel.', 'background: red; color: white; padding: 10px;');
     }
     return null;
  }

  browserClient = createClient(supabaseUrl, supabaseKey);
  return browserClient;
}
