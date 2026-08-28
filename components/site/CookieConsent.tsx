'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { Fx } from '@/components/ui/Fx';
import {
  CONSENT_ALL,
  CONSENT_EVENT,
  CONSENT_KEY,
  CONSENT_MAX_AGE_MS,
  CONSENT_NONE,
  readConsent,
  type ConsentPrefs as Prefs,
  type StoredConsent as Stored,
} from '@/lib/consent';
import { CONSENT_COOKIE } from '@/lib/supabase/config';
import { routes } from '@/lib/routes';

type Category = { id: keyof Prefs; name: string; tagline: string; desc: string };

const CATS: Category[] = [
  {
    id: 'necessary',
    name: 'Strictly necessary',
    tagline: 'Always on',
    desc: 'Sign-in sessions, security, load balancing and the record of this very choice. The site cannot run without them, so they are set without consent as the law permits.',
  },
  {
    id: 'preferences',
    name: 'Preferences',
    tagline: 'Optional',
    desc: 'Remembers your language, your last dashboard view and whether the Pip assistant is open.',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    tagline: 'Optional',
    desc: 'Aggregated, IP-truncated statistics on which pages get used, so we can fix what confuses people. Never linked to your name.',
  },
  {
    id: 'marketing',
    name: 'Marketing',
    tagline: 'Optional · off by default',
    desc: 'Measures which campaign brought you here and stops you seeing the same ad repeatedly. We do not sell or share your data.',
  },
];

const NONE = CONSENT_NONE;
const ALL = CONSENT_ALL;

/**
 * The decision is written twice: to localStorage, and to a first-party cookie.
 *
 * The cookie is what the server can see, so a page can be rendered knowing what
 * the visitor allowed rather than having to wait for the browser to tell it.
 * Whichever survives is enough — a visitor who clears one still keeps a choice
 * they already made. `lib/consent.ts` owns the reading half, because analytics
 * has to ask the same question before it loads.
 */
function writeCookie(record: Stored) {
  const value = encodeURIComponent(JSON.stringify(record));
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${Math.floor(CONSENT_MAX_AGE_MS / 1000)}; Path=/; SameSite=Lax${secure}`;
}

/** Drop the cookies belonging to categories the visitor turned off. */
function purge(prefs: Prefs) {
  const owned: Record<string, string[]> = {
    preferences: ['op_lang', 'op_view', 'op_pip'],
    analytics: ['_ga', '_ga_op', '_gid'],
    marketing: ['_fbp', 'op_camp'],
  };
  Object.entries(owned).forEach(([category, names]) => {
    if (prefs[category as keyof Prefs]) return;
    names.forEach((name) => {
      document.cookie = `${name}=; Max-Age=0; path=/`;
      try {
        localStorage.removeItem(name);
        sessionStorage.removeItem(name);
      } catch {
        /* nothing to clear */
      }
    });
  });

  // PostHog names its store after the project key — `ph_<key>_posthog` — so it
  // is cleared by prefix rather than by a name this file would have to know.
  // `posthog.opt_out_capturing()` already stops new writes; this removes what a
  // previous "accept" left behind.
  if (!prefs.analytics) {
    document.cookie
      .split('; ')
      .map((entry) => entry.split('=')[0])
      .filter((name) => name.startsWith('ph_'))
      .forEach((name) => {
        document.cookie = `${name}=; Max-Age=0; path=/`;
      });
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('ph_'))
        .forEach((key) => localStorage.removeItem(key));
    } catch {
      /* nothing to clear */
    }
  }
}

export function CookieConsent() {
  const [ready, setReady] = useState(false);
  const [decided, setDecided] = useState(true);
  const [panel, setPanel] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(NONE);
  const [gpc, setGpc] = useState(false);

  useEffect(() => {
    const stored = readConsent();
    const navigatorWithGpc = navigator as Navigator & { globalPrivacyControl?: boolean };
    // The stored decision and the GPC signal only exist in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGpc(navigatorWithGpc.globalPrivacyControl === true || navigator.doNotTrack === '1');
    setReady(true);
    setDecided(Boolean(stored));
    setPrefs(stored ? { ...stored.prefs, necessary: true } : NONE);

    const open = () => {
      const current = readConsent();
      setPrefs(current ? { ...current.prefs, necessary: true } : NONE);
      setPanel(true);
    };
    window.addEventListener('op-cookie-settings', open);
    return () => window.removeEventListener('op-cookie-settings', open);
  }, []);

  const persist = useCallback(
    (next: Prefs) => {
      const resolved: Prefs = { ...next, necessary: true };
      if (gpc) {
        // Global Privacy Control is a hard override, not a default.
        resolved.analytics = false;
        resolved.marketing = false;
      }
      const record: Stored = { v: 1, ts: Date.now(), prefs: resolved };
      try {
        localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
      } catch {
        /* storage refused — the cookie below still carries the choice */
      }
      writeCookie(record);
      purge(resolved);
      window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: resolved }));
      setPrefs(resolved);
      setDecided(true);
      setPanel(false);
    },
    [gpc],
  );

  const showBanner = ready && !decided && !panel;

  return (
    <>
      {showBanner ? (
        <Fx
          className="ck-card"
          s="position:fixed;left:24px;bottom:24px;z-index:400;width:min(430px,calc(100vw - 48px));font-family:var(--font-jakarta),system-ui,sans-serif;background:#fff;border-radius:30px;padding:26px 26px 24px;box-shadow:0 26px 60px rgba(36,26,22,.26), inset 0 2px 3px rgba(255,255,255,.9);animation:ckUp .5s cubic-bezier(.34,1.4,.64,1) both"
        >
          <Fx s="display:flex;align-items:center;gap:12px">
            <Fx
              as="span"
              s="width:38px;height:38px;flex:none;border-radius:14px;background:#FFF3EB;display:flex;align-items:center;justify-content:center;font-size:17px"
            >
              🍪
            </Fx>
            <Fx
              as="span"
              s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:19px;letter-spacing:-0.025em;color:#241A16"
            >
              A word about cookies
            </Fx>
          </Fx>
          <Fx as="p" s="font-size:14.5px;line-height:1.66;color:rgba(36,26,22,.68);margin:14px 0 0;text-wrap:pretty">
            We need a few to keep you signed in. The rest — preferences, analytics, marketing — are yours to allow or
            refuse, and nothing optional loads until you choose. Read our{' '}
            <Link href={`${routes.legal}#cookies`} style={{ color: '#E8480F', fontWeight: 600 }}>
              cookie policy
            </Link>
            .
          </Fx>
          <Fx className="ck-row" s="display:flex;gap:10px;margin-top:20px">
            <Fx
              as="button"
              type="button"
              onClick={() => persist(ALL)}
              s="flex:1;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:14.5px;padding:14px 18px;border-radius:16px;color:#fff;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 14px 26px rgba(226,78,23,.34), inset 0 2px 3px rgba(255,255,255,.4);transition:transform .26s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-3px)"
            >
              Accept all
            </Fx>
            <Fx
              as="button"
              type="button"
              onClick={() => persist(NONE)}
              s="flex:1;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:14.5px;padding:14px 18px;border-radius:16px;color:#241A16;background:#FFF3EB;transition:transform .26s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-3px)"
            >
              Reject all
            </Fx>
          </Fx>
          <Fx
            as="button"
            type="button"
            onClick={() => setPanel(true)}
            s="width:100%;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:13.5px;padding:11px;margin-top:9px;border-radius:14px;background:transparent;color:rgba(36,26,22,.6);transition:color .25s"
            hover="color:#241A16"
          >
            Customise choices
          </Fx>
        </Fx>
      ) : null}

      {panel ? (
        <Fx
          onClick={() => setPanel(false)}
          s="position:fixed;inset:0;z-index:500;background:rgba(36,26,22,.5);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:22px;font-family:var(--font-jakarta),system-ui,sans-serif;animation:ckFade .3s ease-out both"
        >
          <Fx
            onClick={(event: React.MouseEvent) => event.stopPropagation()}
            s="width:min(560px,100%);max-height:86vh;overflow:auto;background:#fff;border-radius:34px;padding:32px 32px 28px;box-shadow:0 40px 90px rgba(36,26,22,.4);animation:ckUp .45s cubic-bezier(.34,1.4,.64,1) both"
          >
            <Fx s="display:flex;align-items:flex-start;justify-content:space-between;gap:16px">
              <Fx>
                <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:25px;letter-spacing:-0.03em;color:#241A16">
                  Cookie settings
                </Fx>
                <Fx s="font-size:14px;color:rgba(36,26,22,.6);margin-top:6px">
                  Switch any category off and we delete its cookies straight away.
                </Fx>
              </Fx>
              <Fx
                as="button"
                type="button"
                onClick={() => setPanel(false)}
                aria-label="Close cookie settings"
                s="width:38px;height:38px;flex:none;border:0;cursor:pointer;border-radius:50%;background:#FFF3EB;color:#241A16;font-size:16px;font-family:inherit;transition:transform .25s"
                hover="transform:rotate(90deg)"
              >
                ✕
              </Fx>
            </Fx>

            <Fx s="display:flex;flex-direction:column;gap:11px;margin-top:24px">
              {CATS.map((category) => {
                const locked = category.id === 'necessary';
                const on = locked ? true : Boolean(prefs[category.id]);
                return (
                  <Fx key={category.id} s="background:#FFF7F1;border-radius:22px;padding:18px 20px">
                    <Fx s="display:flex;align-items:center;gap:14px">
                      <Fx s="flex:1;min-width:0">
                        <Fx s="font-weight:700;font-size:15.5px;color:#241A16">{category.name}</Fx>
                        <Fx s="font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#B4795A;margin-top:3px">
                          {category.tagline}
                        </Fx>
                      </Fx>
                      <Fx
                        as="button"
                        type="button"
                        role="switch"
                        aria-checked={on}
                        aria-label={category.name}
                        disabled={locked}
                        onClick={
                          locked
                            ? undefined
                            : () =>
                                setPrefs((current) => ({
                                  ...current,
                                  [category.id]: !current[category.id],
                                }))
                        }
                        s={`flex:none;width:54px;height:31px;border:0;cursor:${
                          locked ? 'not-allowed' : 'pointer'
                        };border-radius:999px;background:${
                          on ? '#EF5A1F' : 'rgba(36,26,22,.18)'
                        };position:relative;transition:background .3s;opacity:${locked ? 0.55 : 1}`}
                      >
                        <Fx
                          as="span"
                          s={`position:absolute;top:3px;left:${
                            on ? '26px' : '3px'
                          };width:25px;height:25px;border-radius:50%;background:#fff;box-shadow:0 3px 8px rgba(36,26,22,.24);transition:left .28s cubic-bezier(.34,1.56,.64,1)`}
                        />
                      </Fx>
                    </Fx>
                    <Fx
                      as="p"
                      s="font-size:13.5px;line-height:1.62;color:rgba(36,26,22,.64);margin:11px 0 0;text-wrap:pretty"
                    >
                      {category.desc}
                    </Fx>
                  </Fx>
                );
              })}
            </Fx>

            <Fx className="ck-row" s="display:flex;gap:10px;margin-top:22px">
              <Fx
                as="button"
                type="button"
                onClick={() => persist(prefs)}
                s="flex:1;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:14.5px;padding:15px 18px;border-radius:16px;color:#fff;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 14px 26px rgba(226,78,23,.34), inset 0 2px 3px rgba(255,255,255,.4);transition:transform .26s cubic-bezier(.34,1.56,.64,1)"
                hover="transform:translateY(-3px)"
              >
                Save my choices
              </Fx>
              <Fx
                as="button"
                type="button"
                onClick={() => persist(ALL)}
                s="flex:none;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:14.5px;padding:15px 20px;border-radius:16px;color:#241A16;background:#FFF3EB;transition:transform .26s cubic-bezier(.34,1.56,.64,1)"
                hover="transform:translateY(-3px)"
              >
                Accept all
              </Fx>
              <Fx
                as="button"
                type="button"
                onClick={() => persist(NONE)}
                s="flex:none;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:14.5px;padding:15px 20px;border-radius:16px;color:#241A16;background:#FFF3EB;transition:transform .26s cubic-bezier(.34,1.56,.64,1)"
                hover="transform:translateY(-3px)"
              >
                Reject all
              </Fx>
            </Fx>
            <Fx s="font-size:12.5px;color:rgba(36,26,22,.5);margin-top:14px">
              Your choice is stored for 12 months.{' '}
              <Link href={`${routes.legal}#cookies`} style={{ color: '#E8480F', fontWeight: 600 }}>
                Cookie policy
              </Link>{' '}
              ·{' '}
              <Link href={`${routes.legal}#privacy`} style={{ color: '#E8480F', fontWeight: 600 }}>
                Privacy policy
              </Link>
            </Fx>
          </Fx>
        </Fx>
      ) : null}
    </>
  );
}
