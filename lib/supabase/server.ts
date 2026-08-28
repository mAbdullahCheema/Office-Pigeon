import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import {
  assertSupabaseEnv,
  PERSIST_COOKIE,
  supabasePublishableKey,
  supabaseUrl,
} from './config';
import type { Database } from './types';

/**
 * Drops the expiry when the visitor did not tick "keep me signed in", so the
 * browser discards the session cookies with the window. The session itself
 * still lives server-side and is revoked on sign-out either way.
 */
export function withPersistence<T extends { maxAge?: number; expires?: Date }>(
  options: T | undefined,
  persist: boolean,
): T | undefined {
  if (persist || !options) return options;
  const rest = { ...options };
  delete rest.maxAge;
  delete rest.expires;
  return rest;
}

/**
 * Supabase client for server components, route handlers and server actions.
 *
 * Call it per request — never hoist the result into a module-level constant,
 * because the cookie store it closes over belongs to one request only.
 *
 * Row level security applies, so this is the right client for anything acting
 * on the visitor's own behalf. Use `lib/supabase/admin.ts` only where the code
 * has already decided the caller is allowed.
 */
export async function createClient() {
  assertSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        const persist = cookieStore.get(PERSIST_COOKIE)?.value !== '0';
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, withPersistence(options, persist));
          }
        } catch {
          // Server components cannot set cookies. Safe to ignore: the proxy
          // refreshes the session on every request — see lib/supabase/proxy.ts.
        }
      },
    },
  });
}
