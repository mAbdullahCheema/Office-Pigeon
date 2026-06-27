import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { adminEmails, getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from './env';

/**
 * Admin session verification for the preview manager, ported from server.ts.
 * The Admin UI logs in client-side via Supabase Auth and sends the access
 * token as `Authorization: Bearer <token>`; we verify it + check the allowlist.
 */

export interface AdminAuthError {
  status: number;
  message: string;
}
export type AdminAuthResult = { email: string } | { error: AdminAuthError };

let authClient: SupabaseClient | null = null;
function getSupabaseAuthClient(): SupabaseClient | null {
  if (authClient) return authClient;
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey() || getSupabaseServiceRoleKey();
  if (!url || !key) return null;
  authClient = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return authClient;
}

export async function requireAdmin(headers: Headers): Promise<AdminAuthResult> {
  const header = headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';

  if (!token) return { error: { status: 401, message: 'Missing admin session.' } };

  const client = getSupabaseAuthClient();
  if (!client) return { error: { status: 503, message: 'Supabase Auth is not configured.' } };

  const { data, error } = await client.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();

  if (error || !email) return { error: { status: 401, message: 'Invalid admin session.' } };
  if (!adminEmails().includes(email)) {
    return { error: { status: 403, message: 'This account is not allowed to manage previews.' } };
  }
  return { email };
}
