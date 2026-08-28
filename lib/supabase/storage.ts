import 'server-only';

import { randomUUID } from 'node:crypto';

import { admin } from './admin';
import { BUCKETS, supabaseUrl, type Bucket } from './config';

export { BUCKETS, type Bucket };

/** Buckets served straight from the CDN. Everything else needs a signed URL. */
const PUBLIC_BUCKETS: ReadonlySet<string> = new Set([BUCKETS.media, BUCKETS.avatars]);

/**
 * Every private object is filed under its owner's user id.
 *
 * The storage policies compare that first path segment against `auth.uid()`, so
 * the convention is not cosmetic — it is the access check. A random uuid in the
 * filename means two uploads of `invoice.pdf` never collide, and the original
 * name is kept in the database row rather than in the path.
 */
export function ownedPath(userId: string, filename: string): string {
  return `${userId}/${randomUUID()}${extensionOf(filename)}`;
}

/** Shared media has no owner, so it is flat — but still collision-proof. */
export function sharedPath(filename: string): string {
  return `${randomUUID()}${extensionOf(filename)}`;
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot <= 0 || dot === filename.length - 1) return '';
  // Anything exotic in the extension would end up in a URL; keep it boring.
  const extension = filename.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '');
  return extension ? `.${extension}` : '';
}

/**
 * Permanent CDN URL for a file in a public bucket. Throws for private buckets
 * rather than returning a URL that would 404 — a silently broken image is worse
 * than a stack trace.
 */
export function publicUrl(bucket: Bucket, path: string): string {
  if (!PUBLIC_BUCKETS.has(bucket)) {
    throw new Error(`Bucket "${bucket}" is private. Use signedUrl() instead of publicUrl().`);
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeURI(path)}`;
}

/**
 * Time-limited URL for a file in a private bucket.
 *
 * Signed with the secret key, so the caller has already decided the viewer is
 * allowed to see this file. Default expiry is one hour.
 */
export async function signedUrl(bucket: Bucket, path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await admin().storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error || !data) throw new Error(`Could not sign ${bucket}/${path}: ${error?.message}`);
  return data.signedUrl;
}

/**
 * Stores a file and hands back the path it landed at.
 *
 * `upsert` stays off: every path already carries a uuid, so a collision means
 * something is wrong and should fail loudly rather than overwrite.
 */
export async function upload(
  bucket: Bucket,
  path: string,
  file: File | Blob | ArrayBuffer | Buffer,
  contentType?: string,
): Promise<string> {
  const body = file instanceof Buffer ? new Uint8Array(file) : file;

  const { error } = await admin()
    .storage.from(bucket)
    .upload(path, body, { contentType, upsert: false });

  if (error) throw new Error(`Upload to ${bucket}/${path} failed: ${error.message}`);
  return path;
}

/** Deletes objects. Missing paths are not an error — the end state is the same. */
export async function remove(bucket: Bucket, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await admin().storage.from(bucket).remove(paths);
  if (error) throw new Error(`Delete from ${bucket} failed: ${error.message}`);
}

export type StoredFile = {
  name: string;
  path: string;
  size: number;
  mimeType: string | null;
  createdAt: string | null;
};

/** Lists a bucket, flattening the one level of folders the app ever creates. */
export async function list(bucket: Bucket, prefix = '', limit = 100): Promise<StoredFile[]> {
  const { data, error } = await admin()
    .storage.from(bucket)
    .list(prefix, { limit, sortBy: { column: 'created_at', order: 'desc' } });

  if (error) throw new Error(`Listing ${bucket} failed: ${error.message}`);

  return (data ?? [])
    // A folder entry has no id; only real objects are of interest here.
    .filter((entry) => entry.id)
    .map((entry) => ({
      name: entry.name,
      path: prefix ? `${prefix}/${entry.name}` : entry.name,
      size: Number(entry.metadata?.size ?? 0),
      mimeType: (entry.metadata?.mimetype as string | undefined) ?? null,
      createdAt: entry.created_at ?? null,
    }));
}

/** Pulls the bytes back, for the routes that stream a private file themselves. */
export async function download(
  bucket: Bucket,
  path: string,
): Promise<{ bytes: ArrayBuffer; mimeType: string }> {
  const { data, error } = await admin().storage.from(bucket).download(path);
  if (error || !data) throw new Error(`Download of ${bucket}/${path} failed: ${error?.message}`);
  return { bytes: await data.arrayBuffer(), mimeType: data.type || 'application/octet-stream' };
}
