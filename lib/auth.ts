import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { admin } from './supabase/admin';
import { BUCKETS, PERSIST_COOKIE, ROLES } from './supabase/config';
import { createClient } from './supabase/server';
import { publicUrl } from './supabase/storage';
import type { ProfileRow, StaffRole } from './supabase/types';
import { routes } from './routes';

export type { StaffRole };

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
};

/* ── "Keep me signed in" ─────────────────────────────────────────────── */

const secure = process.env.NODE_ENV === 'production';

/**
 * Records the visitor's choice before the session cookies are written.
 *
 * Supabase's own cookies are httpOnly and unreadable from here, so this
 * companion is what tells `lib/supabase/server.ts` and the proxy whether to
 * keep the expiry Supabase asked for or drop it, turning the session cookies
 * into ones the browser discards when the window closes.
 */
export async function setPersistence(persist: boolean) {
  const store = await cookies();
  store.set(PERSIST_COOKIE, persist ? '1' : '0', {
    httpOnly: false,
    sameSite: 'lax',
    secure,
    path: '/',
    ...(persist ? { maxAge: 60 * 60 * 24 * 400 } : {}),
  });
}

/* ── Sign in / up / out ──────────────────────────────────────────────── */

/** Signs in with email and password. Throws on bad credentials. */
export async function signIn(email: string, password: string, persist = true) {
  await setPersistence(persist);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

/**
 * Creates an account and signs straight in.
 *
 * Deliberately not `supabase.auth.signUp`: that sends a confirmation email, and
 * this project has no mail provider — the link would either never arrive or be
 * rate-limited into uselessness, leaving the account unusable and the visitor
 * with no way to tell. Creating it already confirmed makes registration
 * self-contained, which is the behaviour that was chosen for this deployment.
 *
 * The route that calls this rate-limits by address first, and the profile row
 * is created by the `on_auth_user_created` trigger.
 */
export async function signUp(email: string, password: string, name: string, persist = true) {
  const { error } = await admin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error) throw error;

  // Sign in through the normal path so the session cookies are written exactly
  // as they are for any other sign-in.
  return signIn(email, password, persist);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const store = await cookies();
  store.delete(PERSIST_COOKIE);
}

/* ── Who is signed in ────────────────────────────────────────────────── */

/**
 * The signed-in account and its staff role, or null.
 *
 * `getUser()` rather than `getSession()`: the former revalidates the token with
 * the auth server, so a revoked session does not keep reading as valid from a
 * cookie the browser still holds.
 *
 * Wrapped in `cache`, so a request that renders the shell, the layout, the page
 * and a server action all in one pass asks Supabase exactly once. Never throws:
 * a broken or expired session reads as signed out.
 */
const session = cache(async function session(): Promise<{
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role: StaffRole | null;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  // Row level security lets a non-staff account read nothing here, so "no row"
  // and "not staff" are the same answer and neither is an error.
  const { data: staff } = await supabase
    .from('staff')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  const metadata = user.user_metadata ?? {};
  const name =
    (typeof metadata.name === 'string' && metadata.name) ||
    (typeof metadata.full_name === 'string' && metadata.full_name) ||
    user.email ||
    '';

  return {
    id: user.id,
    email: user.email ?? '',
    name,
    emailVerified: Boolean(user.email_confirmed_at),
    role: staff?.role ?? null,
  };
});

/** The signed-in staff member, or null. Never throws. */
export async function currentStaff(): Promise<StaffUser | null> {
  const current = await session();
  if (!current?.role) return null;
  return { id: current.id, name: current.name, email: current.email, role: current.role };
}

export type NavIdentity = {
  name: string;
  role: 'admin' | 'customer';
};

/**
 * Just enough about the signed-in visitor to draw the nav.
 *
 * The public pages used to call `currentViewer()` for this, which additionally
 * reads the customer profile — a second round trip on every marketing page, for
 * two strings. The dashboard still uses the full reader; nothing else needs it.
 */
export async function currentIdentity(): Promise<NavIdentity | null> {
  const current = await session();
  if (!current) return null;
  return { name: current.name, role: current.role ? 'admin' : 'customer' };
}

export type Viewer = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  /** The staff role, or null for a customer. */
  staffRole: StaffRole | null;
  emailVerified: boolean;
  avatarUrl: string | null;
  phone: string;
  company: string;
  country: string;
  city: string;
  address: string;
  notify: {
    orders: boolean;
    invoices: boolean;
    classes: boolean;
    news: boolean;
  };
};

/**
 * Whoever is signed in — a customer, or a staff member who additionally sees
 * the admin sections of the same dashboard. Never throws: a broken or expired
 * session reads as signed out, which every caller already handles.
 */
export const currentViewer = cache(async function currentViewer(): Promise<Viewer | null> {
  const current = await session();
  if (!current) return null;

  const supabase = await createClient();

  // The profile is the customer-editable half of the account, and the database
  // creates it on sign-up. Reading it must not be able to sign the viewer out,
  // so a failure degrades to defaults rather than propagating.
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', current.id)
    .maybeSingle();
  const profile = data as ProfileRow | null;

  return {
    id: current.id,
    name: profile?.name || current.name,
    email: current.email,
    role: current.role ? 'admin' : 'customer',
    staffRole: current.role,
    emailVerified: current.emailVerified,
    avatarUrl: avatarUrlFor(profile?.avatar_path),
    phone: profile?.phone ?? '',
    company: profile?.company ?? '',
    country: profile?.country ?? '',
    city: profile?.city ?? '',
    address: profile?.address ?? '',
    notify: {
      orders: profile?.notify_orders ?? true,
      invoices: profile?.notify_invoices ?? true,
      classes: profile?.notify_classes ?? true,
      news: profile?.notify_news ?? false,
    },
  };
});

/** CDN URL for an avatar. The avatars bucket is public read, so no signing. */
export function avatarUrlFor(path?: string | null): string | null {
  return path ? publicUrl(BUCKETS.avatars, path) : null;
}

/* ── Guards ──────────────────────────────────────────────────────────── */

/** Use in server components and route handlers that must be staff-only. */
export async function requireStaff(): Promise<StaffUser> {
  const staff = await currentStaff();
  if (!staff) throw new Error('UNAUTHORIZED');
  return staff;
}

/**
 * Use wherever any signed-in person is enough.
 *
 * Sends the visitor to sign in rather than throwing. The proxy already turns
 * away anyone with no session cookie at all, so what reaches here is a cookie
 * whose session has expired or been revoked — routine, and the visitor should
 * see the sign-in page, not an error screen.
 */
export async function requireViewer(): Promise<Viewer> {
  const viewer = await currentViewer();
  if (!viewer) redirect(`${routes.login}?next=${encodeURIComponent(routes.dashboard)}`);
  return viewer;
}

export function canEdit(staff: StaffUser) {
  return staff.role === ROLES.owner || staff.role === ROLES.admin || staff.role === ROLES.editor;
}

export function canManageTeam(staff: StaffUser) {
  return staff.role === ROLES.owner || staff.role === ROLES.admin;
}

/**
 * Confirms the viewer is allowed to see a record.
 *
 * Ownership is checked on user id first and email second, because orders and
 * invoices raised before the customer had an account only carry the address.
 * The same two-part test is written into the row level security policies, so
 * the server and the database agree on what "mine" means.
 */
export function owns(
  viewer: Pick<Viewer, 'id' | 'email' | 'role'>,
  record: { user_id?: string | null; email?: string | null },
): boolean {
  if (viewer.role === 'admin') return true;
  if (record.user_id && record.user_id === viewer.id) return true;
  return Boolean(
    record.email && viewer.email && record.email.toLowerCase() === viewer.email.toLowerCase(),
  );
}
