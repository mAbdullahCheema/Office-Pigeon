import { CONSENT_EVENT, analyticsAllowed, type ConsentPrefs } from './consent';

/**
 * Product analytics, behind the cookie banner.
 *
 * The banner promises that "nothing optional loads until you choose", and this
 * module keeps that promise literally: `posthog-js` is a dynamic import, so a
 * visitor who declines analytics — or who has not answered yet — never
 * downloads it at all. Statically importing it and merely skipping `init` would
 * still have shipped roughly half a megabyte of uncompressed JavaScript to
 * everyone, which is both a broken promise and a slower first paint for the
 * majority who never opt in.
 *
 * The second job is reacting to the decision changing. A visitor who reopens
 * the panel and switches analytics off expects capture to stop there and then,
 * not on their next visit.
 *
 * Nothing here throws. An analytics failure that took the page down with it
 * would be strictly worse than having no analytics.
 */

type PostHog = typeof import('posthog-js').default;

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

let posthog: PostHog | null = null;
/** Held so two rapid consent events cannot start two initialisations. */
let starting: Promise<PostHog | null> | null = null;

function start(): Promise<PostHog | null> {
  if (posthog) return Promise.resolve(posthog);
  if (starting) return starting;
  if (!key) return Promise.resolve(null);

  starting = import('posthog-js')
    .then((module) => {
      const instance = module.default;
      instance.init(key, {
        api_host: host,
        /**
         * Everything PostHog would otherwise fetch at runtime is turned off.
         *
         * The site runs a strict Content Security Policy with no third-party
         * `script-src`, so the surveys bundle, the toolbar and the
         * session-replay recorder — all of which are pulled as remote scripts
         * — would be blocked anyway. Declaring it here means they are never
         * requested, rather than requested and refused with a console error on
         * every page load.
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
      });
      posthog = instance;
      return instance;
    })
    .catch(() => {
      // A blocked or failed chunk means no analytics, not a broken page.
      starting = null;
      return null;
    });

  return starting;
}

/** The current page, sent once per navigation. */
export function capturePageview(url?: string) {
  if (!posthog) return;
  try {
    posthog.capture('$pageview', url ? { $current_url: url } : undefined);
  } catch {
    /* analytics is never worth an exception */
  }
}

/** A named product event — an order started, a call booked, Pip opened. */
export function captureEvent(name: string, properties?: Record<string, unknown>) {
  if (!posthog) return;
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
 * lost, late enough that `document` and `localStorage` exist. The import it
 * kicks off is deliberately not awaited: `instrumentation-client` does not
 * block hydration on async work, and analytics has no business delaying a page.
 */
export function initAnalytics() {
  if (!key) return;

  try {
    if (analyticsAllowed()) {
      void start().then((instance) => {
        if (instance) capturePageview();
      });
    }

    window.addEventListener(CONSENT_EVENT, (event) => {
      const prefs = (event as CustomEvent<ConsentPrefs>).detail;

      if (prefs?.analytics) {
        void start().then((instance) => {
          if (!instance) return;
          instance.opt_in_capturing();
          capturePageview();
        });
        return;
      }

      // Stops capture immediately and clears the stored distinct id. The
      // banner's own purge removes what is already on disk. Nothing to do if
      // the library was never loaded, which is the common case.
      if (posthog) posthog.opt_out_capturing();
    });
  } catch {
    /* a browser that refuses storage simply goes uncounted */
  }
}
