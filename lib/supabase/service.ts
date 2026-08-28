import { createClient } from '@supabase/supabase-js';

import { assertSupabaseEnv, supabaseSecretKey, supabaseUrl } from './config';
import type { Database } from './types';

/**
 * Builds a client holding the secret key. Row level security does not apply to
 * it, so the caller is responsible for deciding who is allowed.
 *
 * Deliberately without the `server-only` guard that `./admin.ts` carries: that
 * guard throws under plain Node, which would lock the maintenance scripts out
 * of the one client they exist to use. The guard belongs on the module the app
 * imports, not on the factory underneath it — so the app keeps its protection
 * and `npm run db:seed` still runs.
 *
 * Nothing inside `app/` should import this. Import `./admin.ts`.
 */
export function createServiceClient() {
  assertSupabaseEnv();
  return createClient<Database>(supabaseUrl, supabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
