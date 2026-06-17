import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Lazy singleton — created only on first call, which is always inside useEffect (client-side).
// This avoids calling createClient() at module-load time during SSR prerendering,
// where NEXT_PUBLIC_ env vars may be undefined.
let _client: SupabaseClient | undefined;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}
