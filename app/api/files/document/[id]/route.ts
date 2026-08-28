import { guard } from '@/lib/api-guard';
import { currentViewer } from '@/lib/auth';
import { getCustomerFile } from '@/lib/data';
import { BUCKETS, download } from '@/lib/supabase/storage';

/**
 * Serves a file filed against a customer's account.
 *
 * As with payment proofs, the id is the record rather than the stored object,
 * so access is decided by who the record belongs to. `visible` is honoured too:
 * staff can stage a deliverable before the customer is meant to see it.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await currentViewer();
  if (!viewer) return new Response('Unauthorized', { status: 401 });

  const limit = await guard(request, 'api', viewer.id);
  if (!limit.ok) return limit.limited();

  const { id } = await params;
  const record = await getCustomerFile(id).catch(() => null);
  if (!record) return new Response('Not found', { status: 404 });

  const isOwner = record.user_id === viewer.id;
  const allowed = viewer.role === 'admin' || (isOwner && record.visible);
  if (!allowed) return new Response('Not found', { status: 404 });

  try {
    const { bytes, mimeType } = await download(BUCKETS.documents, record.path);

    return new Response(bytes, {
      headers: {
        'Content-Type': record.mime_type || mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(record.name)}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
