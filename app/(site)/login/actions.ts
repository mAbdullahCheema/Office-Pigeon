'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { currentViewer, signIn, signOut, signUp } from '@/lib/auth';
import { claimOrdersForUser } from '@/lib/data';
import { rateLimit } from '@/lib/rate-limit';
import { safeRedirect } from '@/lib/redirect-target';
import { routes } from '@/lib/routes';
import { fieldErrors, signInSchema } from '@/lib/validation';

export type AuthState = { error?: string; sent?: boolean };

/**
 * Server actions do not receive the Request, so the limiter is keyed off the
 * forwarded address on the incoming headers instead.
 */
async function actorKey(): Promise<string> {
  const store = await headers();
  const forwarded = store.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || store.get('x-real-ip') || 'unknown';
}

async function landing(formData: FormData): Promise<string> {
  const requested = safeRedirect(String(formData.get('next') ?? ''), '');
  if (requested) return requested;
  const viewer = await currentViewer();
  return viewer ? routes.dashboard : routes.login;
}

/** "Keep me signed in" is opt-out: unticked means a browser-session cookie. */
function wantsPersistence(formData: FormData): boolean {
  return formData.get('remember') !== 'off';
}

/** Guest orders placed with this address become the customer's on sign-in. */
async function attachHistory() {
  const viewer = await currentViewer();
  if (!viewer) return;
  await claimOrdersForUser(viewer.id, viewer.email).catch(() => undefined);
}

export async function signInCustomer(_: AuthState, formData: FormData): Promise<AuthState> {
  const limit = await rateLimit('authStrict', await actorKey());
  if (!limit.ok) {
    return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.` };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    return { error: errors.email ?? errors.password ?? 'Check your details' };
  }

  try {
    await signIn(parsed.data.email, parsed.data.password, wantsPersistence(formData));
  } catch {
    // Deliberately identical whether the address exists or the password is
    // wrong: a distinguishable message enumerates accounts.
    return { error: 'Wrong email or password.' };
  }

  await attachHistory();
  redirect(await landing(formData));
}

export async function registerCustomer(_: AuthState, formData: FormData): Promise<AuthState> {
  const limit = await rateLimit('auth', await actorKey());
  if (!limit.ok) {
    return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.` };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    return { error: errors.email ?? errors.password ?? 'Check your details' };
  }

  if (formData.get('consent') !== 'on') {
    return { error: 'Please accept the terms to create an account.' };
  }

  const name = String(formData.get('name') ?? '').trim();

  try {
    await signUp(
      parsed.data.email,
      parsed.data.password,
      name || parsed.data.email,
      wantsPersistence(formData),
    );
  } catch (error) {
    const message = (error as Error).message ?? '';
    if (/already registered|already exists|already been registered|User already/i.test(message)) {
      return { error: 'That email already has an account — sign in instead.' };
    }
    return { error: 'We could not create that account. Try again, or message us.' };
  }

  await attachHistory();
  redirect(await landing(formData));
}

/**
 * Asks a person for help getting back in.
 *
 * There is no mail provider, so there is no reset link to send. Rather than
 * pretend — a "check your inbox" for mail that will never arrive is worse than
 * saying so — this records nothing and the sign-in page shows the ways to reach
 * a human, who sets a new password from the dashboard.
 */
export async function requestRecovery(_: AuthState, formData: FormData): Promise<AuthState> {
  const limit = await rateLimit('authStrict', await actorKey());
  if (!limit.ok) {
    return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.` };
  }

  const email = String(formData.get('field') ?? '').trim();
  if (!email.includes('@')) {
    return { error: 'Enter the email address on the account.' };
  }

  return { sent: true };
}

export async function signOutCustomer() {
  await signOut();
  redirect(routes.home);
}
