'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

import {
  registerCustomer,
  requestRecovery,
  signInCustomer,
  signOutCustomer,
  type AuthState,
} from '@/app/(site)/login/actions';
import { Fx } from '@/components/ui/Fx';
import { mailtoLink, routes, whatsappLink } from '@/lib/routes';

const perks = [
  {
    icon: '📦',
    title: 'Every order in one list',
    body: 'Status, reference and the indicative price for each thing you have bought.',
  },
  {
    icon: '💬',
    title: 'One thread with us',
    body: 'Questions and previews stay in the same place instead of scattered across WhatsApp.',
  },
  {
    icon: '🔑',
    title: 'Product access',
    body: 'Trials and licences for Smart School OS, AI Finance, Whiteboard and Recipes.',
  },
  {
    icon: '🧾',
    title: 'Quotes and receipts',
    body: 'Everything we have confirmed in writing, ready to forward to your accountant.',
  },
];

const stats = [
  { value: '100+', label: 'five-star reviews' },
  { value: '9', label: 'countries served' },
  { value: '14 days', label: 'typical full build' },
];

const signupPerks = [
  { icon: '📦', label: 'Track every order' },
  { icon: '💬', label: 'One thread with us' },
  { icon: '🔑', label: 'Product trials' },
  { icon: '🧾', label: 'Quotes and receipts' },
];

const fieldStyle =
  'width:100%;margin-top:7px;font-family:inherit;font-size:15px;color:#241A16;background:#FFF9F5;border:0;border-radius:18px;padding:14px 16px;box-shadow:inset 0 2px 5px rgba(196,120,74,.14);outline:none';
const labelStyle =
  'display:block;font-size:12.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(36,26,22,.45)';

/** Google's brand mark, inlined so the button needs no network request. */
function GoogleMark() {
  return (
    <svg width="19" height="19" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.93v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.93a9 9 0 0 0 0 8.1l3.04-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .93 4.95l3.04 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

/** Sign-in failures that come back as a query parameter, not action state. */
const linkErrors: Record<string, string> = {
  /**
   * The common cause is an account that already exists on this address with a
   * password. Supabase refuses to attach a Google identity to an account whose
   * email is unverified, and that refusal is deliberate: without it, anyone who
   * registered under someone else's address would inherit their Google sign-in.
   * The password is the way into that account.
   */
  oauth:
    'Google sign-in did not complete. If this email already has a password account, use the password below instead.',
  state: 'That sign-in link had expired. Start again from this page.',
  rate: 'Too many sign-in attempts from this network. Wait a few minutes and try again.',
};

export function LoginView({
  viewer,
  next,
  googleEnabled,
  linkError,
}: {
  viewer: { name: string; email: string; role: 'admin' | 'customer' } | null;
  /** Where to land after signing in, already validated on the server. */
  next: string;
  googleEnabled: boolean;
  linkError?: string;
}) {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [view, setView] = useState<'auth' | 'recover'>('auth');
  const [remember, setRemember] = useState(true);

  const [signInState, signInAction, signInPending] = useActionState<AuthState, FormData>(signInCustomer, {});
  const [registerState, registerAction, registerPending] = useActionState<AuthState, FormData>(registerCustomer, {});
  const [recoverState, recoverAction, recoverPending] = useActionState<AuthState, FormData>(requestRecovery, {});

  const isRegister = mode === 'register';
  const state = isRegister ? registerState : signInState;
  const pending = isRegister ? registerPending : signInPending;
  // An action error is about this attempt, so it outranks the stale link error.
  const error = state.error ?? (linkError ? linkErrors[linkError] : undefined);

  const googleHref = `/api/auth/google?next=${encodeURIComponent(next)}`;

  return (
    <Fx
      as="section"
      s="position:relative;z-index:1;padding:44px 20px 64px;min-height:calc(100dvh - 94px);box-sizing:border-box;display:flex;align-items:center"
    >
      <Fx
        className="split"
        s="width:100%;max-width:1080px;margin:0 auto;position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.9fr);gap:22px;align-items:stretch;min-height:640px"
      >
        <Fx s="background:#fff;border-radius:42px;padding:44px 40px 46px;box-shadow:0 26px 54px rgba(196,120,74,.2), inset 0 2px 4px rgba(255,255,255,.95);animation:pop .6s cubic-bezier(.34,1.4,.64,1) both;display:flex;flex-direction:column">
          {viewer ? (
            <Fx s="animation:pop .4s cubic-bezier(.34,1.4,.64,1) both">
              <Fx as="h1" s="font-size:30px;margin-top:0">
                You are signed in.
              </Fx>
              <Fx as="p" s="font-size:15.5px;line-height:1.65;color:rgba(36,26,22,.62);margin:12px 0 0">
                Signed in as <strong>{viewer.email}</strong> ({viewer.role}).
              </Fx>
              <Fx s="display:flex;gap:10px;margin-top:26px;flex-wrap:wrap">
                <Fx
                  as={Link}
                  href={routes.dashboard}
                  s="display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff;font-weight:700;font-size:15px;padding:15px 24px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 16px 30px rgba(226,78,23,.36);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                  hover="transform:translateY(-3px)"
                >
                  Open my dashboard
                </Fx>
                <Fx as="form" action={signOutCustomer}>
                  <Fx
                    as="button"
                    type="submit"
                    s="border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:15px;padding:15px 22px;border-radius:999px;background:#FFF0E7;color:#241A16;box-shadow:inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                    hover="transform:translateY(-3px)"
                  >
                    Sign out
                  </Fx>
                </Fx>
              </Fx>
            </Fx>
          ) : view === 'recover' ? (
            <Fx s="flex:1;display:flex;flex-direction:column;justify-content:space-between;animation:pop .4s cubic-bezier(.34,1.4,.64,1) both">
              <Fx
                as="button"
                type="button"
                onClick={() => setView('auth')}
                s="align-self:flex-start;border:0;background:#FFF0E7;cursor:pointer;font-family:inherit;font-weight:700;font-size:13px;color:rgba(36,26,22,.65);padding:9px 16px;border-radius:999px"
              >
                ← Back to sign in
              </Fx>
              <Fx as="h1" s="font-size:clamp(26px,3.2vw,32px);margin-top:18px">
                Let&apos;s get you back in.
              </Fx>
              <Fx
                as="p"
                s="font-size:15px;line-height:1.65;color:rgba(36,26,22,.62);margin:12px 0 0;max-width:42ch;text-wrap:pretty"
              >
                Tell us the email on the account and we will verify who you are, then set a new
                password for you while you wait. We do this by hand rather than by emailed link, so
                nothing depends on a message arriving.
              </Fx>

              {recoverState.sent ? (
                <Fx s="margin-top:22px;background:#E9FBF3;border-radius:26px;padding:22px 24px;box-shadow:inset 0 2px 4px rgba(255,255,255,.85)">
                  <Fx s="display:flex;align-items:center;gap:11px">
                    <Fx
                      as="span"
                      s="width:38px;height:38px;flex:none;border-radius:50%;background:#0F9C6E;color:#fff;display:flex;align-items:center;justify-content:center;font-size:17px"
                    >
                      ✓
                    </Fx>
                    <Fx
                      as="span"
                      s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:17px"
                    >
                      Got it — now message us
                    </Fx>
                  </Fx>
                  <Fx as="p" s="font-size:14px;line-height:1.62;color:rgba(36,26,22,.66);margin:12px 0 0">
                    Use WhatsApp or email below and quote that address. We verify you, set a new
                    password, and read it back to you.
                  </Fx>
                </Fx>
              ) : (
                <Fx as="form" action={recoverAction} s="margin-top:20px">
                  <Fx as="label" htmlFor="r-field" s={labelStyle}>
                    Email on the account
                  </Fx>
                  <Fx
                    as="input"
                    id="r-field"
                    name="field"
                    type="email"
                    autoComplete="email"
                    placeholder="you@business.com"
                    required
                    s={fieldStyle}
                  />
                  {recoverState.error ? (
                    <Fx role="alert" s="margin-top:14px;background:#FFEDE3;color:#B4230C;border-radius:16px;padding:12px 16px;font-size:13.5px;font-weight:600">
                      {recoverState.error}
                    </Fx>
                  ) : null}
                  <Fx
                    as="button"
                    type="submit"
                    disabled={recoverPending}
                    s="width:100%;margin-top:20px;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:16px;color:#fff;padding:18px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 34px rgba(226,78,23,.38), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                    hover="transform:translateY(-3px)"
                  >
                    {recoverPending ? 'One moment…' : 'Continue'}
                  </Fx>
                </Fx>
              )}

              <Fx s="display:flex;align-items:center;gap:14px;margin:24px 0 0">
                <Fx as="span" s="height:1px;flex:1;background:#F6E7DC" />
                <Fx as="span" s="font-size:12px;font-weight:700;color:rgba(36,26,22,.4)">
                  OR GET RESET HELP FROM US
                </Fx>
                <Fx as="span" s="height:1px;flex:1;background:#F6E7DC" />
              </Fx>
              <Fx s="display:flex;flex-direction:column;gap:10px;margin-top:20px">
                <Fx
                  as="a"
                  href={whatsappLink('Hi Office Pigeon — I need help getting back into my account.')}
                  s="display:flex;align-items:center;gap:13px;text-decoration:none;color:#241A16;background:#E9FBF3;border-radius:24px;padding:16px 20px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.4,.64,1)"
                  hover="transform:translateX(4px)"
                >
                  <Fx
                    as="span"
                    s="width:40px;height:40px;flex:none;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:18px"
                  >
                    💬
                  </Fx>
                  <Fx as="span" s="line-height:1.4">
                    <Fx as="span" className="tt" s="display:block;font-weight:800;font-size:14.5px">
                      WhatsApp us for reset help
                    </Fx>
                    <Fx as="span" s="display:block;font-size:12.5px;color:rgba(36,26,22,.55);margin-top:2px">
                      Fastest, replies in minutes
                    </Fx>
                  </Fx>
                </Fx>
                <Fx
                  as="a"
                  href={mailtoLink('Account access help')}
                  s="display:flex;align-items:center;gap:13px;text-decoration:none;color:#241A16;background:#FFF0E7;border-radius:24px;padding:16px 20px;box-shadow:inset 0 2px 3px rgba(255,255,255,.9);transition:transform .3s cubic-bezier(.34,1.4,.64,1)"
                  hover="transform:translateX(4px)"
                >
                  <Fx
                    as="span"
                    s="width:40px;height:40px;flex:none;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:18px"
                  >
                    ✉️
                  </Fx>
                  <Fx as="span" s="line-height:1.4">
                    <Fx as="span" className="tt" s="display:block;font-weight:800;font-size:14.5px">
                      Email us for reset help
                    </Fx>
                    <Fx as="span" s="display:block;font-size:12.5px;color:rgba(36,26,22,.55);margin-top:2px">
                      Within one business day
                    </Fx>
                  </Fx>
                </Fx>
              </Fx>
            </Fx>
          ) : (
            <Fx s="flex:1;display:flex;flex-direction:column;justify-content:space-between">
              <Fx as="h1" s="font-size:clamp(28px,3.4vw,36px);margin-top:0">
                {isRegister ? 'Create your account.' : 'Welcome back.'}
              </Fx>

              {googleEnabled ? (
                <>
                  <Fx
                    as="a"
                    href={googleHref}
                    /**
                     * A plain link, not a form: Google sign-in is a top-level
                     * navigation the browser has to follow itself.
                     */
                    s="display:flex;align-items:center;justify-content:center;gap:12px;margin-top:22px;text-decoration:none;color:#241A16;font-family:inherit;font-weight:700;font-size:15.5px;padding:16px 20px;border-radius:999px;background:#fff;box-shadow:0 12px 26px rgba(196,120,74,.18), inset 0 0 0 1.5px #F0E2D7;transition:transform .3s cubic-bezier(.34,1.56,.64,1)"
                    hover="transform:translateY(-3px)"
                    active="transform:translateY(1px)"
                  >
                    <GoogleMark />
                    Continue with Google
                  </Fx>
                  <Fx s="display:flex;align-items:center;gap:14px;margin-top:20px">
                    <Fx as="span" s="height:1px;flex:1;background:#F6E7DC" />
                    <Fx as="span" s="font-size:11.5px;font-weight:800;letter-spacing:.1em;color:rgba(36,26,22,.4)">
                      OR USE EMAIL
                    </Fx>
                    <Fx as="span" s="height:1px;flex:1;background:#F6E7DC" />
                  </Fx>
                </>
              ) : null}

              <Fx s={`display:flex;gap:6px;background:#FFF3EC;padding:6px;border-radius:999px;margin-top:${googleEnabled ? '20px' : '26px'}`}>
                {(
                  [
                    { id: 'signin', label: 'Sign in' },
                    { id: 'register', label: 'Create account' },
                  ] as const
                ).map((entry) => (
                  <Fx
                    key={entry.id}
                    as="button"
                    type="button"
                    onClick={() => setMode(entry.id)}
                    s={`flex:1;border:0;cursor:pointer;font-family:inherit;font-weight:700;font-size:13.5px;padding:12px 10px;border-radius:999px;background:${
                      mode === entry.id ? 'linear-gradient(180deg,#FF8149,#EF5A1F)' : 'transparent'
                    };color:${mode === entry.id ? '#fff' : 'rgba(36,26,22,.62)'};box-shadow:${
                      mode === entry.id
                        ? '0 10px 20px rgba(226,78,23,.3), inset 0 2px 3px rgba(255,255,255,.4)'
                        : 'none'
                    };transition:background .3s, color .3s`}
                  >
                    {entry.label}
                  </Fx>
                ))}
              </Fx>

              <Fx as="form" action={isRegister ? registerAction : signInAction} s="margin-top:22px">
                <input type="hidden" name="next" value={next} />
                {/* The toggle is a button, so the choice travels as a field. */}
                <input type="hidden" name="remember" value={remember ? 'on' : 'off'} />
                {isRegister ? (
                  <Fx s="margin-bottom:16px">
                    <Fx as="label" htmlFor="l-name" s={labelStyle}>
                      Your name
                    </Fx>
                    <Fx
                      as="input"
                      id="l-name"
                      name="name"
                      autoComplete="name"
                      placeholder="Amir Rahman"
                      s={fieldStyle}
                    />
                  </Fx>
                ) : null}
                <Fx>
                  <Fx as="label" htmlFor="l-email" s={labelStyle}>
                    Email
                  </Fx>
                  <Fx
                    as="input"
                    id="l-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@business.com"
                    required
                    s={fieldStyle}
                  />
                </Fx>
                <Fx s="margin-top:16px">
                  <Fx as="label" htmlFor="l-pass" s={labelStyle}>
                    Password
                  </Fx>
                  <Fx
                    as="input"
                    id="l-pass"
                    name="password"
                    type="password"
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    s={fieldStyle}
                  />
                </Fx>

                {isRegister ? (
                  <Fx s="margin-top:16px">
                    <Fx as="label" htmlFor="l-phone" s={labelStyle}>
                      Phone or WhatsApp number
                    </Fx>
                    <Fx
                      as="input"
                      id="l-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+1 917 555 0142"
                      s={fieldStyle}
                    />
                  </Fx>
                ) : (
                  <Fx
                    as="button"
                    type="button"
                    onClick={() => setRemember((current) => !current)}
                    s="width:100%;margin-top:16px;border:0;cursor:pointer;font-family:inherit;text-align:left;display:flex;align-items:center;gap:12px;background:#FFF6F1;border-radius:20px;padding:13px 16px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12)"
                  >
                    <Fx
                      as="span"
                      s={`width:22px;height:22px;flex:none;border-radius:7px;background:${
                        remember ? 'linear-gradient(150deg,#FFA46A,#EF5A1F)' : 'rgba(36,26,22,.14)'
                      };color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;box-shadow:inset 0 1px 2px rgba(255,255,255,.5)`}
                    >
                      {remember ? '✓' : ''}
                    </Fx>
                    <Fx as="span" s="line-height:1.35;flex:1">
                      <Fx as="span" s="display:block;font-weight:700;font-size:14px">
                        Keep me signed in
                      </Fx>
                      <Fx as="span" s="display:block;font-size:12px;color:rgba(36,26,22,.52)">
                        On this device for 30 days
                      </Fx>
                    </Fx>
                  </Fx>
                )}

                {isRegister ? (
                  <Fx
                    as="label"
                    htmlFor="l-consent"
                    s="display:flex;gap:11px;align-items:flex-start;margin-top:16px;padding:14px 16px;border-radius:18px;background:#FFF7F1;cursor:pointer;font-size:13px;line-height:1.6;color:rgba(36,26,22,.7);font-weight:500"
                  >
                    <Fx
                      as="input"
                      id="l-consent"
                      name="consent"
                      type="checkbox"
                      required
                      s="width:17px;height:17px;flex:none;margin-top:2px;accent-color:#EF5A1F"
                    />
                    <Fx as="span">
                      I agree to the <Link href={`${routes.legal}#terms`}>Terms of Service</Link> and{' '}
                      <Link href={`${routes.legal}#privacy`}>Privacy Policy</Link>.
                    </Fx>
                  </Fx>
                ) : null}

                {error ? (
                  <Fx
                    role="alert"
                    s="margin-top:16px;background:#FFEDE3;color:#B4230C;border-radius:16px;padding:12px 16px;font-size:13.5px;font-weight:600"
                  >
                    {error}
                  </Fx>
                ) : null}

                <Fx
                  as="button"
                  type="submit"
                  disabled={pending}
                  s={`width:100%;margin-top:20px;border:0;cursor:${
                    pending ? 'wait' : 'pointer'
                  };font-family:inherit;font-weight:700;font-size:16px;color:#fff;padding:18px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 18px 34px rgba(226,78,23,.38), inset 0 2px 3px rgba(255,255,255,.45);transition:transform .3s cubic-bezier(.34,1.56,.64,1);opacity:${
                    pending ? 0.7 : 1
                  }`}
                  hover="transform:translateY(-3px)"
                  active="transform:translateY(2px) scale(.99)"
                >
                  {pending ? 'One moment…' : isRegister ? 'Create my account' : 'Sign in'}
                </Fx>
              </Fx>

              {isRegister ? (
                <Fx s="margin-top:24px;background:#FFF6F1;border-radius:26px;padding:18px 20px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12)">
                  <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:15.5px">
                    What your account gives you
                  </Fx>
                  <Fx className="pair" s="display:grid;grid-template-columns:1fr 1fr;gap:9px 14px;margin-top:12px">
                    {signupPerks.map((perk) => (
                      <Fx key={perk.label} s="display:flex;align-items:center;gap:9px">
                        <Fx
                          as="span"
                          s="width:24px;height:24px;flex:none;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:12px"
                        >
                          {perk.icon}
                        </Fx>
                        <Fx as="span" s="font-size:13px;font-weight:600;line-height:1.35;color:rgba(36,26,22,.7)">
                          {perk.label}
                        </Fx>
                      </Fx>
                    ))}
                  </Fx>
                </Fx>
              ) : (
                <>
                  <Fx s="display:flex;align-items:center;gap:14px;margin:26px 0 0">
                    <Fx as="span" s="height:1px;flex:1;background:#F6E7DC" />
                    <Fx as="span" s="font-size:11.5px;font-weight:800;letter-spacing:.1em;color:rgba(36,26,22,.4)">
                      CAN&apos;T GET IN? PICK ONE
                    </Fx>
                    <Fx as="span" s="height:1px;flex:1;background:#F6E7DC" />
                  </Fx>
                  <Fx className="grid3" s="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px">
                    <Fx
                      as="button"
                      type="button"
                      onClick={() => setView('recover')}
                      s="border:0;cursor:pointer;font-family:inherit;text-align:center;background:#FFF6F1;border-radius:24px;padding:18px 12px;box-shadow:inset 0 2px 5px rgba(196,120,74,.12);transition:transform .3s cubic-bezier(.34,1.4,.64,1)"
                      hover="transform:translateY(-3px)"
                    >
                      <Fx
                        as="span"
                        s="width:38px;height:38px;border-radius:50%;background:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:17px"
                      >
                        🔑
                      </Fx>
                      <Fx as="span" s="display:block;font-weight:800;font-size:13.5px;margin-top:9px">
                        Ask us to reset it
                      </Fx>
                      <Fx as="span" s="display:block;font-size:11.5px;color:rgba(36,26,22,.52);margin-top:3px">
                        We verify you, then set one
                      </Fx>
                    </Fx>
                    <Fx
                      as="a"
                      href={whatsappLink('Hi Office Pigeon — I need help getting back into my account.')}
                      s="text-decoration:none;color:#241A16;text-align:center;background:#E9FBF3;border-radius:24px;padding:18px 12px;box-shadow:inset 0 2px 5px rgba(255,255,255,.7);transition:transform .3s cubic-bezier(.34,1.4,.64,1)"
                      hover="transform:translateY(-3px)"
                    >
                      <Fx
                        as="span"
                        s="width:38px;height:38px;border-radius:50%;background:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:17px"
                      >
                        💬
                      </Fx>
                      <Fx as="span" s="display:block;font-weight:800;font-size:13.5px;margin-top:9px">
                        WhatsApp us
                      </Fx>
                      <Fx as="span" s="display:block;font-size:11.5px;color:rgba(36,26,22,.52);margin-top:3px">
                        Fastest, replies in minutes
                      </Fx>
                    </Fx>
                    <Fx
                      as="a"
                      href={mailtoLink('Account access help')}
                      s="text-decoration:none;color:#241A16;text-align:center;background:#FFF0E7;border-radius:24px;padding:18px 12px;box-shadow:inset 0 2px 5px rgba(255,255,255,.7);transition:transform .3s cubic-bezier(.34,1.4,.64,1)"
                      hover="transform:translateY(-3px)"
                    >
                      <Fx
                        as="span"
                        s="width:38px;height:38px;border-radius:50%;background:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:17px"
                      >
                        ✉️
                      </Fx>
                      <Fx as="span" s="display:block;font-weight:800;font-size:13.5px;margin-top:9px">
                        Email us
                      </Fx>
                      <Fx as="span" s="display:block;font-size:11.5px;color:rgba(36,26,22,.52);margin-top:3px">
                        Within one business day
                      </Fx>
                    </Fx>
                  </Fx>
                </>
              )}
            </Fx>
          )}
        </Fx>

        <Fx s="background:linear-gradient(160deg,#2A1A12,#3D2317 55%,#241A16);color:#FFEFE5;border-radius:42px;padding:44px 40px 46px;position:relative;overflow:hidden;animation:pop .7s cubic-bezier(.34,1.4,.64,1) .1s both">
          <Fx s="position:relative;display:flex;flex-direction:column;justify-content:space-between;gap:24px;height:100%">
            <Fx as="h2" s="font-size:28px;max-width:16ch">
              Everything you have ordered, in one place.
            </Fx>
            <Fx s="display:flex;flex-direction:column;gap:14px">
              {perks.map((perk) => (
                <Fx key={perk.title} s="display:flex;align-items:flex-start;gap:12px">
                  <Fx
                    as="span"
                    s="width:32px;height:32px;flex:none;border-radius:50%;background:rgba(255,239,229,.14);display:flex;align-items:center;justify-content:center;font-size:14px"
                  >
                    {perk.icon}
                  </Fx>
                  <Fx as="span" s="line-height:1.5">
                    <Fx as="span" s="display:block;font-weight:700;font-size:14.5px">
                      {perk.title}
                    </Fx>
                    <Fx as="span" s="display:block;font-size:13px;color:rgba(255,239,229,.62);margin-top:2px">
                      {perk.body}
                    </Fx>
                  </Fx>
                </Fx>
              ))}
            </Fx>
            <Fx s="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
              {stats.map((stat) => (
                <Fx key={stat.label} s="background:rgba(255,239,229,.08);border-radius:22px;padding:16px 14px">
                  <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:24px;letter-spacing:-0.03em;color:#FFB58A">
                    {stat.value}
                  </Fx>
                  <Fx s="font-size:11.5px;line-height:1.35;color:rgba(255,239,229,.6);margin-top:5px">{stat.label}</Fx>
                </Fx>
              ))}
            </Fx>
            <Fx>
              <Fx s="background:rgba(255,239,229,.08);border-radius:24px;padding:20px 22px">
                <Fx s="font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#FFB58A">
                  Prices
                </Fx>
                <Fx as="p" s="font-size:13.5px;line-height:1.6;color:rgba(255,239,229,.72);margin:10px 0 0">
                  Every price on this site is a starting guide. Region, currency and scope change the final number — we
                  always confirm before charging anything.
                </Fx>
              </Fx>
            </Fx>
          </Fx>
        </Fx>
      </Fx>
    </Fx>
  );
}
