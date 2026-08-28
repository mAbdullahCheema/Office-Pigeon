import 'server-only';

import { createServiceClient } from './service';

/**
 * Supabase client holding the secret key.
 *
 * Row level security does not apply to it, so reach for this only in route
 * handlers and server actions that have already decided the caller is allowed.
 * Everything acting on a visitor's own behalf should use `./server.ts`.
 *
 * One instance for the whole process: the client carries only the URL and the
 * key — nothing per-request — so rebuilding it per call bought nothing and cost
 * an allocation on every one of the dozens of reads a page makes.
 */
let shared: ReturnType<typeof createServiceClient> | null = null;

export function admin() {
  shared ??= createServiceClient();
  return shared;
}
