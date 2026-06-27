import { NextResponse } from 'next/server';
import { adminEmails, getSupabaseAnonKey, getSupabaseUrl } from '@/lib/server/env';

/** Ported from server.ts `/api/admin/config`. Public config for the Admin login UI. */
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    supabaseUrl: getSupabaseUrl() || '',
    supabaseAnonKey: getSupabaseAnonKey() || '',
    adminEmails: adminEmails(),
  });
}
