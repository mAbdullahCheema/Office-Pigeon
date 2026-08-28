import { NextResponse } from 'next/server';

import { rateLimit } from '@/lib/rate-limit';
import { safeRedirect } from '@/lib/redirect-target';
import { clientIp } from '@/lib/request';
import { routes } from '@/lib/routes';
import { setPersistence } from '@/lib/auth';
import { siteUrl } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

/**
 * Starts Google sign-in.
 *
 * Supabase builds the consent URL and stores the PKCE code verifier in a
 * cookie; Google returns the visitor to `/api/auth/callback` with a one-time
 * code. Nothing is created here — the callback exchanges the code for a
 * session, and PKCE is what proves the response belongs to a sign-in this
 * browser actually started.
 */
export async function GET(request: Request) {
  const limit = await rateLimit('auth', clientIp(request) ?? 'unknown');
  if (!limit.ok) {
    return NextResponse.redirect(new URL(`${routes.login}?error=rate`, siteUrl));
  }

  const next = safeRedirect(new URL(request.url).searchParams.get('next'), routes.dashboard);

  const callback = new URL('/api/auth/callback', siteUrl);
  callback.searchParams.set('next', next);

  // Someone arriving through Google is opting into a lasting session; there is
  // no "keep me signed in" tick on the consent screen to say otherwise.
  await setPersistence(true);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callback.toString(),
      // The redirect is issued here, not by the SDK.
      skipBrowserRedirect: true,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });

  if (error || !data?.url) {
    console.error('[auth] Google sign-in could not start:', error?.message);
    return NextResponse.redirect(new URL(`${routes.login}?error=oauth`, siteUrl));
  }

  return NextResponse.redirect(data.url);
}
