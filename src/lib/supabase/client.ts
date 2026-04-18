import { createClient } from '@supabase/supabase-js';

let browserClient: any = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
     return null;
  }

  browserClient = createClient(supabaseUrl, supabaseKey);
  return browserClient;
}
