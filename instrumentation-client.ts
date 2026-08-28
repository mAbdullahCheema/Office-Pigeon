import * as Sentry from '@sentry/nextjs';

/**
 * Browser-side error monitoring, started before React hydrates.
 *
 * Keyed off an environment variable and does nothing at all when it is absent,
 * so the site runs identically with Sentry unconfigured — which is how it runs
 * locally, and how it ran before Sentry was added.
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

/**
 * A client navigation is not a page load, so Sentry does not see it unless it
 * is told. Without this an error is attributed to the route the visitor first
 * landed on rather than the one they were actually reading.
 */
export function onRouterTransitionStart(
  url: string,
  navigationType: 'push' | 'replace' | 'traverse',
) {
  if (dsn) Sentry.captureRouterTransitionStart(url, navigationType);
}
