import { createBrowserClient } from '@supabase/ssr';

import { assertSupabaseEnv, supabasePublishableKey, supabaseUrl } from './config';
import type { Database } from './types';

/**
 * Supabase client for client components. Reads the session from cookies, so it
 * sees the same signed-in person the server does.
 *
 * This is also what Realtime subscribes with: the socket carries the visitor's
 * own token, and row level security decides which changes reach them.
 */
export function createClient() {
  assertSupabaseEnv();
  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
}
