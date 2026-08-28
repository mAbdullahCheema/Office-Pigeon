/**
 * Central Supabase configuration.
 *
 * The URL and publishable key are safe to expose to the browser — row level
 * security in Postgres is what actually guards the data. Anything secret (the
 * secret key) is read server-side only.
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  '';

/**
 * Called by every client factory so a missing `.env.local` fails with a useful
 * message instead of an opaque error from inside `@supabase/ssr`.
 */
export function assertSupabaseEnv(): void {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
        'Copy .env.example to .env.local and fill them in.',
    );
  }
}

/**
 * Server-only. Bypasses row level security, so never import this from anything
 * that can reach the browser.
 */
export function supabaseSecretKey(): string {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'Missing SUPABASE_SECRET_KEY. Copy .env.example to .env.local and fill it in.',
    );
  }
  return key;
}

/** Storage buckets. Ids are fixed by the `create_storage_buckets` migration. */
export const BUCKETS = {
  /** Public read: images rendered on the marketing site. */
  media: 'media',
  attachments: 'attachments',
  /** Payment screenshots. Private — a proof shows a bank account or wallet. */
  proofs: 'proofs',
  /** Profile pictures. Public read so the avatar URL renders directly. */
  avatars: 'avatars',
  /** Deliverables exchanged with a customer. Private. */
  documents: 'documents',
} as const;

export type Bucket = (typeof BUCKETS)[keyof typeof BUCKETS];

/** Roles inside the staff table, mirrored from the `staff_role` enum. */
export const ROLES = {
  owner: 'owner',
  admin: 'admin',
  editor: 'editor',
} as const;

/**
 * Set alongside the Supabase session cookies when the visitor asked to stay
 * signed in. Those cookies are httpOnly and unreadable here, so this readable
 * companion is what the sign-out path consults.
 */
export const PERSIST_COOKIE = 'op_persist';

/** Cookie/consent preferences. Readable by the client banner. */
export const CONSENT_COOKIE = 'op_consent';

/**
 * The prefix Supabase gives its own auth cookies, derived from the project ref.
 * The proxy only needs to know whether *some* session cookie is present, and
 * matching the prefix avoids hard-coding a chunk index that Supabase may split
 * differently as a token grows.
 */
export const AUTH_COOKIE_PREFIX = (() => {
  try {
    // https://<ref>.supabase.co → sb-<ref>-auth-token
    const ref = new URL(supabaseUrl).hostname.split('.')[0];
    return ref ? `sb-${ref}-auth-token` : 'sb-';
  } catch {
    return 'sb-';
  }
})();

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
