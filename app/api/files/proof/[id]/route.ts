import { guard } from '@/lib/api-guard';
import { currentViewer, owns } from '@/lib/auth';
import { getPayment } from '@/lib/data';
import { BUCKETS, download } from '@/lib/supabase/storage';

/**
 * Serves a payment screenshot.
 *
 * The proofs bucket has no public read, so every byte comes through here and
 * only after the viewer is shown to own the payment. The id in the URL is the
 * payment row, never the object path: a path leaked from one customer's page
 * would otherwise be enough to ask for another's receipt.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await currentViewer();
  if (!viewer) return new Response('Unauthorized', { status: 401 });

  // Each hit streams a file out of Supabase, so it is worth a budget even for a
  // signed-in caller. Keyed by the account, not the address.
  const limit = await guard(request, 'api', viewer.id);
  if (!limit.ok) return limit.limited();

  const { id } = await params;
  const payment = await getPayment(id).catch(() => null);
  if (!payment?.proof_path) return new Response('Not found', { status: 404 });
  if (!owns(viewer, payment)) return new Response('Not found', { status: 404 });

  try {
    const { bytes, mimeType } = await download(BUCKETS.proofs, payment.proof_path);

    return new Response(bytes, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(payment.proof_name ?? payment.ref)}"`,
        // Receipts are personal: no shared cache may hold a copy.
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
