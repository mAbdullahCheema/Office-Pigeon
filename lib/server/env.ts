/** Env accessors mirroring server.ts (multi-name fallbacks). Phase 3 parity. */
export const getEnv = (...names: string[]): string | undefined => {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) return value.trim();
  }
  return undefined;
};

export const getSupabaseUrl = () =>
  getEnv('SUPABASE_URL', 'VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
export const getSupabaseAnonKey = () =>
  getEnv('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
export const getSupabaseServiceRoleKey = () => getEnv('SUPABASE_SERVICE_ROLE_KEY');

export const adminEmails = (): string[] =>
  (process.env.ADMIN_EMAILS || 'm.abdullahcheema9@gmail.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
