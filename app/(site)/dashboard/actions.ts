'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { audit } from '@/lib/audit';
import { canEdit, canManageTeam, requireStaff, requireViewer, type StaffUser } from '@/lib/auth';
import { purgeContent, purgeViewer } from '@/lib/cache';
import { formToRow, InvalidFieldError } from '@/lib/dashboard/coerce';
import { findResource, type Resource } from '@/lib/dashboard/resources';
import {
  appendThreadMessage,
  createCustomerFile,
  createPayment,
  createThread,
  deleteCustomerFile,
  getCustomerFile,
  getOrder,
  getPayment,
  getProfile,
  getThread,
  markNotificationsRead,
  nextInvoiceNumber,
  nextOrderRef,
  nextPaymentRef,
  updateOrder,
  updatePayment,
  updateProfile,
} from '@/lib/data';
import { notifyStaff, notifyUser } from '@/lib/messaging';
import { rateLimit } from '@/lib/rate-limit';
import { routes } from '@/lib/routes';
import { admin } from '@/lib/supabase/admin';
import {
  BUCKETS,
  ownedPath,
  remove as removeObject,
  sharedPath,
  upload,
} from '@/lib/supabase/storage';
import type { StaffRole } from '@/lib/supabase/types';

/* ── Guards ──────────────────────────────────────────────────────────── */

/** Server actions get no Request, so the limiter keys off the proxy headers. */
async function actorKey(fallback: string): Promise<string> {
  const store = await headers();
  const forwarded = store.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || store.get('x-real-ip') || fallback;
}

async function editor(): Promise<StaffUser> {
  const staff = await requireStaff();
  if (!canEdit(staff)) throw new Error('FORBIDDEN');

  const limit = await rateLimit('adminWrite', await actorKey(staff.id));
  if (!limit.ok) throw new Error('RATE_LIMITED');

  return staff;
}

async function manager(): Promise<StaffUser> {
  const staff = await requireStaff();
  if (!canManageTeam(staff)) throw new Error('FORBIDDEN');
  return staff;
}

/* ── Paths ───────────────────────────────────────────────────────────── */

const managePath = (resourceId: string) => `${routes.dashboard}/manage/${resourceId}`;

/** Revalidates the dashboard, plus the public site when content changed. */
function refresh(paths: string[], alsoPublic = false) {
  for (const path of paths) revalidatePath(path);
  if (alsoPublic) revalidatePath('/', 'layout');
}

function backTo(path: string, params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  redirect(query ? `${path}?${query}` : path);
}

/* ── Generic CRUD over any registered resource ───────────────────────── */

/**
 * Fills in the identifier a human should not have to invent.
 *
 * Orders, invoices and payments all carry a sequential reference the business
 * quotes out loud; leaving the field blank on create allocates the next one
 * rather than writing an empty string into a unique index.
 */
async function withAllocatedRef(resource: Resource, data: Record<string, unknown>) {
  if (resource.id === 'orders' && !data.ref) data.ref = await nextOrderRef();
  if (resource.id === 'invoices' && !data.number) data.number = await nextInvoiceNumber();
  if (resource.id === 'payments' && !data.ref) data.ref = await nextPaymentRef();
  return data;
}

/**
 * An invoice whose total was left at zero is almost always one where the line
 * items are the real answer, so compute it rather than billing nothing.
 */
function settleInvoiceTotal(data: Record<string, unknown>) {
  if (Number(data.total) > 0) return;

  let subtotal = Number(data.subtotal) || 0;

  if (!subtotal && Array.isArray(data.line_items)) {
    const items = data.line_items as { qty?: number; unitPrice?: number }[];
    subtotal = items.reduce(
      (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0),
      0,
    );
    data.subtotal = subtotal;
  }

  const total = subtotal - (Number(data.discount) || 0) + (Number(data.tax) || 0);
  data.total = Math.max(0, total);
}

/** Which resources, when written, change what a visitor sees on the public site. */
function touchesPublicSite(resource: Resource): boolean {
  return resource.group === 'Content' || resource.id === 'methods' || resource.id === 'settings';
}

export async function saveRecordAction(formData: FormData) {
  const staff = await editor();

  const resourceId = String(formData.get('resource') ?? '');
  const resource = findResource(resourceId);
  if (!resource) throw new Error('UNKNOWN_RESOURCE');

  const id = String(formData.get('id') ?? '');
  if (!id && resource.creatable === false) throw new Error('NOT_CREATABLE');

  let data: Record<string, unknown>;
  try {
    data = formToRow(resource.fields, formData);
  } catch (error) {
    if (error instanceof InvalidFieldError) {
      backTo(managePath(resource.id), { error: error.message, ...(id ? { edit: id } : { new: '1' }) });
      return;
    }
    throw error;
  }

  if (!id) await withAllocatedRef(resource, data);
  if (resource.id === 'invoices') settleInvoiceTotal(data);

  let rowId = id;
  try {
    if (id) {
      const { error } = await admin()
        .from(resource.table)
        .update(data as never)
        .eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      const { data: row, error } = await admin()
        .from(resource.table)
        .insert(data as never)
        .select('id')
        .single();
      if (error) throw new Error(error.message);
      rowId = (row as { id: string }).id;
    }
  } catch (error) {
    // A constraint the form cannot pre-empt — a duplicate key, a missing
    // catalog item behind a plan — should come back as a message on the form,
    // not as an error screen.
    backTo(managePath(resource.id), {
      error: (error as Error).message,
      ...(id ? { edit: id } : { new: '1' }),
    });
    return;
  }

  await audit(staff, id ? `${resource.id}.update` : `${resource.id}.create`, rowId);

  const isPublic = touchesPublicSite(resource);
  if (isPublic) await purgeContent();
  if (typeof data.user_id === 'string' && data.user_id) await purgeViewer(data.user_id);

  refresh([managePath(resource.id), routes.dashboard], isPublic);
  backTo(managePath(resource.id), { saved: rowId });
}

export async function deleteRecordAction(formData: FormData) {
  const staff = await editor();

  const resource = findResource(String(formData.get('resource') ?? ''));
  if (!resource) throw new Error('UNKNOWN_RESOURCE');
  if (resource.deletable === false) throw new Error('NOT_DELETABLE');

  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('MISSING_ID');

  const { error } = await admin().from(resource.table).delete().eq('id', id);
  if (error) {
    backTo(managePath(resource.id), { error: error.message });
    return;
  }

  await audit(staff, `${resource.id}.delete`, id);

  const isPublic = touchesPublicSite(resource);
  if (isPublic) await purgeContent();

  refresh([managePath(resource.id), routes.dashboard], isPublic);
  backTo(managePath(resource.id), { deleted: '1' });
}

/* ── Payments ────────────────────────────────────────────────────────── */

/**
 * Accepts or rejects a customer's transfer.
 *
 * Accepting is the only path that moves money-related state on the order, so
 * the two writes live together here rather than being left to an admin to
 * remember: the payment is marked verified and the order's paid total, payment
 * status and lifecycle status all move with it.
 */
export async function reviewPaymentAction(formData: FormData) {
  const staff = await editor();

  const id = String(formData.get('id'));
  const decision = String(formData.get('decision'));
  const adminNote = String(formData.get('adminNote') ?? '').trim();

  if (decision !== 'verified' && decision !== 'rejected' && decision !== 'refunded') {
    throw new Error('UNKNOWN_DECISION');
  }

  const payment = await getPayment(id);

  await updatePayment(id, {
    status: decision,
    admin_note: adminNote || payment.admin_note,
    reviewed_by: staff.name,
    reviewed_at: new Date().toISOString(),
  });

  if (payment.order_id) {
    const order = await getOrder(payment.order_id).catch(() => null);

    if (order) {
      const moved = Number(payment.amount_usd) || Number(payment.amount) || 0;

      if (decision === 'verified') {
        const paid = Number(order.amount_paid ?? 0) + moved;
        const due = Number(order.amount_due) || order.price || 0;
        const settled = due > 0 ? paid + 0.001 >= due : paid > 0;

        await updateOrder(order.id, {
          amount_paid: paid,
          payment_status: settled ? 'paid' : 'partially_paid',
          paid_at: settled ? new Date().toISOString() : order.paid_at,
          ...(settled && order.status === 'Awaiting payment'
            ? { status: 'Confirmed' as const, verified: true }
            : {}),
        });
      } else if (decision === 'refunded') {
        const paid = Math.max(0, Number(order.amount_paid ?? 0) - moved);
        await updateOrder(order.id, {
          amount_paid: paid,
          payment_status: paid > 0 ? 'partially_paid' : 'refunded',
        });
      }
    }
  }

  await audit(staff, 'payment.review', id, decision);

  // The customer submitted this and then heard nothing. Tell them the outcome
  // in the same place they submitted it.
  if (payment.user_id) {
    const outcome =
      decision === 'verified'
        ? 'Payment confirmed'
        : decision === 'rejected'
          ? 'We could not match that payment'
          : 'Payment refunded';

    await notifyUser(payment.user_id, {
      kind: 'payment',
      title: outcome,
      body:
        adminNote ||
        (decision === 'verified'
          ? `We have received ${payment.ref}${payment.order_ref ? ` for order ${payment.order_ref}` : ''}.`
          : 'Open the payment for details, or message us and we will look into it.'),
      href: `${routes.dashboard}/billing`,
    });

    await purgeViewer(payment.user_id);
  }
  refresh([
    managePath('payments'),
    managePath('orders'),
    routes.dashboard,
    `${routes.dashboard}/orders`,
    `${routes.dashboard}/billing`,
  ]);
}

/* ── Media ───────────────────────────────────────────────────────────── */

const IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
]);

export async function uploadMediaAction(formData: FormData) {
  const staff = await editor();
  const file = formData.get('file');

  if (!(file instanceof File) || file.size === 0) return;
  if (!IMAGE_TYPES.has(file.type)) throw new Error('UNSUPPORTED_TYPE');

  const path = await upload(BUCKETS.media, sharedPath(file.name), file, file.type);

  await audit(staff, 'media.upload', path, file.name);
  refresh([`${routes.dashboard}/manage/media`], true);
}

export async function deleteMediaAction(formData: FormData) {
  const staff = await editor();
  const path = String(formData.get('path'));

  await removeObject(BUCKETS.media, [path]);
  await audit(staff, 'media.delete', path);

  refresh([`${routes.dashboard}/manage/media`], true);
}

/* ── Team ────────────────────────────────────────────────────────────── */

const TEAM_PATH = `${routes.dashboard}/manage/team`;

/**
 * Adds someone to the team, inviting them if they have no account yet.
 *
 * The invitation is an Auth concern and membership is a row in `staff`, so the
 * action does the two in order and tolerates the common case of inviting
 * somebody who already has an account.
 */
export async function inviteStaffAction(formData: FormData) {
  const staff = await manager();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const role = String(formData.get('role')) as StaffRole;
  const name = String(formData.get('name') ?? '').trim();

  if (!email) {
    backTo(TEAM_PATH, { error: 'Enter an email address.' });
    return;
  }

  const client = admin();

  // An existing customer being promoted to staff is the common case, so look
  // before inviting rather than treating "already registered" as a failure.
  const { data: existing } = await client.from('profiles').select('id').ilike('email', email).maybeSingle();
  let userId = existing?.id ?? null;

  if (!userId) {
    const { data, error } = await client.auth.admin.inviteUserByEmail(email, {
      data: name ? { name } : undefined,
    });
    if (error || !data.user) {
      backTo(TEAM_PATH, { error: error?.message ?? 'Could not send that invitation.' });
      return;
    }
    userId = data.user.id;
  }

  const { error } = await client.from('staff').upsert({ user_id: userId, role });
  if (error) {
    backTo(TEAM_PATH, { error: error.message });
    return;
  }

  await audit(staff, 'team.invite', email, role);
  refresh([TEAM_PATH]);
  backTo(TEAM_PATH, { saved: '1' });
}

export async function removeStaffAction(formData: FormData) {
  const staff = await manager();
  const userId = String(formData.get('userId'));

  const client = admin();

  // Removing the last owner would lock everyone out of the admin sections.
  const { data: owners } = await client.from('staff').select('user_id').eq('role', 'owner');
  const target = await client.from('staff').select('role').eq('user_id', userId).maybeSingle();

  if (target.data?.role === 'owner' && (owners?.length ?? 0) <= 1) {
    backTo(TEAM_PATH, { error: 'That is the last owner — promote someone else first.' });
    return;
  }

  const { error } = await client.from('staff').delete().eq('user_id', userId);
  if (error) {
    backTo(TEAM_PATH, { error: error.message });
    return;
  }

  await audit(staff, 'team.remove', userId);
  refresh([TEAM_PATH]);
  backTo(TEAM_PATH, { saved: '1' });
}

export async function sendTestAlertAction() {
  const staff = await manager();
  const written = await notifyStaff({
    kind: 'system',
    title: 'Test alert',
    body: `Sent by ${staff.name}. If you can see this in Notifications, alerts are working.`,
    href: `${routes.dashboard}/notifications`,
  });
  await audit(staff, 'notification.test', undefined, written ? 'written' : 'failed');

  refresh([TEAM_PATH, `${routes.dashboard}/notifications`]);
  backTo(TEAM_PATH, written ? { saved: '1' } : { error: 'Could not write the notification.' });
}

/* ── Customer-side actions ───────────────────────────────────────────── */

const PROOF_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);
const AVATAR_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/avif']);

/**
 * Records a transfer the customer says they have made.
 *
 * Nothing here is trusted: the amount and reference are the customer's claim,
 * the order is re-read server-side to confirm they own it, and the row lands as
 * `submitted` for a human to check.
 */
export async function submitPaymentAction(formData: FormData) {
  const viewer = await requireViewer();

  const limit = await rateLimit('upload', viewer.id);
  if (!limit.ok) {
    backTo(`${routes.dashboard}/orders`, { error: 'Too many submissions. Try again shortly.' });
    return;
  }

  const orderId = String(formData.get('orderId') ?? '');
  const order = await getOrder(orderId).catch(() => null);

  if (!order) {
    backTo(`${routes.dashboard}/orders`, { error: 'That order no longer exists.' });
    return;
  }

  const mine =
    order.user_id === viewer.id ||
    (order.email ?? '').toLowerCase() === viewer.email.toLowerCase() ||
    viewer.role === 'admin';
  if (!mine) throw new Error('FORBIDDEN');

  const payPath = `${routes.dashboard}/orders/${order.id}/pay`;

  const method = String(formData.get('method') ?? '').trim();
  const methodLabel = String(formData.get('methodLabel') ?? '').trim();
  const currency = String(formData.get('currency') ?? 'USD').trim() || 'USD';
  const reference = String(formData.get('reference') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();
  const amount = Number(formData.get('amount') ?? 0);

  if (!method) {
    backTo(payPath, { error: 'Pick how you paid.' });
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    backTo(payPath, { error: 'Enter the amount you sent.' });
    return;
  }

  const proof = formData.get('proof');
  if (!(proof instanceof File) || proof.size === 0) {
    backTo(payPath, { error: 'Attach a screenshot or receipt so we can match the transfer.' });
    return;
  }
  if (!PROOF_TYPES.has(proof.type)) {
    backTo(payPath, { error: 'The screenshot must be a PNG, JPG, WebP or PDF.' });
    return;
  }
  if (proof.size > 10 * 1024 * 1024) {
    backTo(payPath, { error: 'That file is over 10 MB.' });
    return;
  }

  // Filed under the payer's own id: that first path segment is what the storage
  // policy checks, so nobody else can read it even with the path in hand.
  const proofPath = await upload(
    BUCKETS.proofs,
    ownedPath(viewer.id, proof.name),
    proof,
    proof.type,
  );

  const ref = await nextPaymentRef();
  await createPayment({
    ref,
    order_id: order.id,
    order_ref: order.ref,
    user_id: viewer.id,
    email: viewer.email,
    name: viewer.name,
    method,
    method_label: methodLabel || method,
    currency,
    amount,
    // Only a USD transfer can be totalled without a rate, so anything else is
    // left for the reviewer to convert rather than guessed at here.
    amount_usd: currency === 'USD' ? amount : 0,
    reference,
    proof_path: proofPath,
    proof_name: proof.name,
    status: 'submitted',
    note,
  });

  await updateOrder(order.id, { payment_status: 'awaiting_verification' });
  await purgeViewer(viewer.id);

  await notifyStaff({
    kind: 'payment',
    title: `Payment submitted for ${order.ref}`,
    body: `${viewer.name} submitted ${amount} ${currency} against order ${order.ref} (${ref}).`,
    href: `${managePath('payments')}?q=${encodeURIComponent(ref)}`,
  });

  refresh([`${routes.dashboard}/orders`, routes.dashboard, managePath('payments')]);
  backTo(`${routes.dashboard}/orders`, { paid: order.ref });
}

export async function saveProfileAction(formData: FormData) {
  const viewer = await requireViewer();

  const limit = await rateLimit('api', viewer.id);
  if (!limit.ok) {
    backTo(`${routes.dashboard}/settings`, { error: 'Too many changes at once. Try again shortly.' });
    return;
  }

  await updateProfile(viewer.id, {
    name: String(formData.get('name') ?? '').trim() || viewer.name,
    phone: String(formData.get('phone') ?? '').trim(),
    company: String(formData.get('company') ?? '').trim(),
    country: String(formData.get('country') ?? '').trim(),
    city: String(formData.get('city') ?? '').trim(),
    address: String(formData.get('address') ?? '').trim(),
    notify_orders: formData.get('notify_orders') === 'on',
    notify_invoices: formData.get('notify_invoices') === 'on',
    notify_classes: formData.get('notify_classes') === 'on',
    notify_news: formData.get('notify_news') === 'on',
  });

  await purgeViewer(viewer.id);
  refresh([`${routes.dashboard}/settings`, routes.dashboard]);
  backTo(`${routes.dashboard}/settings`, { saved: '1' });
}

export async function uploadAvatarAction(formData: FormData) {
  const viewer = await requireViewer();
  const settingsPath = `${routes.dashboard}/settings`;

  const limit = await rateLimit('upload', viewer.id);
  if (!limit.ok) {
    backTo(settingsPath, { error: 'Too many uploads. Try again shortly.' });
    return;
  }

  const file = formData.get('avatar');
  if (!(file instanceof File) || file.size === 0) {
    backTo(settingsPath, { error: 'Choose a picture first.' });
    return;
  }
  if (!AVATAR_TYPES.has(file.type)) {
    backTo(settingsPath, { error: 'Use a PNG, JPG, WebP or AVIF image.' });
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    backTo(settingsPath, { error: 'That picture is over 5 MB.' });
    return;
  }

  const profile = await getProfile(viewer.id);
  const path = await upload(BUCKETS.avatars, ownedPath(viewer.id, file.name), file, file.type);

  // Replace rather than accumulate: the old picture is no longer reachable.
  if (profile?.avatar_path) {
    await removeObject(BUCKETS.avatars, [profile.avatar_path]).catch(() => undefined);
  }

  await updateProfile(viewer.id, { avatar_path: path });
  await purgeViewer(viewer.id);

  refresh([settingsPath, routes.dashboard], false);
  backTo(settingsPath, { saved: '1' });
}

export async function removeAvatarAction() {
  const viewer = await requireViewer();
  const profile = await getProfile(viewer.id);
  if (!profile?.avatar_path) return;

  await removeObject(BUCKETS.avatars, [profile.avatar_path]).catch(() => undefined);
  await updateProfile(viewer.id, { avatar_path: null });
  await purgeViewer(viewer.id);

  refresh([`${routes.dashboard}/settings`, routes.dashboard]);
}

const DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv',
  'text/plain',
  'application/zip',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
]);

export async function uploadCustomerFileAction(formData: FormData) {
  const viewer = await requireViewer();
  const filesPath = `${routes.dashboard}/files`;

  const limit = await rateLimit('upload', viewer.id);
  if (!limit.ok) {
    backTo(filesPath, { error: 'Too many uploads. Try again shortly.' });
    return;
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    backTo(filesPath, { error: 'Choose a file first.' });
    return;
  }
  if (!DOCUMENT_TYPES.has(file.type)) {
    backTo(filesPath, { error: 'That file type is not accepted.' });
    return;
  }
  if (file.size > 50 * 1024 * 1024) {
    backTo(filesPath, { error: 'That file is over 50 MB.' });
    return;
  }

  // Staff can file something against another account; a customer always
  // uploads to their own, whatever the form says.
  const targetUserId =
    viewer.role === 'admin' ? String(formData.get('userId') || viewer.id) : viewer.id;

  const path = await upload(
    BUCKETS.documents,
    ownedPath(targetUserId, file.name),
    file,
    file.type,
  );

  await createCustomerFile({
    user_id: targetUserId,
    email: viewer.role === 'admin' ? String(formData.get('email') || '') || null : viewer.email,
    path,
    name: file.name,
    mime_type: file.type,
    size: file.size,
    category: (String(formData.get('category') || 'other') as never) ?? 'other',
    uploaded_by: viewer.role === 'admin' ? 'staff' : 'customer',
    note: String(formData.get('note') ?? '').trim(),
    visible: true,
  });

  await purgeViewer(targetUserId);
  refresh([filesPath, managePath('files')]);
  backTo(filesPath, { saved: '1' });
}

export async function deleteCustomerFileAction(formData: FormData) {
  const viewer = await requireViewer();
  const id = String(formData.get('id'));

  const record = await getCustomerFile(id).catch(() => null);
  if (!record) return;
  if (viewer.role !== 'admin' && record.user_id !== viewer.id) throw new Error('FORBIDDEN');

  await removeObject(BUCKETS.documents, [record.path]).catch(() => undefined);
  await deleteCustomerFile(id);

  await purgeViewer(record.user_id);
  refresh([`${routes.dashboard}/files`, managePath('files')]);
}

/* ── Support threads ─────────────────────────────────────────────────── */

export async function postThreadMessageAction(formData: FormData) {
  const viewer = await requireViewer();
  const messagesPath = `${routes.dashboard}/messages`;

  const limit = await rateLimit('api', viewer.id);
  if (!limit.ok) {
    backTo(messagesPath, { error: 'Slow down a moment and try again.' });
    return;
  }

  const body = String(formData.get('body') ?? '').trim();
  if (!body) return;

  const role = viewer.role === 'admin' ? 'staff' : 'customer';
  let threadId = String(formData.get('threadId') ?? '');

  if (!threadId) {
    const thread = await createThread({
      subject: String(formData.get('subject') ?? '').trim() || 'New conversation',
      user_id: viewer.id,
      email: viewer.email,
      name: viewer.name,
      status: 'open',
      order_ref: String(formData.get('orderRef') ?? '').trim() || null,
      last_message_at: new Date().toISOString(),
      last_message_from: role,
      message_count: 0,
    });
    threadId = thread.id;
  } else {
    const thread = await getThreadFor(threadId, viewer.id, viewer.role === 'admin');
    if (!thread) throw new Error('FORBIDDEN');
  }

  await appendThreadMessage(threadId, {
    role,
    author_id: viewer.id,
    author_name: viewer.name,
    body,
  });

  if (role === 'customer') {
    await notifyStaff({
      kind: 'message',
      title: `${viewer.name} sent a message`,
      body: body.slice(0, 400),
      href: `${routes.dashboard}/manage/threads`,
    });
  }

  await purgeViewer(viewer.id);
  refresh([messagesPath, `${routes.dashboard}/manage/threads`, routes.dashboard]);
  backTo(messagesPath, { thread: threadId });
}

/** Reads a thread only if the viewer is allowed to see it. */
async function getThreadFor(threadId: string, userId: string, isAdmin: boolean) {
  const thread = await getThread(threadId).catch(() => null);
  if (!thread) return null;
  return isAdmin || thread.user_id === userId ? thread : null;
}

/* ── Notifications ───────────────────────────────────────────────────── */

/** Clears the unread badge for whoever is looking. */
export async function markNotificationsReadAction() {
  const viewer = await requireViewer();
  await markNotificationsRead({ id: viewer.id, isStaff: viewer.role === 'admin' });
  refresh([`${routes.dashboard}/notifications`, routes.dashboard]);
}

/**
 * Sets a customer's password on their behalf.
 *
 * The recovery path for a locked-out account. There is no mail provider, so a
 * reset link would depend on email that may never arrive — a manager who has
 * verified who they are speaking to sets one directly instead.
 *
 * Owner/admin only, never for another staff member, and always audited.
 */
export async function setCustomerPasswordAction(formData: FormData) {
  const staff = await manager();
  const customersPath = managePath('customers');

  const userId = String(formData.get('userId') ?? '');
  const password = String(formData.get('password') ?? '');

  if (!userId) {
    backTo(customersPath, { error: 'No account was selected.' });
    return;
  }
  if (password.length < 8) {
    backTo(customersPath, { error: 'A password must be at least 8 characters.' });
    return;
  }

  const client = admin();

  // Changing another staff member's credentials is an escalation path, not
  // support. Owners change their own password from Settings like anyone else.
  const { data: target } = await client
    .from('staff')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (target) {
    backTo(customersPath, {
      error: 'That account is a team member. Staff change their own password from Settings.',
    });
    return;
  }

  const { error } = await client.auth.admin.updateUserById(userId, {
    password,
    // Whoever is asking has been verified by a person, so the address is
    // confirmed too — otherwise the account could not sign in afterwards.
    email_confirm: true,
  });

  if (error) {
    backTo(customersPath, { error: error.message });
    return;
  }

  await audit(staff, 'customer.password_set', userId);
  await notifyUser(userId, {
    kind: 'system',
    title: 'Your password was changed',
    body: `Set by ${staff.name}. If this was not you, tell us straight away.`,
    href: `${routes.dashboard}/settings`,
  });

  refresh([customersPath]);
  backTo(customersPath, { saved: userId });
}
