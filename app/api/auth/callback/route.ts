import { NextResponse } from 'next/server';

import { claimOrdersForUser } from '@/lib/data';
import { rateLimit } from '@/lib/rate-limit';
import { safeRedirect } from '@/lib/redirect-target';
import { clientIp } from '@/lib/request';
import { routes } from '@/lib/routes';
import { siteUrl } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

function bounce(reason: string) {
  return NextResponse.redirect(new URL(`${routes.login}?error=${reason}`, siteUrl));
}

/**
 * Completes any Supabase auth round trip: Google sign-in, an email
 * confirmation, or a password-recovery link.
 *
 * Supabase appends a single-use `code`; exchanging it writes the session
 * cookies. The exchange also verifies the PKCE verifier this browser stored on
 * the way out, so a replayed or forged callback fails here rather than signing
 * anybody in.
 */
export async function GET(request: Request) {
  const limit = await rateLimit('auth', clientIp(request) ?? 'unknown');
  if (!limit.ok) return bounce('rate');

  const params = new URL(request.url).searchParams;
  const code = params.get('code');

  // Supabase reports a refused or cancelled consent this way.
  if (params.get('error')) {
    console.error('[auth] provider returned an error:', params.get('error_description'));
    return bounce('oauth');
  }

  if (!code) return bounce('oauth');

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('[auth] code exchange failed:', error?.message);
    return bounce('oauth');
  }

  // Attach any order placed before the customer had an account. Cosmetic: the
  // session is already valid, so this must never fail the sign-in.
  if (data.user.email) {
    await claimOrdersForUser(data.user.id, data.user.email).catch((cause) => {
      console.error('[auth] post-sign-in setup skipped:', (cause as Error).message);
    });
  }

  const next = safeRedirect(params.get('next'), routes.dashboard);
  return NextResponse.redirect(new URL(next, siteUrl));
}
