import * as Sentry from '@sentry/nextjs';

import { capturePageview, initAnalytics } from '@/lib/analytics';

/**
 * Browser-side observability, started before React hydrates.
 *
 * Both halves are keyed off an environment variable and do nothing at all when
 * it is absent, so the site runs identically with neither service configured —
 * which is how it runs locally, and how it ran before either was added.
 */

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    /**
     * Ten percent of transactions. The point of sampling is that the free tier
     * is a fixed monthly quota: at 100% a single crawler run can exhaust the
     * month and leave a real outage unreported.
     */
    tracesSampleRate: 0.1,
    // Session replay is deliberately off: it would record what visitors type
    // into the contact and order forms, which is personal data the cookie
    // banner has not asked for.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
    /**
     * Noise that is never actionable: a visitor's extension throwing, a network
     * drop mid-navigation, and the "cancelled" errors a browser reports when
     * someone navigates away from a page that is still loading.
     */
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      'NetworkError when attempting to fetch resource',
      'Failed to fetch',
      'Load failed',
      'AbortError',
    ],
    denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i],
  });
}

initAnalytics();

/**
 * Client navigations are not page loads, so neither service sees them unless
 * they are told. Sentry needs the hook to attribute an error to the route the
 * visitor was actually on; PostHog needs it for the pageview count to mean
 * anything on a single-page app.
 */
export function onRouterTransitionStart(
  url: string,
  navigationType: 'push' | 'replace' | 'traverse',
) {
  if (dsn) Sentry.captureRouterTransitionStart(url, navigationType);
  capturePageview(new URL(url, window.location.origin).href);
}
