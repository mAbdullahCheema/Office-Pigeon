import type { ChatMessageRow } from '../supabase/types';

/**
 * The contract between the Pip widget and `/api/chat`.
 *
 * Shared by both sides, so it carries no server-only imports.
 */

export type PipRole = 'visitor' | 'assistant';

export type PipTranscriptEntry = {
  role: PipRole;
  content: string;
  kind?: ChatMessageRow['kind'];
};

/**
 * A tap the visitor made on a card.
 *
 * Anything that writes to a calendar, a ledger or somebody's inbox is gated on
 * one of these. The model can ask for the action; only the visitor can arm it.
 */
export type PipConfirm = {
  action: 'slot' | 'order' | 'cancel';
  value: string;
};

/** Everything the widget can render below a reply. */
export type PipCard =
  | {
      kind: 'slots';
      /** ISO start, and the label already formatted in the visitor's zone. */
      slots: { start: string; label: string }[];
    }
  | {
      kind: 'booking';
      when: string;
      meetingUrl: string | null;
      manageUrl: string;
    }
  | { kind: 'lead'; ref: string; summary: string }
  | {
      kind: 'handoff';
      reason: string;
      whatsapp: string;
      phone: string;
      email: string;
      booking: string;
    }
  | { kind: 'links'; items: { label: string; href: string }[] }
  /** A thing about to happen, with the button that arms it. */
  | {
      kind: 'confirm';
      action: 'order' | 'cancel';
      value: string;
      title: string;
      note: string;
      rows: { k: string; v: string }[];
      cta: string;
    }
  /** A thing that has happened. */
  | { kind: 'done'; title: string; detail: string; href?: string; hrefLabel?: string };

export type PipRequest = {
  message: string;
  conversationId?: string | null;
  /** IANA zone from the browser, so slots are offered in the visitor's day. */
  timeZone?: string;
  /**
   * Set only when the visitor tapped a confirmation. The server will not book,
   * order or cancel anything without it, whatever the model asks for.
   */
  confirm?: PipConfirm | null;
};

export type PipResponse = {
  conversationId: string;
  reply: string;
  cards: PipCard[];
  /** True once the conversation has been handed to a person. */
  handoff: boolean;
  /** Suggested next taps, when Pip offered any. */
  quickReplies: string[];
};

export type PipErrorResponse = {
  error: string;
  /** The human channels, so a failed reply still leaves somewhere to go. */
  fallback?: PipCard;
};
