import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import {
  assertSupabaseEnv,
  PERSIST_COOKIE,
  supabasePublishableKey,
  supabaseUrl,
} from './config';
import { withPersistence } from './server';
import type { Database } from './types';

/**
 * Refreshes an expiring Supabase session and writes the rotated cookies onto
 * the outgoing response.
 *
 * Server components cannot set cookies, so this is the only place a refreshed
 * token actually reaches the browser. It runs on every matched request.
 *
 * Returns the response to send *and* whether anyone is signed in, so the caller
 * can decide about redirects without asking Supabase a second time.
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  userId: string | null;
}> {
  assertSupabaseEnv();

  const persist = request.cookies.get(PERSIST_COOKIE)?.value !== '0';
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, withPersistence(options, persist));
        }
      },
    },
  });

  // Touching the user is what triggers the refresh. Do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, userId: user?.id ?? null };
}
