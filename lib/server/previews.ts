import fs from 'fs/promises';
import path from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseAnonKey, getSupabaseUrl } from './env';

/**
 * Preview discovery + status, ported 1:1 from server.ts (Phase 3).
 *
 * Free-preview hosting: each `previews/<slug>/` folder is a built static site.
 * Disk scan is merged with a Supabase `preview_statuses` table. Shared by the
 * Next admin routes, /api/public/previews, and (next) the preview file server.
 */

export type PreviewStatus = 'live' | 'expired' | 'sold' | 'draft' | 'archived';
export const VALID_STATUSES: PreviewStatus[] = ['live', 'expired', 'sold', 'draft', 'archived'];
const SLUG_REGEX = /^[a-z0-9-]+$/;

export interface PreviewStatusRow {
  id?: string;
  slug: string;
  business_name?: string | null;
  status: PreviewStatus;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  removed_at?: string | null;
  removed_by_email?: string | null;
}

interface PreviewFolder {
  slug: string;
  business_name: string;
  url: string;
  exists_on_disk: boolean;
  has_index: boolean;
}

export const isValidSlug = (slug: string) => SLUG_REGEX.test(slug);

export const titleCaseSlug = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const previewDirCandidates = (): string[] =>
  Array.from(
    new Set(
      [
        path.join(process.cwd(), 'previews'),
        path.join(process.cwd(), 'dist', 'previews'),
        path.join(process.cwd(), 'public', 'previews'),
      ].map((p) => path.resolve(p)),
    ),
  );

// Service-role client (mirrors server.ts getSupabaseClient: service role OR anon).
let cached: SupabaseClient | null = null;
function getClient(): SupabaseClient | null {
  if (cached) return cached;
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey() || getSupabaseAnonKey();
  if (!url || !key) return null;
  cached = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return cached;
}

async function scanPreviewFolders(): Promise<PreviewFolder[]> {
  const folderMap = new Map<string, PreviewFolder>();
  for (const previewsDir of previewDirCandidates()) {
    const entries = await fs.readdir(previewsDir, { withFileTypes: true }).catch(() => []);
    const folders = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory() && isValidSlug(entry.name))
        .map(async (entry) => {
          const indexPath = path.join(previewsDir, entry.name, 'index.html');
          const hasIndex = await fs.access(indexPath).then(() => true).catch(() => false);
          return {
            slug: entry.name,
            business_name: titleCaseSlug(entry.name),
            url: `/previews/${entry.name}`,
            exists_on_disk: true,
            has_index: hasIndex,
          };
        }),
    );
    for (const folder of folders) {
      const existing = folderMap.get(folder.slug);
      folderMap.set(folder.slug, {
        ...folder,
        has_index: Boolean(existing?.has_index || folder.has_index),
      });
    }
  }
  return Array.from(folderMap.values()).sort((a, b) => a.slug.localeCompare(b.slug));
}

async function fetchPreviewStatuses(): Promise<Map<string, PreviewStatusRow>> {
  const client = getClient();
  if (!client) return new Map();
  const { data, error } = await client.from('preview_statuses').select('*');
  if (error) {
    console.error('[Office Pigeon API] Preview statuses fetch failed:', error);
    return new Map();
  }
  return new Map((data || []).map((row) => [row.slug, row as PreviewStatusRow]));
}

export async function mergePreviewRows() {
  const folders = await scanPreviewFolders();
  const statusRows = await fetchPreviewStatuses();
  const folderMap = new Map(folders.map((folder) => [folder.slug, folder]));
  const slugs = Array.from(new Set([...folders.map((f) => f.slug), ...statusRows.keys()])).sort();

  return slugs.map((slug) => {
    const folder = folderMap.get(slug);
    const status = statusRows.get(slug);
    return {
      slug,
      business_name: status?.business_name || folder?.business_name || titleCaseSlug(slug),
      status: status?.status || ('live' as PreviewStatus),
      url: `/previews/${slug}`,
      exists_on_disk: Boolean(folder?.exists_on_disk),
      has_index: Boolean(folder?.has_index),
      notes: status?.notes || null,
      created_at: status?.created_at || null,
      updated_at: status?.updated_at || null,
      removed_at: status?.removed_at || null,
      removed_by_email: status?.removed_by_email || null,
    };
  });
}

export async function getPreviewStatus(slug: string): Promise<PreviewStatusRow | null> {
  const client = getClient();
  if (!client) return { slug, status: 'live' };
  const { data, error } = await client.from('preview_statuses').select('*').eq('slug', slug).maybeSingle();
  if (error) {
    console.error('[Office Pigeon API] Preview status lookup failed:', error);
    return { slug, status: 'live' };
  }
  return data as PreviewStatusRow | null;
}
