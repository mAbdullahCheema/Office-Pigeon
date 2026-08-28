import { CONSENT_COOKIE } from './supabase/config';

/**
 * The visitor's cookie decision, and how to read it.
 *
 * Kept apart from the banner that writes it so that reading the decision has
 * exactly one implementation. Nothing optional loads on this site today, but
 * the moment something does — analytics, an embed, a pixel — it must ask this
 * question rather than parse the cookie a second time. For a control that
 * exists to satisfy a law, two answers is the failure mode worth designing out
 * in advance.
 */

export type ConsentPrefs = {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

export type StoredConsent = { v: 1; ts: number; prefs: ConsentPrefs };

/** localStorage key holding the decision. */
export const CONSENT_KEY = 'op-cookie-consent';

/** Dispatched on `window` whenever the visitor saves a new decision. */
export const CONSENT_EVENT = 'op-consent-change';

/** A decision is honoured for twelve months, then asked again. */
export const CONSENT_MAX_AGE_MS = 31536000000;

export const CONSENT_NONE: ConsentPrefs = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

export const CONSENT_ALL: ConsentPrefs = {
  necessary: true,
  preferences: true,
  analytics: true,
  marketing: true,
};

function fresh(record: unknown): StoredConsent | null {
  const stored = record as StoredConsent | null;
  if (!stored || stored.v !== 1) return null;
  return Date.now() - stored.ts < CONSENT_MAX_AGE_MS ? stored : null;
}

/**
 * The decision as written to the first-party cookie.
 *
 * The cookie is the copy the server can also see, which is why it exists
 * alongside localStorage; either one surviving is enough to count as a decision
 * already made.
 */
export function readConsentCookie(): StoredConsent | null {
  try {
    const match = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`));
    if (!match) return null;
    return fresh(JSON.parse(decodeURIComponent(match.slice(CONSENT_COOKIE.length + 1))));
  } catch {
    // A malformed cookie counts as no decision, which means nothing optional
    // loads — the safe direction to fail in.
    return null;
  }
}

/** The decision, from whichever store still holds it. */
export function readConsent(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    const stored = raw ? fresh(JSON.parse(raw)) : null;
    if (stored) return stored;
  } catch {
    /* unreadable storage falls through to the cookie */
  }
  return readConsentCookie();
}
