import { NextResponse, type NextRequest } from 'next/server';

import { updateSession } from '@/lib/supabase/proxy';

/**
 * Next.js 16 renamed middleware to proxy.
 *
 * Three jobs:
 *
 * 1. Keep the old `/admin` URLs working. There is no separate admin app any
 *    more — one `/dashboard` serves both roles — so anything under `/admin` is
 *    forwarded rather than left as a dead bookmark.
 * 2. Refresh the Supabase session. Server components cannot write cookies, so
 *    a rotated access token only reaches the browser from here.
 * 3. Bounce signed-out visitors away from `/dashboard` before it renders.
 *    Whether the account is staff is still decided by the pages themselves.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const url = request.nextUrl.clone();
    url.search = '';
    // The staff sign-in page is now the site's own.
    url.pathname = pathname.startsWith('/admin/login') ? '/login' : '/dashboard';
    return NextResponse.redirect(url);
  }

  const { response, userId } = await updateSession(request);

  if (!userId) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/dashboard/:path*', '/dashboard'],
};
