'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';

import { Fx } from '@/components/ui/Fx';
import type { PipCard, PipConfirm, PipResponse } from '@/lib/pip/types';
import { contactPoints, routes } from '@/lib/routes';

/**
 * Pip — the chat window in the corner of every marketing page.
 *
 * The window is a thin client: it sends what the visitor typed and renders what
 * comes back. Everything Pip knows, decides and does happens on the server, so
 * nothing here can be talked into quoting a price or booking a slot.
 *
 * The one piece of real logic on this side is the booking confirmation. A slot
 * is only ever booked when the visitor taps it, and the tap is what sends
 * `confirmSlot` — the server refuses to book without it.
 */

type Message = {
  role: 'visitor' | 'assistant';
  text: string;
  cards?: PipCard[];
};

const STORE_KEY = 'op-pip-v2';
const GREETING =
  "Hi — I'm Pip. I can help you work out whether a website, a chatbot, a calling agent or an automation is what your business actually needs, and I can look up anything on your account.\n\nWhat brings you in today?";

const OPENERS = ['What would this cost?', 'Book a free consultation', 'How does the chatbot work?'];

/** The conversation id survives a page change; the thread is re-read from it. */
function readConversationId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORE_KEY);
  } catch {
    return null;
  }
}

/**
 * What a signed-out visitor sees instead of the conversation.
 *
 * Pip answers questions about a person's own orders, classes and invoices, so
 * it is an account feature rather than a public one. The panel keeps the
 * unauthenticated routes to it — sign in, or the human channels — one tap away.
 */
function SignInGate() {
  return (
    <Fx s="background:linear-gradient(165deg,#FFFFFF,#FFF6F1);border-radius:24px;padding:20px 18px;box-shadow:0 16px 32px rgba(196,120,74,.18), inset 0 2px 3px rgba(255,255,255,.9);animation:pipIn .42s cubic-bezier(.34,1.4,.64,1) both">
      <Fx s="display:flex;align-items:center;gap:10px">
        <Fx
          as="span"
          s="width:34px;height:34px;flex:none;border-radius:50%;background:#FFEDE3;display:flex;align-items:center;justify-content:center;font-size:16px"
        >
          🔐
        </Fx>
        <Fx
          as="span"
          s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:15.5px;line-height:1.3"
        >
          Sign in to chat with Pip
        </Fx>
      </Fx>

      <Fx as="p" s="font-size:13px;line-height:1.6;color:rgba(36,26,22,.62);margin:11px 0 0;text-wrap:pretty">
        Pip answers about your own orders, invoices and classes, so it needs to know who you are. One tap with Google is
        enough.
      </Fx>

      <Fx
        as={Link}
        href={`${routes.login}?next=${encodeURIComponent(routes.dashboard)}`}
        s="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:15px;text-decoration:none;color:#fff;font-weight:700;font-size:14px;padding:13px 18px;border-radius:999px;background:linear-gradient(180deg,#FF8149,#EF5A1F);box-shadow:0 14px 26px rgba(226,78,23,.32)"
      >
        Sign in or create an account
      </Fx>

      <Fx s="display:flex;align-items:center;gap:7px;margin-top:10px;flex-wrap:wrap">
        <Fx
          as="a"
          href={contactPoints.whatsapp}
          s="flex:1;text-align:center;text-decoration:none;font-size:12px;font-weight:700;color:rgba(36,26,22,.6);background:#E9FBF3;border-radius:999px;padding:10px 12px"
        >
          WhatsApp us
        </Fx>
        <Fx
          as="a"
          href={contactPoints.emailHref}
          s="flex:1;text-align:center;text-decoration:none;font-size:12px;font-weight:700;color:rgba(36,26,22,.6);background:#FFF3EC;border-radius:999px;padding:10px 12px"
        >
          Email us
        </Fx>
      </Fx>
    </Fx>
  );
}

const CARD = 'background:linear-gradient(165deg,#FFFFFF,#FFF6F1);border-radius:24px;padding:16px;box-shadow:0 16px 32px rgba(196,120,74,.18), inset 0 2px 3px rgba(255,255,255,.9);animation:pipIn .42s cubic-bezier(.34,1.4,.64,1) both';
const CARD_TITLE = 'font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:15px;color:#241A16';
const PILL = 'text-decoration:none;text-align:center;font-size:12.5px;font-weight:700;border-radius:999px;padding:10px 13px;flex:1;min-width:104px';

/** Everything Pip can put below a reply. */
function Card({
  card,
  onConfirm,
}: {
  card: PipCard;
  onConfirm: (confirm: PipConfirm, say: string) => void;
}) {
  if (card.kind === 'slots') {
    return (
      <Fx s={CARD}>
        <Fx s={CARD_TITLE}>Free 30-minute consultation</Fx>
        <Fx s="font-size:12px;color:rgba(36,26,22,.55);margin-top:3px">
          Tap a time and I will book it. Times are in your own timezone.
        </Fx>
        <Fx s="display:flex;flex-wrap:wrap;gap:7px;margin-top:13px">
          {card.slots.map((slot) => (
            <Fx
              key={slot.start}
              as="button"
              type="button"
              onClick={() =>
                onConfirm({ action: 'slot', value: slot.start }, `Book me the ${slot.label} slot.`)
              }
              s="border:0;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:700;border-radius:999px;padding:9px 13px;background:#FFF3EC;color:#241A16;transition:transform .25s cubic-bezier(.34,1.56,.64,1)"
              hover="transform:translateY(-2px);background:#FFEDE3"
            >
              {slot.label}
            </Fx>
          ))}
        </Fx>
      </Fx>
    );
  }

  if (card.kind === 'booking') {
    return (
      <Fx s={CARD}>
        <Fx s="display:flex;align-items:center;gap:10px">
          <Fx
            as="span"
            s="width:34px;height:34px;flex:none;border-radius:50%;background:#E9FBF3;color:#0F9C6E;display:flex;align-items:center;justify-content:center;font-size:16px;animation:pipPop .5s cubic-bezier(.34,1.5,.64,1) both"
          >
            ✓
          </Fx>
          <Fx as="span" s="line-height:1.3">
            <Fx as="span" s={`display:block;${CARD_TITLE}`}>
              Consultation booked
            </Fx>
            <Fx as="span" s="display:block;font-size:11.5px;color:rgba(36,26,22,.55)">
              {card.when}
            </Fx>
          </Fx>
        </Fx>
        <Fx s="display:flex;gap:7px;margin-top:13px;flex-wrap:wrap">
          {card.meetingUrl ? (
            <Fx as="a" href={card.meetingUrl} target="_blank" rel="noreferrer" s={`${PILL};background:#E9FBF3;color:#0B7A56`}>
              Join link
            </Fx>
          ) : null}
          <Fx as="a" href={card.manageUrl} target="_blank" rel="noreferrer" s={`${PILL};background:#FFF3EC;color:rgba(36,26,22,.66)`}>
            Change or cancel
          </Fx>
        </Fx>
      </Fx>
    );
  }

  if (card.kind === 'lead') {
    return (
      <Fx s={CARD}>
        <Fx s="display:flex;align-items:center;gap:10px">
          <Fx
            as="span"
            s="width:34px;height:34px;flex:none;border-radius:50%;background:#E9FBF3;color:#0F9C6E;display:flex;align-items:center;justify-content:center;font-size:16px;animation:pipPop .5s cubic-bezier(.34,1.5,.64,1) both"
          >
            ✓
          </Fx>
          <Fx as="span" s="line-height:1.3">
            <Fx as="span" s={`display:block;${CARD_TITLE}`}>
              With the team
            </Fx>
            <Fx as="span" s="display:block;font-size:11.5px;color:rgba(36,26,22,.55)">
              Reference {card.ref}
            </Fx>
          </Fx>
        </Fx>
        <Fx s="margin-top:12px;font-size:12.5px;line-height:1.55;color:rgba(36,26,22,.6);background:#fff;border-radius:14px;padding:11px 13px;text-wrap:pretty">
          {card.summary}
        </Fx>
      </Fx>
    );
  }

  if (card.kind === 'handoff') {
    return (
      <Fx s={CARD}>
        <Fx s={CARD_TITLE}>Over to a person</Fx>
        <Fx s="font-size:12.5px;color:rgba(36,26,22,.58);margin-top:4px;text-wrap:pretty">{card.reason}</Fx>
        <Fx s="display:flex;flex-wrap:wrap;gap:7px;margin-top:13px">
          <Fx as="a" href={card.whatsapp} target="_blank" rel="noreferrer" s={`${PILL};background:#E9FBF3;color:#0B7A56`}>
            WhatsApp now
          </Fx>
          <Fx as="a" href={card.phone} s={`${PILL};background:#FFF3EC;color:rgba(36,26,22,.7)`}>
            Call
          </Fx>
          <Fx as="a" href={card.email} s={`${PILL};background:#FFF3EC;color:rgba(36,26,22,.7)`}>
            Email
          </Fx>
          <Fx as="a" href={card.booking} target="_blank" rel="noreferrer" s={`${PILL};background:#FFF3EC;color:rgba(36,26,22,.7)`}>
            Book a call
          </Fx>
        </Fx>
      </Fx>
    );
  }

  if (card.kind === 'confirm') {
    return (
      <Fx s={CARD}>
        <Fx s={CARD_TITLE}>{card.title}</Fx>
        <Fx s="display:flex;flex-direction:column;gap:7px;margin-top:12px">
          {card.rows.map((row) => (
            <Fx key={row.k} s="display:flex;gap:10px;font-size:12.5px">
              <Fx as="span" s="color:rgba(36,26,22,.48);flex:none;width:64px">
                {row.k}
              </Fx>
              <Fx as="span" s="color:#241A16;font-weight:600;min-width:0;text-wrap:pretty">
                {row.v}
              </Fx>
            </Fx>
          ))}
        </Fx>
        <Fx s="margin-top:12px;font-size:12px;line-height:1.55;color:rgba(36,26,22,.6);background:#fff;border-radius:14px;padding:10px 12px;text-wrap:pretty">
          {card.note}
        </Fx>
        <Fx
          as="button"
          type="button"
          onClick={() =>
            onConfirm({ action: card.action, value: card.value }, `${card.cta}: ${card.title}`)
          }
          s="width:100%;margin-top:12px;border:0;cursor:pointer;font-family:inherit;font-weight:800;font-size:13.5px;color:#fff;background:linear-gradient(160deg,#FF8149,#EF5A1F);border-radius:999px;padding:12px 16px;box-shadow:0 12px 24px rgba(226,78,23,.3)"
        >
          {card.cta}
        </Fx>
      </Fx>
    );
  }

  if (card.kind === 'done') {
    return (
      <Fx s={CARD}>
        <Fx s="display:flex;align-items:center;gap:10px">
          <Fx
            as="span"
            s="width:34px;height:34px;flex:none;border-radius:50%;background:#E9FBF3;color:#0F9C6E;display:flex;align-items:center;justify-content:center;font-size:16px;animation:pipPop .5s cubic-bezier(.34,1.5,.64,1) both"
          >
            ✓
          </Fx>
          <Fx as="span" s={CARD_TITLE}>
            {card.title}
          </Fx>
        </Fx>
        <Fx s="margin-top:11px;font-size:12.5px;line-height:1.55;color:rgba(36,26,22,.62);text-wrap:pretty">
          {card.detail}
        </Fx>
        {card.href ? (
          <Fx
            as={Link}
            href={card.href}
            s="display:block;text-align:center;margin-top:12px;text-decoration:none;font-size:12.5px;font-weight:700;color:rgba(36,26,22,.7);background:#FFF3EC;border-radius:999px;padding:10px 13px"
          >
            {card.hrefLabel ?? 'Open it'}
          </Fx>
        ) : null}
      </Fx>
    );
  }

  return (
    <Fx s={CARD}>
      <Fx s="display:flex;flex-direction:column;gap:7px">
        {card.items.map((item) => (
          <Fx
            key={item.href}
            as={Link}
            href={item.href}
            s="display:flex;align-items:center;gap:10px;text-decoration:none;color:#241A16;font-size:13px;font-weight:600"
          >
            {item.label}
            <Fx as="span" s="margin-left:auto;color:#E8480F">
              →
            </Fx>
          </Fx>
        ))}
      </Fx>
    </Fx>
  );
}

export function PipWidget({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>(OPENERS);
  const [handoff, setHandoff] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [unread, setUnread] = useState(false);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const conversationRef = useRef<string | null>(null);
  const restoredRef = useRef(false);

  // A new visitor gets one quiet nudge; a returning one is picked up where the
  // conversation left off.
  useEffect(() => {
    conversationRef.current = readConversationId();
    const timer = setTimeout(() => {
      setTeaser(true);
      setUnread(true);
    }, 5200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const element = bodyRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [thread, thinking]);

  /**
   * One turn.
   *
   * The visitor's line goes on screen immediately — the answer takes a second
   * or two, and a window that does nothing in the meantime reads as broken.
   */
  const send = useCallback(
    async (text: string, confirm?: PipConfirm) => {
      const message = text.trim();
      if (!message || thinking) return;

      setThread((current) => [...current, { role: 'visitor', text: message }]);
      setDraft('');
      setQuickReplies([]);
      setThinking(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            conversationId: conversationRef.current,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            confirm: confirm ?? null,
          }),
        });

        if (!response.ok) {
          const failure = (await response.json().catch(() => null)) as
            | { error?: string; fallback?: PipCard }
            | null;
          setThread((current) => [
            ...current,
            {
              role: 'assistant',
              text: failure?.error ?? 'Something went wrong at my end. A person can pick this up.',
              cards: failure?.fallback ? [failure.fallback] : undefined,
            },
          ]);
          return;
        }

        const data = (await response.json()) as PipResponse;
        conversationRef.current = data.conversationId;
        try {
          localStorage.setItem(STORE_KEY, data.conversationId);
        } catch {
          /* storage refused — the conversation lives for this page only */
        }

        setThread((current) => [
          ...current,
          { role: 'assistant', text: data.reply, cards: data.cards.length > 0 ? data.cards : undefined },
        ]);
        setQuickReplies(data.quickReplies);
        if (data.handoff) setHandoff(true);
      } catch {
        setThread((current) => [
          ...current,
          {
            role: 'assistant',
            text: 'I lost the connection there. Try again, or reach a person directly.',
            cards: [
              {
                kind: 'handoff',
                reason: 'Pip could not be reached',
                whatsapp: contactPoints.whatsapp,
                phone: contactPoints.phoneHref,
                email: contactPoints.emailHref,
                booking: contactPoints.demoCall,
              },
            ],
          },
        ]);
      } finally {
        setThinking(false);
      }
    },
    [thinking],
  );

  /**
   * A tap on a card is the confirmation the server insists on.
   *
   * The visitor's line goes into the thread as normal so the transcript reads
   * like a conversation, but it is the `confirm` alongside it — not the words —
   * that lets the booking, order or cancellation through.
   */
  const confirmAction = useCallback(
    (confirm: PipConfirm, say: string) => {
      void send(say, confirm);
    },
    [send],
  );

  /** Reads the thread back from the server, so another device is not a reset. */
  const restore = useCallback(async () => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const id = conversationRef.current;
    if (!id) {
      setThread([{ role: 'assistant', text: GREETING }]);
      return;
    }

    try {
      const response = await fetch(`/api/chat?conversationId=${encodeURIComponent(id)}`);
      const data = (await response.json()) as {
        messages?: { role: Message['role']; content: string; cards?: PipCard[] }[];
        handoff?: boolean;
      };

      const messages = (data.messages ?? []).map((row) => ({
        role: row.role,
        text: row.content,
        cards: Array.isArray(row.cards) && row.cards.length > 0 ? row.cards : undefined,
      }));

      setThread(messages.length > 0 ? messages : [{ role: 'assistant', text: GREETING }]);
      if (data.handoff) setHandoff(true);
    } catch {
      setThread([{ role: 'assistant', text: GREETING }]);
    }
  }, []);

  const openChat = useCallback(() => {
    setOpen(true);
    setTeaser(false);
    setUnread(false);
    if (signedIn) void restore();
  }, [restore, signedIn]);

  const restart = useCallback(() => {
    try {
      localStorage.removeItem(STORE_KEY);
    } catch {
      /* nothing to clear */
    }
    conversationRef.current = null;
    setThread([{ role: 'assistant', text: GREETING }]);
    setQuickReplies(OPENERS);
    setHandoff(false);
  }, []);

  return (
    <Fx s="pointer-events:auto;font-family:var(--font-jakarta),system-ui,sans-serif;display:flex;flex-direction:column;align-items:flex-end;gap:12px">
      {teaser && !open ? (
        <Fx s="display:flex;align-items:center;gap:4px;background:#fff;border-radius:999px;padding:6px 6px 6px 15px;box-shadow:0 14px 30px rgba(196,120,74,.2), inset 0 2px 3px rgba(255,255,255,.9);animation:pipIn .45s cubic-bezier(.34,1.4,.64,1) both;max-width:calc(100vw - 44px)">
          <Fx
            as="button"
            type="button"
            onClick={openChat}
            s="border:0;background:none;cursor:pointer;font-family:inherit;font-weight:700;font-size:13px;color:#241A16;padding:6px 4px;white-space:nowrap"
          >
            Need a hand? Ask Pip.
          </Fx>
          <Fx
            as="button"
            type="button"
            onClick={() => setTeaser(false)}
            aria-label="Dismiss"
            s="width:26px;height:26px;flex:none;border:0;cursor:pointer;border-radius:50%;background:#FFF3EC;color:rgba(36,26,22,.45);font-family:inherit;font-size:11px;line-height:1;display:flex;align-items:center;justify-content:center"
            hover="background:#FFEDE3;color:#241A16"
          >
            ✕
          </Fx>
        </Fx>
      ) : null}

      {open ? (
        <Fx
          role="dialog"
          aria-label="Chat with Pip"
          s="width:min(390px, calc(100vw - 44px));height:min(640px, calc(100dvh - 118px));display:flex;flex-direction:column;background:#FFFBF8;border-radius:34px;overflow:hidden;box-shadow:0 34px 72px rgba(196,120,74,.32), inset 0 2px 3px rgba(255,255,255,.9);animation:pipUp .42s cubic-bezier(.34,1.4,.64,1) both"
        >
          <Fx s="background:linear-gradient(160deg,#2A1A12,#3D2317 60%,#241A16);color:#FFEFE5;padding:16px 18px;display:flex;align-items:center;gap:11px;flex:none">
            <Fx
              as="span"
              s="width:40px;height:40px;flex:none;position:relative;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,239,229,.14);box-shadow:inset 0 0 0 1px rgba(255,239,229,.2)"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/pigeon-clay.svg" alt="" style={{ width: 28, height: 28, display: 'block' }} />
              <Fx
                as="span"
                s="position:absolute;right:-1px;bottom:-1px;width:11px;height:11px;border-radius:50%;background:#21C08B;box-shadow:0 0 0 2.5px #2E1C14;animation:pipGlow 1.8s ease-in-out infinite"
              />
            </Fx>
            <Fx as="span" s="line-height:1.3;min-width:0">
              <Fx
                as="span"
                s="display:block;font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:17px"
              >
                Pip
              </Fx>
              <Fx
                as="span"
                s="display:block;font-size:11.5px;color:rgba(255,239,229,.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
              >
                {handoff ? 'A person is picking this up' : 'Usually replies in seconds'}
              </Fx>
            </Fx>
            <Fx as="span" s="margin-left:auto;display:flex;gap:7px;flex:none">
              <Fx
                as="button"
                type="button"
                onClick={restart}
                aria-label="Start over"
                title="Start over"
                s="border:0;background:rgba(255,239,229,.16);color:#FFEFE5;width:30px;height:30px;border-radius:11px;cursor:pointer;font-family:inherit;font-size:13px"
              >
                ⟲
              </Fx>
              <Fx
                as="button"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                s="border:0;background:rgba(255,239,229,.16);color:#FFEFE5;width:30px;height:30px;border-radius:11px;cursor:pointer;font-family:inherit;font-size:12px"
              >
                ✕
              </Fx>
            </Fx>
          </Fx>

          <Fx
            ref={bodyRef}
            s="flex:1;min-height:0;overflow-y:auto;padding:18px 18px 8px;display:flex;flex-direction:column;gap:10px"
          >
            {!signedIn ? <SignInGate /> : null}

            {signedIn
              ? thread.map((message, index) => (
                  <Fx
                    key={`${index}-${message.text.slice(0, 12)}`}
                    s={`display:flex;flex-direction:column;gap:9px;align-items:${
                      message.role === 'visitor' ? 'flex-end' : 'flex-start'
                    };animation:pipIn .38s cubic-bezier(.34,1.4,.64,1) both`}
                  >
                    <Fx
                      s={`max-width:86%;font-size:13.5px;line-height:1.6;padding:12px 15px;border-radius:${
                        message.role === 'visitor' ? '20px 20px 8px 20px' : '20px 20px 20px 8px'
                      };background:${
                        message.role === 'visitor' ? 'linear-gradient(160deg,#FF8149,#EF5A1F)' : '#FFF0E7'
                      };color:${message.role === 'visitor' ? '#fff' : '#241A16'};box-shadow:${
                        message.role === 'visitor'
                          ? '0 12px 24px rgba(226,78,23,.26), inset 0 2px 3px rgba(255,255,255,.32)'
                          : 'none'
                      };text-wrap:pretty;white-space:pre-line`}
                    >
                      {message.text}
                    </Fx>

                    {(message.cards ?? []).map((card, position) => (
                      <Fx key={`${card.kind}-${position}`} s="width:100%">
                        <Card card={card} onConfirm={confirmAction} />
                      </Fx>
                    ))}
                  </Fx>
                ))
              : null}

            {thinking ? (
              <Fx s="align-self:flex-start;display:flex;align-items:center;gap:5px;background:#FFF0E7;border-radius:20px 20px 20px 8px;padding:13px 16px">
                <Fx as="span" s="width:6px;height:6px;border-radius:50%;background:#E8480F;animation:pipDot 1.1s ease-in-out infinite" />
                <Fx as="span" s="width:6px;height:6px;border-radius:50%;background:#E8480F;animation:pipDot 1.1s ease-in-out .15s infinite" />
                <Fx as="span" s="width:6px;height:6px;border-radius:50%;background:#E8480F;animation:pipDot 1.1s ease-in-out .3s infinite" />
              </Fx>
            ) : null}

            {signedIn && !thinking && quickReplies.length > 0 ? (
              <Fx s="display:flex;flex-wrap:wrap;gap:7px;margin-top:2px;animation:pipIn .4s cubic-bezier(.34,1.4,.64,1) both">
                {quickReplies.map((reply) => (
                  <Fx
                    key={reply}
                    as="button"
                    type="button"
                    onClick={() => void send(reply)}
                    s="border:0;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:700;color:#241A16;background:#fff;border-radius:999px;padding:10px 14px;box-shadow:0 8px 18px rgba(196,120,74,.14), inset 0 2px 3px rgba(255,255,255,.9);transition:transform .26s cubic-bezier(.34,1.56,.64,1)"
                    hover="transform:translateY(-2px)"
                  >
                    {reply}
                  </Fx>
                ))}
              </Fx>
            ) : null}
          </Fx>

          <Fx
            s={`flex:none;padding:10px 14px 12px;background:#fff;box-shadow:0 -10px 24px rgba(196,120,74,.08);${
              signedIn ? '' : 'display:none'
            }`}
          >
            <Fx s="display:flex;align-items:flex-end;gap:8px">
              <Fx
                as="input"
                value={draft}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)}
                onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void send(draft);
                  }
                }}
                placeholder={thinking ? 'Pip is thinking…' : 'Ask me anything'}
                aria-label="Message Pip"
                s="flex:1;min-width:0;font-family:inherit;font-size:16px;color:#241A16;background:#FFF9F5;border:1px solid #F3E0D4;border-radius:999px;padding:12px 16px;outline:none"
              />
              <Fx
                as="button"
                type="button"
                onClick={() => void send(draft)}
                disabled={thinking}
                aria-label="Send"
                s={`width:42px;height:42px;flex:none;border:0;cursor:${
                  thinking ? 'progress' : 'pointer'
                };border-radius:50%;background:linear-gradient(160deg,#FF8149,#EF5A1F);color:#fff;font-size:15px;box-shadow:0 12px 22px rgba(226,78,23,.3);opacity:${
                  thinking ? '.6' : '1'
                };transition:transform .25s cubic-bezier(.34,1.56,.64,1)`}
                hover="transform:translateY(-2px)"
              >
                ↑
              </Fx>
            </Fx>
            <Fx s="display:flex;align-items:center;gap:6px;margin-top:9px;flex-wrap:wrap">
              <Fx
                as="a"
                href={contactPoints.whatsapp}
                target="_blank"
                rel="noreferrer"
                s="text-decoration:none;font-size:11.5px;font-weight:700;color:rgba(36,26,22,.55);background:#FFF3EC;border-radius:999px;padding:7px 12px"
              >
                WhatsApp
              </Fx>
              <Fx
                as="a"
                href={contactPoints.phoneHref}
                s="text-decoration:none;font-size:11.5px;font-weight:700;color:rgba(36,26,22,.55);background:#FFF3EC;border-radius:999px;padding:7px 12px"
              >
                Call
              </Fx>
              <Fx
                as="a"
                href={contactPoints.emailHref}
                s="text-decoration:none;font-size:11.5px;font-weight:700;color:rgba(36,26,22,.55);background:#FFF3EC;border-radius:999px;padding:7px 12px"
              >
                Email
              </Fx>
              <Fx as="span" s="margin-left:auto;font-size:10.5px;color:rgba(36,26,22,.35)">
                Human backup, always
              </Fx>
            </Fx>
          </Fx>
        </Fx>
      ) : null}

      <Fx
        as="button"
        type="button"
        onClick={() => (open ? setOpen(false) : openChat())}
        aria-label="Chat with Pip"
        aria-expanded={open}
        s={`position:relative;width:64px;height:64px;padding:0;border:0;border-radius:50%;background:${
          open ? 'linear-gradient(160deg,#2A1A12,#3D2317 60%,#241A16)' : 'linear-gradient(160deg,#FF8149,#EF5A1F)'
        };cursor:pointer;box-shadow:0 18px 34px rgba(36,26,22,.24);transition:transform .35s cubic-bezier(.34,1.56,.64,1), background .3s;animation:pipBob 3.4s ease-in-out infinite;display:flex;align-items:center;justify-content:center`}
        hover="transform:translateY(-5px) scale(1.05)"
        active="transform:scale(.94)"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          style={{ width: 30, height: 30, display: open ? 'none' : 'block' }}
          aria-hidden="true"
        >
          <path
            d="M4 5.8C4 4.8 4.8 4 5.8 4h12.4c1 0 1.8.8 1.8 1.8v8.4c0 1-.8 1.8-1.8 1.8H10l-4.4 3.4c-.7.5-1.6 0-1.6-.9V5.8Z"
            fill="#fff"
          />
          <circle cx="9" cy="10" r="1.35" fill="#EF5A1F" />
          <circle cx="12.6" cy="10" r="1.35" fill="#EF5A1F" />
          <circle cx="16.2" cy="10" r="1.35" fill="#EF5A1F" />
        </svg>
        <Fx as="span" s={`color:#FFEFE5;font-size:22px;font-weight:700;display:${open ? 'block' : 'none'}`}>
          ✕
        </Fx>
        {unread && !open ? (
          <Fx
            as="span"
            s="position:absolute;top:-2px;right:-2px;min-width:22px;height:22px;border-radius:999px;background:#fff;color:#E8480F;font-size:11.5px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 14px rgba(36,26,22,.24);animation:pipPop .4s cubic-bezier(.34,1.5,.64,1) both"
          >
            1
          </Fx>
        ) : null}
      </Fx>
    </Fx>
  );
}
