import { NextResponse } from 'next/server';

import { guard, sameOrigin, withHeaders } from '@/lib/api-guard';
import { currentViewer } from '@/lib/auth';
import {
  appendChatMessage,
  createConversation,
  getConversation,
  listChatMessages,
  touchConversation,
} from '@/lib/data';
import { runPip } from '@/lib/pip/agent';
import { pipEnabled } from '@/lib/pip/config';
import { contactPoints, whatsappLink } from '@/lib/routes';
import type {
  PipCard,
  PipConfirm,
  PipRequest,
  PipResponse,
  PipTranscriptEntry,
} from '@/lib/pip/types';
import type { ChatMessageRow } from '@/lib/supabase/types';

/**
 * Pip's endpoint.
 *
 * The visitor sends one message; the assistant answers, having been allowed to
 * search the knowledge base, read the live price list, look at the calendar,
 * raise a lead, book a consultation, or hand the whole thing to a person. The
 * transcript is written here, and the history the model sees is read back from
 * it â€” never from the browser, which would let a visitor invent what Pip had
 * already agreed to.
 *
 * Sign-in is required: Pip answers questions about a person's own orders and
 * invoices, and every reply costs a model call, so the conversation belongs to
 * an account rather than to whoever loaded the page.
 */

const MAX_MESSAGE = 2000;
/** A conversation this long is a person's job, not a chatbot's. */
const MAX_MESSAGES = 200;

/** The card offered whenever Pip cannot answer at all. */
function humanCard(): PipCard {
  return {
    kind: 'handoff',
    reason: 'Pip is unavailable',
    whatsapp: whatsappLink('Hi Office Pigeon, I need some help.'),
    phone: contactPoints.phoneHref,
    email: contactPoints.emailHref,
    booking: contactPoints.demoCall,
  };
}

/** The kind a message is filed under, so the admin panel reads sensibly. */
function kindFor(cards: PipCard[], handoff: boolean): ChatMessageRow['kind'] {
  if (handoff) return 'handoff';
  if (cards.some((card) => card.kind === 'booking')) return 'booking';
  if (cards.some((card) => card.kind === 'lead')) return 'lead_form';
  if (cards.some((card) => card.kind === 'slots')) return 'quick_replies';
  return 'text';
}

/** Rejects a timezone the browser did not get from `Intl`. */
function safeZone(value: unknown): string {
  if (typeof value !== 'string' || !/^[A-Za-z_+-]+\/[A-Za-z_+\-/]+$/.test(value)) {
    return 'Asia/Karachi';
  }
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: value }).format(new Date());
    return value;
  } catch {
    return 'Asia/Karachi';
  }
}

/**
 * The visitor's tap, or nothing.
 *
 * Anything that writes to a calendar or a ledger is gated on this, so it is
 * validated rather than trusted: an unknown action, or a value long enough to
 * be a payload rather than an id, is simply not a confirmation.
 */
function readConfirm(value: unknown): PipConfirm | null {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Partial<PipConfirm>;
  const actions = new Set(['slot', 'order', 'cancel']);

  if (!candidate.action || !actions.has(candidate.action)) return null;
  if (typeof candidate.value !== 'string' || !candidate.value || candidate.value.length > 120) {
    return null;
  }

  return { action: candidate.action, value: candidate.value };
}

function history(rows: ChatMessageRow[]): PipTranscriptEntry[] {
  return rows
    .filter((row) => row.role === 'visitor' || row.role === 'assistant')
    .map((row) => ({ role: row.role as PipTranscriptEntry['role'], content: row.content }));
}

/* â”€â”€ Restore â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/** The thread so far, so opening the window on another device is not a reset. */
export async function GET(request: Request) {
  const viewer = await currentViewer();
  if (!viewer) return NextResponse.json({ error: 'Sign in to chat with Pip' }, { status: 401 });

  const limit = await guard(request, 'api', viewer.id);
  if (!limit.ok) return limit.limited();

  const id = new URL(request.url).searchParams.get('conversationId');
  if (!id) return withHeaders(NextResponse.json({ messages: [] }), limit.headers);

  const conversation = await getConversation(id).catch(() => null);
  if (!conversation || conversation.user_id !== viewer.id) {
    return withHeaders(NextResponse.json({ messages: [] }), limit.headers);
  }

  const rows = await listChatMessages(id, 40).catch(() => []);
  return withHeaders(
    NextResponse.json({
      messages: rows.map((row) => ({
        role: row.role,
        content: row.content,
        cards: Array.isArray(row.payload) ? row.payload : [],
      })),
      handoff: conversation.status === 'handoff',
    }),
    limit.headers,
  );
}

/* â”€â”€ Answer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 403 });
  }

  const viewer = await currentViewer();
  if (!viewer) {
    return NextResponse.json({ error: 'Sign in to chat with Pip' }, { status: 401 });
  }

  const burst = await guard(request, 'chat', viewer.id);
  if (!burst.ok) return burst.limited();

  const daily = await guard(request, 'chatDaily', viewer.id);
  if (!daily.ok) return daily.limited();

  if (!pipEnabled()) {
    return withHeaders(
      NextResponse.json(
        { error: 'Pip is offline right now.', fallback: humanCard() },
        { status: 503 },
      ),
      burst.headers,
    );
  }

  const body = (await request.json().catch(() => null)) as PipRequest | null;
  // Control characters are stripped rather than rejected: they arrive from a
  // paste far more often than from an attack, and they are meaningless to a
  // model that would otherwise see them as part of the question.
  const message =
    typeof body?.message === 'string'
      ? body.message
          .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ')
          .trim()
          .slice(0, MAX_MESSAGE)
      : '';
  if (!message) {
    return withHeaders(NextResponse.json({ error: 'Say something first' }, { status: 400 }), burst.headers);
  }

  /* The conversation. A stale id from another account is ignored rather than
     trusted, and a stale one from this account simply continues. */
  let conversationId =
    typeof body?.conversationId === 'string' && body.conversationId ? body.conversationId : null;
  let existing = conversationId ? await getConversation(conversationId).catch(() => null) : null;

  if (existing && existing.user_id !== viewer.id) {
    existing = null;
    conversationId = null;
  }

  if (!conversationId || !existing) {
    existing = await createConversation({
      user_id: viewer.id,
      name: viewer.name,
      email: viewer.email,
      status: 'open',
      message_count: 0,
      last_message_at: new Date().toISOString(),
    });
    conversationId = existing.id;
  }

  if (existing.message_count >= MAX_MESSAGES) {
    return withHeaders(
      NextResponse.json(
        {
          error: 'This conversation has run long enough that a person should take it from here.',
          fallback: humanCard(),
        },
        { status: 409 },
      ),
      burst.headers,
    );
  }

  const timeZone = safeZone(body?.timeZone);
  const confirmed = readConfirm(body?.confirm);

  const previous = await listChatMessages(conversationId, 24).catch(() => []);

  await appendChatMessage({
    conversation_id: conversationId,
    role: 'visitor',
    content: message,
    kind: 'text',
  });

  let turn;
  try {
    turn = await runPip({
      history: history(previous),
      message,
      viewer: { id: viewer.id, name: viewer.name, email: viewer.email, phone: viewer.phone },
      conversationId,
      timeZone,
      confirmed,
    });
  } catch (error) {
    console.error('[pip] turn failed:', (error as Error).message);
    return withHeaders(
      NextResponse.json(
        { error: 'Pip could not answer that one.', fallback: humanCard() },
        { status: 502 },
      ),
      burst.headers,
    );
  }

  await appendChatMessage({
    conversation_id: conversationId,
    role: 'assistant',
    content: turn.reply,
    kind: kindFor(turn.cards, turn.handoff),
    payload: turn.cards.length > 0 ? turn.cards : null,
  });

  await touchConversation(conversationId, {
    message_count: existing.message_count + 2,
    ...(turn.handoff ? { status: 'handoff' as const } : {}),
  }).catch(() => undefined);

  const response: PipResponse = {
    conversationId,
    reply: turn.reply,
    cards: turn.cards,
    handoff: turn.handoff,
    quickReplies: turn.quickReplies,
  };

  return withHeaders(
    NextResponse.json(response, { headers: { 'Cache-Control': 'no-store' } }),
    burst.headers,
  );
}
