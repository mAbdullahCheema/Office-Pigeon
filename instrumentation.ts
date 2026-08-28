import * as Sentry from '@sentry/nextjs';
import type { Instrumentation } from 'next';

/**
 * Server-side observability.
 *
 * `register` runs once per server instance before the first request is served,
 * and `onRequestError` is Next's hook for every error thrown while rendering a
 * page, running a route handler or executing a server action — including the
 * ones React swallows into a digest, which never reach a `try`/`catch` of ours.
 *
 * Both runtimes are covered because middleware-adjacent code and some route
 * handlers can run on the edge runtime, where the Node SDK cannot load.
 */

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

export async function register() {
  if (!dsn) return;

  const common = {
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  };

  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init(common);
  }
}

/**
 * Wrapped rather than assigned directly so a Sentry that was never configured
 * costs nothing: without a DSN `captureRequestError` would still walk the error
 * and build an event before discarding it.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (!dsn) return;
  await Sentry.captureRequestError(error, request, context);
};
