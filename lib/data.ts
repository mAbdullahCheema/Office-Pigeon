import 'server-only';

import { cached, KEYS, TTL } from './cache';
import { admin } from './supabase/admin';
import type {
  BookingRow,
  ChatConversationRow,
  ChatMessageRow,
  ClassRow,
  ContactMessageRow,
  CustomerFileRow,
  Draft,
  EnrollmentRow,
  InvoiceRow,
  LeadRow,
  NotificationRow,
  OrderRow,
  PaymentMethodRow,
  PaymentRow,
  ProfileRow,
  SubscriberRow,
  KeyedTable,
  ThreadMessageRow,
  ThreadRow,
} from './supabase/types';

/**
 * Every read and write the app makes against Postgres.
 *
 * These all go through the secret key, so row level security does not apply.
 * Authorisation lives in the callers (`requireStaff`, `requireViewer`, `owns`),
 * and the RLS policies are what protect the same tables when a browser talks to
 * Supabase directly — which is how Realtime and any client-side read are
 * guarded.
 */

const db = () => admin();

/** Turns a PostgREST error into a throw, so callers can use try/catch. */
function unwrap<T>(result: { data: T | null; error: { message: string } | null }, label: string): T {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  if (result.data === null) throw new Error(`${label}: no row returned`);
  return result.data;
}

/**
 * Marketing pages must render even when Supabase is unreachable or the schema
 * has not been seeded yet — an outage should cost content, not the page. Admin
 * reads deliberately do not use this: staff need to see the failure.
 */
async function safe<T>(operation: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`[data] ${label} failed:`, (error as Error).message);
    return fallback;
  }
}

async function insert<T>(table: KeyedTable, data: Record<string, unknown>): Promise<T> {
  return unwrap(
    await db().from(table).insert(data as never).select().single(),
    `insert into ${table}`,
  ) as T;
}

async function patch<T>(table: KeyedTable, id: string, data: Record<string, unknown>): Promise<T> {
  return unwrap(
    await db().from(table).update(data as never).eq('id', id).select().single(),
    `update ${table}`,
  ) as T;
}

async function one<T>(table: KeyedTable, id: string): Promise<T> {
  return unwrap(await db().from(table).select('*').eq('id', id).single(), `read ${table}`) as T;
}

type Filter = { column: string; op?: 'eq' | 'gte'; value: string | boolean };

/** How many rows match, without pulling any of them back. */
async function count(table: KeyedTable, filters: Filter[] = []): Promise<number> {
  let query = db().from(table).select('id', { count: 'exact', head: true });

  for (const filter of filters) {
    query =
      filter.op === 'gte'
        ? query.gte(filter.column, filter.value)
        : query.eq(filter.column, filter.value as never);
  }

  const { count: total, error } = await query;
  if (error) throw new Error(`count ${table}: ${error.message}`);
  return total ?? 0;
}

/**
 * Sequential human-readable reference for a table, continuing from `start`.
 *
 * The row count is the starting guess, so a deleted row would let the next
 * reference collide with an existing one. The unique index rejects that, so the
 * loop walks forward rather than letting the collision reach the customer.
 */
async function nextRef(
  table: KeyedTable,
  column: string,
  prefix: string,
  start: number,
): Promise<string> {
  let candidate = start + (await count(table));

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const { data } = await db()
      .from(table)
      .select('id')
      .eq(column, `${prefix}-${candidate}`)
      .limit(1);

    if (!data?.length) return `${prefix}-${candidate}`;
    candidate += 1;
  }

  // Pathological case only: fall back to something that cannot collide.
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

/* ── Submissions ────────────────────────────────────────────────────── */

export async function createLead(data: Draft<LeadRow>) {
  return insert<LeadRow>('leads', data);
}

export async function createBooking(data: Draft<BookingRow>) {
  return insert<BookingRow>('bookings', data);
}

export async function updateBooking(id: string, data: Draft<BookingRow>) {
  return patch<BookingRow>('bookings', id, data);
}

/**
 * One person's bookings, newest slot first.
 *
 * Matched on address rather than account: a consultation is often booked before
 * anyone signs up, and it is still theirs afterwards.
 */
export async function bookingsForEmail(email: string, limit = 20): Promise<BookingRow[]> {
  const { data, error } = await db()
    .from('bookings')
    .select('*')
    .ilike('email', email)
    .order('slot_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`bookingsForEmail: ${error.message}`);
  return data ?? [];
}

/** Slots already taken, used to grey out the booking calendar. */
export async function takenSlots(fromIso: string, toIso: string): Promise<string[]> {
  const { data, error } = await db()
    .from('bookings')
    .select('slot_at')
    .gte('slot_at', fromIso)
    .lte('slot_at', toIso)
    .neq('status', 'cancelled')
    .limit(200);

  if (error) throw new Error(`takenSlots: ${error.message}`);
  return (data ?? []).map((row) => row.slot_at);
}

export async function createContactMessage(data: Draft<ContactMessageRow>) {
  return insert<ContactMessageRow>('contact_messages', data);
}

/**
 * One row per address, whether or not they have signed up before.
 *
 * The unique index is on `lower(email)`, so the upsert has to find the existing
 * row itself rather than relying on `on conflict` against a column index.
 */
export async function upsertSubscriber(email: string, data: Draft<SubscriberRow>) {
  const { data: existing } = await db()
    .from('subscribers')
    .select('id')
    .ilike('email', email)
    .limit(1)
    .maybeSingle();

  if (existing) return patch<SubscriberRow>('subscribers', existing.id, data);
  return insert<SubscriberRow>('subscribers', { email, ...data });
}

export async function createSubscriber(data: Draft<SubscriberRow>) {
  return insert<SubscriberRow>('subscribers', data);
}

/* ── Orders ─────────────────────────────────────────────────────────── */

/** Order references continue the sequence the business already publishes. */
export async function nextOrderRef(): Promise<string> {
  return nextRef('orders', 'ref', 'OP', 4826);
}

export async function createOrder(data: Draft<OrderRow>) {
  return insert<OrderRow>('orders', data);
}

export async function listOrders(
  options: {
    status?: string;
    paymentStatus?: string;
    email?: string;
    userId?: string;
    limit?: number;
  } = {},
): Promise<OrderRow[]> {
  let query = db()
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 100);

  if (options.status) query = query.eq('status', options.status as never);
  if (options.paymentStatus) query = query.eq('payment_status', options.paymentStatus as never);
  if (options.email) query = query.ilike('email', options.email);
  if (options.userId) query = query.eq('user_id', options.userId);

  const { data, error } = await query;
  if (error) throw new Error(`listOrders: ${error.message}`);
  return data ?? [];
}

/**
 * Every order belonging to one person.
 *
 * Matched on both account and address in a single round trip: orders placed
 * from the public form before the customer ever signed in carry only an email,
 * and they must still show up once the account exists.
 */
export async function listOrdersForUser(
  userId: string,
  email: string,
  limit = 100,
): Promise<OrderRow[]> {
  const { data, error } = await db()
    .from('orders')
    .select('*')
    .or(`user_id.eq.${userId},email.eq.${email}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`listOrdersForUser: ${error.message}`);
  return data ?? [];
}

export async function getOrder(id: string) {
  return one<OrderRow>('orders', id);
}

export async function updateOrder(id: string, data: Draft<OrderRow>) {
  return patch<OrderRow>('orders', id, data);
}

/**
 * Attaches every order placed with this address to the account that just signed
 * in, so a customer who ordered as a guest sees their history immediately.
 */
export async function claimOrdersForUser(userId: string, email: string): Promise<number> {
  const { data, error } = await db()
    .from('orders')
    .update({ user_id: userId })
    .ilike('email', email)
    .is('user_id', null)
    .select('id');

  if (error) throw new Error(`claimOrdersForUser: ${error.message}`);
  return data?.length ?? 0;
}

/* ── Pip transcripts ────────────────────────────────────────────────── */

export async function getConversation(id: string) {
  return one<ChatConversationRow>('chat_conversations', id);
}

export async function createConversation(data: Draft<ChatConversationRow>) {
  return insert<ChatConversationRow>('chat_conversations', data);
}

export async function appendChatMessage(data: Draft<ChatMessageRow>) {
  return insert<ChatMessageRow>('chat_messages', data);
}

/**
 * A conversation's messages, oldest first.
 *
 * Pip's history is read from here rather than from whatever the browser sends,
 * so a visitor cannot rewrite what they were told or what Pip is supposed to
 * have agreed to earlier in the thread.
 */
export async function listChatMessages(
  conversationId: string,
  limit = 24,
): Promise<ChatMessageRow[]> {
  const { data, error } = await db()
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`read chat_messages: ${error.message}`);
  return ((data ?? []) as ChatMessageRow[]).reverse();
}

export async function touchConversation(id: string, patchData: Draft<ChatConversationRow> = {}) {
  return patch<ChatConversationRow>('chat_conversations', id, {
    last_message_at: new Date().toISOString(),
    ...patchData,
  });
}

/* ── Payment methods ────────────────────────────────────────────────── */

/**
 * The payment methods a customer can pay into. Cached: the pay screen reads
 * them on every visit and they change only when staff edit the Money section,
 * which purges this key.
 *
 * `safe` wraps the cache rather than sitting inside it. An empty list means the
 * customer is shown nowhere to send money, and inside the loader that empty
 * list would be cached as if it were the answer — two minutes of an unpayable
 * pay screen bought by one failed request.
 */
export async function listPaymentMethods(): Promise<PaymentMethodRow[]> {
  return safe(
    async () =>
      cached(KEYS.paymentMethods, TTL.settings, async () => {
        const { data, error } = await db()
          .from('payment_methods')
          .select('*')
          .eq('enabled', true)
          .order('sort_order', { ascending: true })
          .limit(50);
        if (error) throw new Error(error.message);
        return data ?? [];
      }),
    [] as PaymentMethodRow[],
    'listPaymentMethods',
  );
}

/* ── Payments ───────────────────────────────────────────────────────── */

export async function nextPaymentRef(): Promise<string> {
  return nextRef('payments', 'ref', 'PAY', 1001);
}

export async function createPayment(data: Draft<PaymentRow>) {
  return insert<PaymentRow>('payments', data);
}

export async function listPayments(
  options: { status?: string; orderId?: string; userId?: string; limit?: number } = {},
): Promise<PaymentRow[]> {
  let query = db()
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 100);

  if (options.status) query = query.eq('status', options.status as never);
  if (options.orderId) query = query.eq('order_id', options.orderId);
  if (options.userId) query = query.eq('user_id', options.userId);

  const { data, error } = await query;
  if (error) throw new Error(`listPayments: ${error.message}`);
  return data ?? [];
}

export async function getPayment(id: string) {
  return one<PaymentRow>('payments', id);
}

export async function updatePayment(id: string, data: Draft<PaymentRow>) {
  return patch<PaymentRow>('payments', id, data);
}

/* ── Invoices ───────────────────────────────────────────────────────── */

export async function nextInvoiceNumber(): Promise<string> {
  return nextRef('invoices', 'number', 'INV', 2041);
}

export async function listInvoices(
  options: { status?: string; userId?: string; orderId?: string; limit?: number } = {},
): Promise<InvoiceRow[]> {
  let query = db()
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 100);

  if (options.status) query = query.eq('status', options.status as never);
  if (options.userId) query = query.eq('user_id', options.userId);
  if (options.orderId) query = query.eq('order_id', options.orderId);

  const { data, error } = await query;
  if (error) throw new Error(`listInvoices: ${error.message}`);
  return data ?? [];
}

/* ── Profiles ───────────────────────────────────────────────────────── */

/**
 * The profile row for an account.
 *
 * The `on_auth_user_created` trigger writes it, so by the time anyone can sign
 * in the row exists — there is no create-on-first-read path to race any more.
 */
export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data } = await db().from('profiles').select('*').eq('id', userId).maybeSingle();
  return data ?? null;
}

export async function updateProfile(userId: string, data: Draft<ProfileRow>) {
  return unwrap(
    await db().from('profiles').update(data as never).eq('id', userId).select().single(),
    'update profiles',
  ) as ProfileRow;
}

/* ── Support threads ────────────────────────────────────────────────── */

export async function createThread(data: Draft<ThreadRow>) {
  return insert<ThreadRow>('threads', data);
}

export async function listThreads(
  options: { status?: string; userId?: string; limit?: number } = {},
): Promise<ThreadRow[]> {
  let query = db()
    .from('threads')
    .select('*')
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .limit(options.limit ?? 100);

  if (options.status) query = query.eq('status', options.status as never);
  if (options.userId) query = query.eq('user_id', options.userId);

  const { data, error } = await query;
  if (error) throw new Error(`listThreads: ${error.message}`);
  return data ?? [];
}

export async function getThread(id: string) {
  return one<ThreadRow>('threads', id);
}

export async function listThreadMessages(threadId: string): Promise<ThreadMessageRow[]> {
  const { data, error } = await db()
    .from('thread_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(500);

  if (error) throw new Error(`listThreadMessages: ${error.message}`);
  return data ?? [];
}

/**
 * Adds a message and moves the thread's counters with it, so a list view never
 * has to read every message to know who spoke last.
 */
export async function appendThreadMessage(
  threadId: string,
  data: Draft<ThreadMessageRow> & { role: 'customer' | 'staff' },
) {
  const message = await insert<ThreadMessageRow>('thread_messages', {
    thread_id: threadId,
    ...data,
  });

  const thread = await getThread(threadId).catch(() => null);
  await patch<ThreadRow>('threads', threadId, {
    last_message_at: new Date().toISOString(),
    last_message_from: data.role,
    message_count: (thread?.message_count ?? 0) + 1,
    unread_for_staff: data.role === 'customer',
    unread_for_customer: data.role === 'staff',
    ...(data.role === 'staff' && thread?.status === 'open' ? { status: 'pending' as const } : {}),
  });

  return message;
}

/* ── Customer files ─────────────────────────────────────────────────── */

export async function createCustomerFile(data: Draft<CustomerFileRow>) {
  return insert<CustomerFileRow>('customer_files', data);
}

export async function listCustomerFiles(
  options: { userId?: string; visibleOnly?: boolean; limit?: number } = {},
): Promise<CustomerFileRow[]> {
  let query = db()
    .from('customer_files')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 200);

  if (options.userId) query = query.eq('user_id', options.userId);
  if (options.visibleOnly) query = query.eq('visible', true);

  const { data, error } = await query;
  if (error) throw new Error(`listCustomerFiles: ${error.message}`);
  return data ?? [];
}

export async function getCustomerFile(id: string) {
  return one<CustomerFileRow>('customer_files', id);
}

export async function deleteCustomerFile(id: string) {
  const { error } = await db().from('customer_files').delete().eq('id', id);
  if (error) throw new Error(`deleteCustomerFile: ${error.message}`);
}

/* ── Academy ────────────────────────────────────────────────────────── */

export async function listClasses(
  options: { publishedOnly?: boolean; limit?: number } = {},
): Promise<ClassRow[]> {
  return safe(
    async () => {
      let query = db()
        .from('academy_classes')
        .select('*')
        .order('sort_order', { ascending: true })
        .limit(options.limit ?? 100);
      if (options.publishedOnly) query = query.eq('published', true);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    [] as ClassRow[],
    'listClasses',
  );
}

export async function listEnrollments(
  options: { userId?: string; classId?: string; limit?: number } = {},
): Promise<EnrollmentRow[]> {
  let query = db()
    .from('enrollments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options.limit ?? 200);

  if (options.userId) query = query.eq('user_id', options.userId);
  if (options.classId) query = query.eq('class_id', options.classId);

  const { data, error } = await query;
  if (error) throw new Error(`listEnrollments: ${error.message}`);
  return data ?? [];
}

/* ── Audit ──────────────────────────────────────────────────────────── */

export async function listAuditLog(limit = 200) {
  const { data, error } = await db()
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`listAuditLog: ${error.message}`);
  return data ?? [];
}

/* ── Dashboard counters ─────────────────────────────────────────────── */

export async function dashboardStats() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    newLeads,
    leads30,
    pendingBookings,
    unreadMessages,
    openConversations,
    ordersAwaitingQuote,
    paymentsToVerify,
    threadsNeedingReply,
    paidInvoices,
  ] = await Promise.all([
    count('leads', [{ column: 'status', value: 'new' }]),
    count('leads', [{ column: 'created_at', op: 'gte', value: since }]),
    count('bookings', [{ column: 'status', value: 'requested' }]),
    count('contact_messages', [{ column: 'status', value: 'unread' }]),
    count('chat_conversations', [{ column: 'status', value: 'open' }]),
    count('orders', [{ column: 'status', value: 'Awaiting confirmation' }]),
    count('payments', [{ column: 'status', value: 'submitted' }]),
    count('threads', [{ column: 'unread_for_staff', value: true }]),
    // Revenue needs the rows themselves, not just a count.
    listInvoices({ status: 'paid', limit: 500 }),
  ]);

  return {
    newLeads,
    leadsLast30Days: leads30,
    pendingBookings,
    unreadMessages,
    openConversations,
    ordersAwaitingQuote,
    paymentsToVerify,
    threadsNeedingReply,
    invoicesPaid: paidInvoices.length,
    revenuePaid: paidInvoices.reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0),
  };
}

/**
 * Everything the customer's own dashboard needs, in one round of queries.
 *
 * Six queries is a lot to repeat for each of the dashboard's screens, so the
 * result is cached for a few seconds under the viewer's own key. Every write a
 * customer can see — their orders, payments, files, profile, threads — calls
 * `purgeViewer`, so the short life is a ceiling on staleness, not the mechanism
 * that clears it.
 */
export async function customerSnapshot(userId: string, email: string) {
  return cached(KEYS.viewerSnapshot(userId), TTL.viewer, () => loadCustomerSnapshot(userId, email));
}

async function loadCustomerSnapshot(userId: string, email: string) {
  const [orders, invoices, payments, enrollments, files, threads] = await Promise.all([
    listOrdersForUser(userId, email).catch(() => [] as OrderRow[]),
    listInvoices({ userId, limit: 100 }).catch(() => [] as InvoiceRow[]),
    listPayments({ userId, limit: 100 }).catch(() => [] as PaymentRow[]),
    listEnrollments({ userId }).catch(() => [] as EnrollmentRow[]),
    listCustomerFiles({ userId, visibleOnly: true }).catch(() => [] as CustomerFileRow[]),
    listThreads({ userId }).catch(() => [] as ThreadRow[]),
  ]);

  return { orders, invoices, payments, enrollments, files, threads };
}

/* ── Notifications ──────────────────────────────────────────────────── */

/**
 * Raises an alert for the team.
 *
 * The edge functions write these for a new lead or payment; this is the same
 * row from the app side, for the events that never touch a database trigger —
 * Pip handing a conversation to a person, for one. `user_id: null` is what
 * makes a notification the team's rather than one customer's.
 */
export async function createNotification(data: Draft<NotificationRow>) {
  return insert<NotificationRow>('notifications', data);
}

/**
 * The alerts a viewer should see.
 *
 * Staff get the team's notifications — the ones with no `user_id` — and a
 * customer gets their own. Nobody sees both, so the two cases are one query
 * with a different filter rather than two code paths.
 */
export async function listNotifications(
  viewer: { id: string; isStaff: boolean },
  limit = 50,
): Promise<NotificationRow[]> {
  const query = db()
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  const { data, error } = viewer.isStaff
    ? await query.is('user_id', null)
    : await query.eq('user_id', viewer.id);

  if (error) throw new Error(`listNotifications: ${error.message}`);
  return data ?? [];
}

/** How many are unread. Read on every dashboard render, so it counts only. */
export async function unreadNotificationCount(viewer: {
  id: string;
  isStaff: boolean;
}): Promise<number> {
  return safe(
    async () => {
      const query = db()
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null);

      const { count, error } = viewer.isStaff
        ? await query.is('user_id', null)
        : await query.eq('user_id', viewer.id);

      if (error) throw new Error(error.message);
      return count ?? 0;
    },
    0,
    'unreadNotificationCount',
  );
}

/** Marks everything the viewer can see as read. */
export async function markNotificationsRead(viewer: { id: string; isStaff: boolean }) {
  const query = db()
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null);

  const { error } = viewer.isStaff
    ? await query.is('user_id', null)
    : await query.eq('user_id', viewer.id);

  if (error) throw new Error(`markNotificationsRead: ${error.message}`);
}
