/**
 * The database, as TypeScript sees it.
 *
 * Hand-written rather than generated: the generated file restates every column
 * three times, and the only real difference between the three is which columns
 * a write may omit. `Table<Row, Required>` captures that in one line, so this
 * file stays readable and a column can be added in one place.
 *
 * Regenerating is still the source of truth for a sanity check — run
 * `npm run db:types` and diff if a migration ever looks like it drifted.
 */

/** Anything Postgres will accept into a `jsonb` column. */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

/**
 * `Insert` may omit anything with a default; `Required` names the columns that
 * have none. `Update` may omit everything.
 */
type Table<Row, Required extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

/* ── Enums ──────────────────────────────────────────────────────────── */

export type StaffRole = 'owner' | 'admin' | 'editor';
export type CatalogGroup = 'Products' | 'Services' | 'Academy';
export type OrderStatusValue =
  | 'Awaiting confirmation'
  | 'Awaiting payment'
  | 'Confirmed'
  | 'In build'
  | 'Live'
  | 'Closed'
  | 'Cancelled';
export type PaymentStatusValue =
  | 'unpaid'
  | 'awaiting_verification'
  | 'paid'
  | 'partially_paid'
  | 'refunded';
export type PriorityLevel = 'low' | 'normal' | 'high';
export type LeadSource = 'website' | 'chatbot' | 'referral' | 'manual';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost' | 'spam';
export type BookingChannel = 'call' | 'whatsapp' | 'meet';
export type BookingStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type MessageStatus = 'unread' | 'read' | 'replied' | 'spam';
export type ConversationStatus = 'open' | 'handoff' | 'closed';
export type ChatRole = 'visitor' | 'assistant' | 'agent' | 'system';
export type ChatKind =
  | 'text'
  | 'quick_replies'
  | 'recommendation'
  | 'lead_form'
  | 'booking'
  | 'handoff';
export type PaymentMethodKind = 'crypto' | 'bank';
export type PaymentReviewStatus = 'submitted' | 'verified' | 'rejected' | 'refunded';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
export type ThreadStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type ThreadParty = 'customer' | 'staff';
export type FileCategory = 'brand' | 'scope' | 'invoice' | 'report' | 'handover' | 'other';
export type ClassStatus =
  | 'scheduled'
  | 'confirmed'
  | 'rescheduling'
  | 'cancelled'
  | 'completed';
export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type NotificationKind =
  | 'lead'
  | 'payment'
  | 'booking'
  | 'contact'
  | 'message'
  | 'digest'
  | 'system';

/* ── Rows ───────────────────────────────────────────────────────────── */

/** Every table carries these two, so every reader can rely on them. */
type Stamped = { id: string; created_at: string; updated_at: string };

export type StaffRow = { user_id: string; role: StaffRole; created_at: string };

export type ProfileRow = Stamped & {
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  /** Object path inside the avatars bucket. */
  avatar_path: string | null;
  notify_orders: boolean;
  notify_invoices: boolean;
  notify_classes: boolean;
  notify_news: boolean;
  timezone: string;
  referral_code: string | null;
  notes: string | null;
};

export type CatalogItemRow = Stamped & {
  item_id: string;
  group_key: CatalogGroup;
  name: string;
  icon: string | null;
  tint: string | null;
  blurb: string | null;
  body: string | null;
  tagline: string | null;
  href: string | null;
  slot: string | null;
  photo: string | null;
  audience: string | null;
  accent: string | null;
  wash: string | null;
  detail_body: string | null;
  /** Each entry is `title|body`. */
  features: string[];
  /** Each entry is `value|label`. */
  stats: string[];
  detail_slot: string | null;
  detail_photo: string | null;
  page: string | null;
  sort_order: number;
  published: boolean;
};

export type CatalogPlanRow = Stamped & {
  plan_id: string;
  item_id: string;
  name: string;
  price: number;
  unit: string | null;
  note: string | null;
  sort_order: number;
};

export type ExampleRow = Stamped & {
  title: string;
  group_key: string;
  kind: string | null;
  sector: string | null;
  body: string | null;
  /** Headline numbers, each `value|label|colour`. */
  results: string[];
  tint: string | null;
  slot: string | null;
  photo: string | null;
  sort_order: number;
  published: boolean;
};

export type ReviewRow = Stamped & {
  quote: string;
  name: string;
  role: string | null;
  initials: string | null;
  tint: string | null;
  sort_order: number;
  published: boolean;
};

export type FaqRow = Stamped & {
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  published: boolean;
};

export type SettingRow = Stamped & {
  key: string;
  value: string | null;
  group_key: string;
};

export type ClassRow = Stamped & {
  title: string;
  subject: string | null;
  tutor: string | null;
  level: string | null;
  icon: string | null;
  tint: string | null;
  time_label: string | null;
  starts_at: string | null;
  duration_mins: number;
  meeting_url: string | null;
  capacity: number;
  status: ClassStatus;
  notes: string | null;
  published: boolean;
  sort_order: number;
};

export type LeadRow = Stamped & {
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  website: string | null;
  service_slug: string | null;
  package_slug: string | null;
  budget: string | null;
  message: string | null;
  source: LeadSource;
  status: LeadStatus;
  owner_id: string | null;
  notes: string | null;
  country: string | null;
  ip: string | null;
  user_agent: string | null;
  spam_score: number;
  notified_at: string | null;
};

export type BookingRow = Stamped & {
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service_slug: string | null;
  slot_at: string;
  timezone: string;
  channel: BookingChannel;
  notes: string | null;
  status: BookingStatus;
  lead_id: string | null;
};

export type ContactMessageRow = Stamped & {
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: MessageStatus;
  spam_score: number;
  ip: string | null;
  country: string | null;
};

export type SubscriberRow = Stamped & {
  email: string;
  name: string | null;
  confirmed: boolean;
  source: string;
};

export type ChatConversationRow = Stamped & {
  /** Null for the anonymous transcripts recorded before sign-in was required. */
  user_id: string | null;
  name: string | null;
  email: string | null;
  status: ConversationStatus;
  last_message_at: string | null;
  message_count: number;
  lead_id: string | null;
  summary: string | null;
};

export type ChatMessageRow = {
  id: string;
  created_at: string;
  conversation_id: string;
  role: ChatRole;
  content: string;
  kind: ChatKind;
  payload: Json | null;
};

export type LineItem = { description: string; qty: number; unitPrice: number };

export type OrderRow = Stamped & {
  ref: string;
  status: OrderStatusValue;
  verified: boolean;
  item_id: string;
  item_name: string | null;
  plan_id: string | null;
  plan_name: string | null;
  price: number;
  unit: string | null;
  group_key: string | null;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  country: string | null;
  notes: string | null;
  user_id: string | null;
  ip: string | null;
  spam_score: number;
  currency: string;
  amount_due: number;
  payment_status: PaymentStatusValue;
  amount_paid: number;
  paid_at: string | null;
  custom: boolean;
  custom_items: Json | null;
  assigned_to: string | null;
  priority: PriorityLevel;
  due_at: string | null;
  admin_notes: string | null;
};

export type InvoiceRow = Stamped & {
  number: string;
  order_id: string | null;
  order_ref: string | null;
  user_id: string | null;
  email: string | null;
  name: string | null;
  company: string | null;
  title: string | null;
  currency: string;
  line_items: Json | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  issued_at: string | null;
  due_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_by: string | null;
};

export type PaymentMethodRow = Stamped & {
  method_id: string;
  label: string;
  kind: PaymentMethodKind;
  currency: string;
  address: string;
  network: string | null;
  account_name: string | null;
  bank_name: string | null;
  branch: string | null;
  iban: string | null;
  swift: string | null;
  instructions: string | null;
  icon: string | null;
  tint: string | null;
  enabled: boolean;
  sort_order: number;
};

export type PaymentRow = Stamped & {
  ref: string;
  order_id: string | null;
  order_ref: string | null;
  invoice_id: string | null;
  invoice_number: string | null;
  user_id: string | null;
  email: string | null;
  name: string | null;
  method: string;
  method_label: string | null;
  currency: string;
  amount: number;
  amount_usd: number;
  reference: string | null;
  /** Object path inside the private proofs bucket. */
  proof_path: string | null;
  proof_name: string | null;
  status: PaymentReviewStatus;
  note: string | null;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  ip: string | null;
};

export type ThreadRow = Stamped & {
  subject: string;
  user_id: string;
  email: string | null;
  name: string | null;
  status: ThreadStatus;
  order_ref: string | null;
  last_message_at: string | null;
  last_message_from: ThreadParty;
  message_count: number;
  unread_for_staff: boolean;
  unread_for_customer: boolean;
};

export type ThreadMessageRow = {
  id: string;
  created_at: string;
  thread_id: string;
  author_id: string | null;
  author_name: string | null;
  role: ThreadParty;
  body: string;
  attachment_path: string | null;
  attachment_name: string | null;
};

export type CustomerFileRow = Stamped & {
  user_id: string;
  email: string | null;
  /** Object path inside the private documents bucket. */
  path: string;
  name: string;
  mime_type: string | null;
  size: number;
  category: FileCategory;
  uploaded_by: ThreadParty;
  order_ref: string | null;
  note: string | null;
  visible: boolean;
};

export type EnrollmentRow = Stamped & {
  class_id: string;
  class_title: string | null;
  user_id: string;
  email: string | null;
  student_name: string | null;
  status: EnrollmentStatus;
  attendance: number;
  mock_average: number;
  homework: number;
  order_ref: string | null;
  notes: string | null;
};

export type NotificationRow = {
  id: string;
  created_at: string;
  kind: NotificationKind;
  title: string;
  body: string | null;
  /** Where clicking it should go, relative to the site root. */
  href: string | null;
  /** Null means the whole team; otherwise the one customer it belongs to. */
  user_id: string | null;
  read_at: string | null;
};

export type AuditLogRow = {
  id: string;
  created_at: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  target: string | null;
  detail: string | null;
};

/* ── The schema supabase-js is generic over ─────────────────────────── */

export type Database = {
  public: {
    Tables: {
      staff: Table<StaffRow, 'user_id'>;
      profiles: Table<ProfileRow, 'id'>;
      catalog_items: Table<CatalogItemRow, 'item_id' | 'group_key' | 'name'>;
      catalog_plans: Table<CatalogPlanRow, 'plan_id' | 'item_id' | 'name'>;
      examples: Table<ExampleRow, 'title' | 'group_key'>;
      reviews: Table<ReviewRow, 'quote' | 'name'>;
      faqs: Table<FaqRow, 'question' | 'answer'>;
      settings: Table<SettingRow, 'key'>;
      academy_classes: Table<ClassRow, 'title'>;
      leads: Table<LeadRow, 'name'>;
      bookings: Table<BookingRow, 'name' | 'email' | 'slot_at'>;
      contact_messages: Table<ContactMessageRow, 'name' | 'email' | 'message'>;
      subscribers: Table<SubscriberRow, 'email'>;
      chat_conversations: Table<ChatConversationRow>;
      chat_messages: Table<ChatMessageRow, 'conversation_id' | 'role' | 'content'>;
      orders: Table<OrderRow, 'ref' | 'item_id' | 'name' | 'email'>;
      invoices: Table<InvoiceRow, 'number'>;
      payment_methods: Table<
        PaymentMethodRow,
        'method_id' | 'label' | 'kind' | 'currency' | 'address'
      >;
      payments: Table<PaymentRow, 'ref' | 'method'>;
      threads: Table<ThreadRow, 'subject' | 'user_id'>;
      thread_messages: Table<ThreadMessageRow, 'thread_id' | 'role' | 'body'>;
      customer_files: Table<CustomerFileRow, 'user_id' | 'path' | 'name'>;
      enrollments: Table<EnrollmentRow, 'class_id' | 'user_id'>;
      audit_log: Table<AuditLogRow, 'action'>;
      notifications: Table<NotificationRow, 'title'>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      staff_role: StaffRole;
      catalog_group: CatalogGroup;
      order_status: OrderStatusValue;
      payment_status: PaymentStatusValue;
      priority_level: PriorityLevel;
      lead_source: LeadSource;
      lead_status: LeadStatus;
      booking_channel: BookingChannel;
      booking_status: BookingStatus;
      message_status: MessageStatus;
      conversation_status: ConversationStatus;
      chat_role: ChatRole;
      chat_kind: ChatKind;
      payment_method_kind: PaymentMethodKind;
      payment_review_status: PaymentReviewStatus;
      invoice_status: InvoiceStatus;
      thread_status: ThreadStatus;
      thread_party: ThreadParty;
      file_category: FileCategory;
      class_status: ClassStatus;
      enrollment_status: EnrollmentStatus;
      notification_kind: NotificationKind;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type TableName = keyof Database['public']['Tables'];

/**
 * Every table keyed by a uuid `id`.
 *
 * `staff` is keyed by `user_id` instead, and the generic CRUD helpers address
 * rows by `id`, so excluding it here is what lets those helpers stay typed
 * across a union of tables rather than falling back to `any`.
 */
export type KeyedTable = Exclude<TableName, 'staff'>;

/** `Draft<OrderRow>` is what a write accepts: the row's own columns, all optional. */
export type Draft<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;

/** Parses a jsonb column that holds `[{ description, qty, unitPrice }]`. */
export function lineItems(value: Json | null | undefined): LineItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return [];
    const item = entry as Record<string, Json>;
    return [
      {
        description: String(item.description ?? ''),
        qty: Number(item.qty) || 0,
        unitPrice: Number(item.unitPrice) || 0,
      },
    ];
  });
}
