import posthog from 'posthog-js';

import { CONSENT_EVENT, analyticsAllowed, type ConsentPrefs } from './consent';

/**
 * Product analytics, behind the cookie banner.
 *
 * The banner already promises that "nothing optional loads until you choose",
 * and the only way to keep that promise is to not call `posthog.init` until the
 * visitor has said yes. So this module does two things: it initialises on
 * consent, and it listens for the decision changing afterwards, because a
 * visitor who reopens the panel and switches analytics off expects it to stop
 * there and then rather than on their next visit.
 *
 * Nothing here throws. An analytics failure that took the page down with it
 * would be a strictly worse outcome than having no analytics.
 */

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

let started = false;

function start() {
  if (started || !key) return;
  started = true;

  posthog.init(key, {
    api_host: host,
    /**
     * Everything PostHog would otherwise fetch at runtime is turned off.
     *
     * The site runs a strict Content Security Policy with no third-party
     * `script-src`, so the surveys bundle, the toolbar and the session-replay
     * recorder — all of which are pulled as remote scripts — would be blocked
     * anyway. Declaring that here means they are never requested, rather than
     * requested and refused with a console error on every page load.
     */
    disable_external_dependency_loading: true,
    disable_session_recording: true,
    disable_surveys: true,
    autocapture: true,
    capture_pageview: false, // Sent from `instrumentation-client.ts` instead.
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    // The banner promises IP-truncated, non-identifying statistics.
    ip: false,
    person_profiles: 'identified_only',
    // A visitor who arrives with consent already stored should not be counted
    // twice while the SDK works out who they are.
    loaded: (instance) => {
      if (process.env.NODE_ENV === 'development') instance.debug(false);
    },
  });
}

/** The current page, sent once per navigation. */
export function capturePageview(url?: string) {
  if (!started || !key) return;
  try {
    posthog.capture('$pageview', url ? { $current_url: url } : undefined);
  } catch {
    /* analytics is never worth an exception */
  }
}

/** A named product event — an order started, a call booked, Pip opened. */
export function captureEvent(name: string, properties?: Record<string, unknown>) {
  if (!started || !key) return;
  try {
    posthog.capture(name, properties);
  } catch {
    /* analytics is never worth an exception */
  }
}

/**
 * Wires analytics to the consent decision, now and whenever it changes.
 *
 * Called once from `instrumentation-client.ts`, which runs after the document
 * loads and before React hydrates — early enough that the first pageview is not
 * lost, late enough that `document` and `localStorage` exist.
 */
export function initAnalytics() {
  if (!key) return;

  try {
    if (analyticsAllowed()) {
      start();
      capturePageview();
    }

    window.addEventListener(CONSENT_EVENT, (event) => {
      const prefs = (event as CustomEvent<ConsentPrefs>).detail;
      if (prefs?.analytics) {
        start();
        posthog.opt_in_capturing();
        capturePageview();
      } else if (started) {
        // Stops capture immediately and clears the stored distinct id. The
        // banner's own purge removes what is already on disk.
        posthog.opt_out_capturing();
      }
    });
  } catch {
    /* a browser that refuses storage simply goes uncounted */
  }
}
