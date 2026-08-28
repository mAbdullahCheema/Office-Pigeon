import 'server-only';

import { purgeViewer } from '../cache';
import { money } from '../catalog';
import {
  appendThreadMessage,
  bookingsForEmail,
  createBooking,
  createLead,
  createNotification,
  createOrder,
  createThread,
  customerSnapshot,
  listClasses,
  listPaymentMethods,
  nextOrderRef,
  touchConversation,
  updateBooking,
  updateProfile,
  upsertSubscriber,
} from '../data';
import { contactPoints, routes, whatsappLink } from '../routes';
import { getCatalog, getFaqs } from '../site-content';
import * as calcom from './calcom';
import { calcomConfig } from './config';
import { asContext, search } from './knowledge';
import type { ToolSpec } from './providers';
import type { PipCard, PipConfirm } from './types';

/**
 * What Pip can actually do.
 *
 * Every tool is a server function with its own authority: the model chooses
 * which to call and with what, but it never holds a key, never reaches an
 * external service directly, and cannot widen its own permissions by asking
 * nicely. The two tools that write something a person will see — a booking and
 * a lead — are additionally gated on facts the model does not control.
 */

export type ToolContext = {
  viewer: { id: string; name: string; email: string; phone: string };
  conversationId: string;
  timeZone: string;
  /**
   * What the visitor tapped, if anything. Booking, ordering and cancelling all
   * refuse without the matching confirmation, so a model that decides to act on
   * its own initiative cannot.
   */
  confirmed: PipConfirm | null;
  /** What the visitor just said, used for the handoff summary. */
  visitorMessage: string;
  /** Filled by the tools; the route sends these to the widget. */
  cards: PipCard[];
  handoff: boolean;
  /** What has already run this turn, so one tool can require another. */
  toolsUsed: Set<string>;
};

/* ── Definitions ─────────────────────────────────────────────────────── */

export const toolSpecs: ToolSpec[] = [
  {
    type: 'function',
    function: {
      name: 'search_knowledge',
      description:
        'Search Office Pigeon knowledge for how a service works, what a package includes, policies, setup timelines and answers to objections. Use before answering anything you are not certain of. Does not return prices.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: "The visitor's question, rewritten as a standalone search phrase.",
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pricing',
      description:
        'The live price list. The only source of prices — never quote one from anywhere else.',
      parameters: {
        type: 'object',
        properties: {
          group: {
            type: 'string',
            enum: ['Services', 'Academy', 'Products'],
            description: 'Narrow to one part of the catalog. Omit for everything.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_faqs',
      description: 'Published answers to common questions.',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'A word or two to filter on. Omit for all.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_consultation_slots',
      description:
        'Real open times for the free 30-minute consultation. Shows the visitor tappable slots. Call this whenever they want to book.',
      parameters: {
        type: 'object',
        properties: {
          days: {
            type: 'integer',
            description: 'How many days ahead to look. Default 7, maximum 30.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'book_consultation',
      description:
        'Books a consultation slot the visitor has just tapped. Fails if they have not tapped that exact slot — offer the list instead.',
      parameters: {
        type: 'object',
        properties: {
          start: { type: 'string', description: 'The slot start, exactly as it was listed.' },
          phone: {
            type: 'string',
            description: 'Their phone or WhatsApp number. Required if we do not have one on file.',
          },
          notes: { type: 'string', description: 'One line on what they want to discuss.' },
        },
        required: ['start'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'capture_lead',
      description:
        'Records what the visitor needs so a person can pick it up — a written quote, a callback, a fee plan.',
      parameters: {
        type: 'object',
        properties: {
          need: { type: 'string', description: 'What they asked for, in their own words.' },
          service: {
            type: 'string',
            description: 'The service it concerns, e.g. website, chatbot, calling-agent, automation, academy.',
          },
          budget: { type: 'string', description: 'Budget or team size, if they said.' },
          phone: { type: 'string', description: 'A better contact number than the one on file.' },
        },
        required: ['need'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_my_account',
      description:
        "The signed-in visitor's own orders, invoices, payments and enrolled classes. Use for any question about their account.",
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_academy_classes',
      description: 'The Academy classes currently running — subject, level, tutor and when they meet.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'Filter, e.g. physics, maths, IELTS. Omit for all.' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_payment_details',
      description:
        'How to pay — the bank, mobile-wallet and crypto details Office Pigeon accepts, with the instructions for each.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'place_order',
      description:
        'Starts an order for a service or Academy plan. Call it once to show the visitor what they are about to order; they tap to confirm, and it is placed. Nothing is charged — the order enters at "awaiting payment".',
      parameters: {
        type: 'object',
        properties: {
          item_id: { type: 'string', description: 'The catalog item id, exactly as get_pricing gave it.' },
          plan_id: { type: 'string', description: 'The plan id within that item.' },
          notes: { type: 'string', description: 'Anything they want the team to know.' },
        },
        required: ['item_id', 'plan_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'cancel_consultation',
      description:
        'Cancels the consultation this visitor has booked. Call it once to show them what will be cancelled; they tap to confirm, and it is released.',
      parameters: {
        type: 'object',
        properties: { reason: { type: 'string', description: 'Why, if they said.' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'message_team',
      description:
        'Opens a support thread the team answers in the visitor\'s dashboard. Use for anything that needs a written, tracked reply rather than a live handover.',
      parameters: {
        type: 'object',
        properties: {
          subject: { type: 'string', description: 'A short subject line.' },
          message: { type: 'string', description: 'What they want to say, in their words.' },
        },
        required: ['subject', 'message'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'subscribe_to_updates',
      description:
        'Puts them on the list for launch news — the right answer when they ask to be told when one of the products opens.',
      parameters: {
        type: 'object',
        properties: { topic: { type: 'string', description: 'What they want to hear about.' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_my_details',
      description:
        'Saves the visitor\'s own phone, company, city or country to their account. Only ever with details they just gave you.',
      parameters: {
        type: 'object',
        properties: {
          phone: { type: 'string' },
          company: { type: 'string' },
          city: { type: 'string' },
          country: { type: 'string' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'show_pages',
      description:
        'Puts links to pages on the site in front of the visitor, alongside an answer you have already given. Never a substitute for answering — do not use it to avoid quoting a price or explaining something.',
      parameters: {
        type: 'object',
        properties: {
          pages: {
            type: 'array',
            description: 'Two or three at most.',
            items: {
              type: 'string',
              enum: [
                'websites',
                'chatbots',
                'calling-agents',
                'automations',
                'academy',
                'examples',
                'pricing',
                'faq',
                'order',
                'contact',
                'dashboard',
                'legal',
              ],
            },
          },
        },
        required: ['pages'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'request_human',
      description:
        'Hands the conversation to the Office Pigeon team and shows the visitor how to reach a person now.',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string', description: 'Why a person is needed.' },
          summary: { type: 'string', description: 'What the team needs to know to pick this up cold.' },
          priority: { type: 'string', enum: ['high', 'normal', 'low'] },
        },
        required: ['reason', 'summary'],
      },
    },
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────── */

function slotLabel(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone,
  }).format(new Date(iso));
}

/** Two ISO strings for the same instant, written differently, are the same slot. */
function sameInstant(a: string | null, b: string): boolean {
  if (!a) return false;
  const left = Date.parse(a);
  const right = Date.parse(b);
  return Number.isFinite(left) && Number.isFinite(right) && left === right;
}

/** Did the visitor tap this exact thing? */
function armed(context: ToolContext, action: PipConfirm['action'], value: string): boolean {
  if (context.confirmed?.action !== action) return false;
  return action === 'slot'
    ? sameInstant(context.confirmed.value, value)
    : context.confirmed.value === value;
}

function text(value: unknown, max = 400): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/* ── Executors ───────────────────────────────────────────────────────── */

type Args = Record<string, unknown>;

async function searchKnowledge(args: Args): Promise<string> {
  const retrieval = await search(text(args.query, 300));
  if (retrieval.weak) {
    return 'Nothing solid came back for that. Do not guess an answer — say you would rather not get it wrong and offer to put them in front of the team.';
  }
  return asContext(retrieval);
}

async function getPricing(args: Args): Promise<string> {
  const group = text(args.group, 32);
  const entries = await getCatalog();
  const wanted = group ? entries.filter((entry) => entry.group === group) : entries;

  if (wanted.length === 0) return 'Nothing is published in that part of the catalog.';

  // The ids are printed because `place_order` needs them and has no other way
  // to learn them. Names are not ids and will be refused.
  return wanted
    .map((entry) => {
      const plans = entry.plans.length
        ? entry.plans
            .map(
              (plan) =>
                `plan_id="${plan.id}" ${plan.name} ${money(plan.price)}${plan.unit} (${plan.note})`,
            )
            .join('; ')
        : 'no published price yet — it is still in build, so do not quote one';
      return `item_id="${entry.itemId}" ${entry.name} [${entry.group}] — ${entry.blurb} Plans: ${plans}`;
    })
    .join('\n');
}

async function faqs(args: Args): Promise<string> {
  const topic = text(args.topic, 64).toLowerCase();
  const all = await getFaqs();
  const matching = topic
    ? all.filter((faq) => `${faq.question} ${faq.answer}`.toLowerCase().includes(topic))
    : all;

  const chosen = (matching.length > 0 ? matching : all).slice(0, 6);
  if (chosen.length === 0) return 'No FAQs are published.';

  return chosen.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n');
}

async function listSlots(args: Args, context: ToolContext): Promise<string> {
  const requested = Number(args.days);
  const days = Number.isFinite(requested) ? Math.min(Math.max(Math.trunc(requested), 1), 30) : 7;

  const config = calcomConfig();
  if (!config) {
    return `Booking is not connected right now. Point them at ${contactPoints.phone} on WhatsApp instead.`;
  }

  try {
    const slots = await calcom.listSlots(context.timeZone, days, 8);
    if (slots.length === 0) {
      return `Nothing is open in the next ${days} days. Offer the booking page ${config.bookingUrl} or WhatsApp.`;
    }

    context.cards.push({
      kind: 'slots',
      slots: slots.map((slot) => ({
        start: slot.start,
        label: slotLabel(slot.start, context.timeZone),
      })),
    });

    return `Open slots, now shown to the visitor as buttons: ${slots
      .map((slot) => slotLabel(slot.start, context.timeZone))
      .join(', ')}. Tell them to tap the one that suits — do not ask them to type a time, and do not book anything yourself.`;
  } catch (error) {
    console.error('[pip] slots failed:', (error as Error).message);
    return `The calendar could not be read. Offer the booking page ${config.bookingUrl}.`;
  }
}

async function bookConsultation(args: Args, context: ToolContext): Promise<string> {
  const start = text(args.start, 64);
  const config = calcomConfig();

  if (!config) return 'Booking is not connected. Offer WhatsApp or the contact page.';

  // The gate. A confirmation is a tap the visitor made in the widget, not
  // something the model can assert on their behalf.
  if (!armed(context, 'slot', start)) {
    return 'That slot has not been confirmed by the visitor. Call list_consultation_slots and ask them to tap the time they want. Do not claim anything is booked.';
  }

  const phone = text(args.phone, 32) || context.viewer.phone;
  if (!phone) {
    return 'A phone or WhatsApp number is required for this booking. Ask for one, then book.';
  }

  try {
    const booking = await calcom.book({
      start,
      name: context.viewer.name,
      email: context.viewer.email,
      phone,
      timeZone: context.timeZone,
      notes: text(args.notes, 400),
    });

    const when = slotLabel(booking.start, context.timeZone);

    context.cards.push({
      kind: 'booking',
      when,
      meetingUrl: booking.meetingUrl,
      manageUrl: booking.manageUrl,
    });

    // The site keeps its own copy so the booking shows on the dashboard
    // alongside the ones taken through the booking form.
    await createBooking({
      name: context.viewer.name,
      email: context.viewer.email,
      phone,
      company: null,
      service_slug: 'consultation',
      slot_at: booking.start,
      timezone: context.timeZone,
      channel: 'meet',
      notes: `Booked by Pip. Cal.com ${booking.uid}. ${text(args.notes, 200)}`.trim(),
      status: 'confirmed',
    }).catch((error) => console.error('[pip] booking mirror failed:', error.message));

    await createNotification({
      kind: 'booking',
      title: `Consultation booked — ${context.viewer.name}`,
      body: `${when} (${context.timeZone}). Booked through Pip. ${phone}`,
      href: routes.dashboard,
      user_id: null,
    }).catch(() => undefined);

    return `Booked for ${when}. Confirmation and the meeting link are on their way by email. The details are already on screen — just confirm it warmly in one line.`;
  } catch (error) {
    const message = error instanceof calcom.CalcomError ? error.message : 'the calendar refused it';
    console.error('[pip] booking failed:', message);
    return `That did not go through (${message}). Apologise briefly, call list_consultation_slots again so they can pick another time, or offer ${config.bookingUrl}.`;
  }
}

async function captureLead(args: Args, context: ToolContext): Promise<string> {
  const need = text(args.need, 2000);
  if (!need) return 'Ask what they need first, then record it.';

  const lead = await createLead({
    name: context.viewer.name,
    email: context.viewer.email,
    phone: text(args.phone, 32) || context.viewer.phone || null,
    company: null,
    website: null,
    service_slug: text(args.service, 64) || null,
    package_slug: null,
    budget: text(args.budget, 64) || null,
    message: `${need}\n\nRaised by Pip from a chat.`,
    source: 'chatbot',
    status: 'new',
    spam_score: 0,
    country: null,
    ip: null,
    user_agent: null,
  });

  const ref = `PIP-${lead.id.slice(0, 8).toUpperCase()}`;

  await touchConversation(context.conversationId, {
    lead_id: lead.id,
    name: context.viewer.name,
    email: context.viewer.email,
  }).catch(() => undefined);

  context.cards.push({ kind: 'lead', ref, summary: need.slice(0, 160) });

  return `Recorded as ${ref}. The team sees it now. Tell them it is with a person and roughly when to expect a reply — one working day.`;
}

async function myAccount(context: ToolContext): Promise<string> {
  const snapshot = await customerSnapshot(context.viewer.id, context.viewer.email);

  if (
    snapshot.orders.length === 0 &&
    snapshot.invoices.length === 0 &&
    snapshot.enrollments.length === 0
  ) {
    return 'This account has no orders, invoices or classes yet.';
  }

  const orders = snapshot.orders
    .slice(0, 6)
    .map(
      (order) =>
        `${order.ref}: ${order.item_name ?? order.item_id} — ${order.status}, payment ${order.payment_status}, due ${money(order.amount_due, order.currency)}`,
    );

  // Anything still owed gets its own button. Telling someone they have an
  // unpaid invoice and leaving them to find the page is half an answer.
  const payable = snapshot.orders
    .filter((order) => order.payment_status === 'unpaid' || order.payment_status === 'partially_paid')
    .slice(0, 3)
    .map((order) => ({
      label: `Pay ${order.ref} — ${money(order.amount_due, order.currency)}`,
      href: `${routes.dashboard}/orders/${order.id}/pay`,
    }));

  if (payable.length > 0) context.cards.push({ kind: 'links', items: payable });

  const invoices = snapshot.invoices
    .slice(0, 6)
    .map((invoice) => `${invoice.number}: ${invoice.status}`);

  const classes = snapshot.enrollments.slice(0, 6).map((enrollment) => enrollment.class_id);

  return [
    orders.length ? `Orders:\n${orders.join('\n')}` : '',
    invoices.length ? `Invoices:\n${invoices.join('\n')}` : '',
    classes.length ? `Enrolled classes: ${classes.join(', ')}` : '',
    payable.length > 0
      ? 'A pay button for each unpaid order is already on screen — mention it rather than describing where to click.'
      : '',
    'Their dashboard has the full detail.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

async function academyClasses(args: Args): Promise<string> {
  const subject = text(args.subject, 64).toLowerCase();
  const all = await listClasses({ publishedOnly: true, limit: 60 });
  const wanted = subject
    ? all.filter((row) => `${row.title} ${row.subject ?? ''} ${row.level ?? ''}`.toLowerCase().includes(subject))
    : all;

  const chosen = (wanted.length > 0 ? wanted : all).slice(0, 12);
  if (chosen.length === 0) {
    return 'No classes are published right now. Offer the Academy page or a free trial class instead.';
  }

  return chosen
    .map(
      (row) =>
        `${row.title}${row.subject ? ` — ${row.subject}` : ''}${row.level ? ` (${row.level})` : ''}${
          row.tutor ? `, with ${row.tutor}` : ''
        }${row.time_label ? `, ${row.time_label}` : ''} [${row.status}]`,
    )
    .join('\n');
}

async function paymentDetails(): Promise<string> {
  const methods = await listPaymentMethods();
  if (methods.length === 0) {
    return 'No payment methods are published. Send them to the dashboard or a person.';
  }

  return methods
    .map((method) =>
      [
        `${method.label} (${method.currency})`,
        method.bank_name ? `Bank: ${method.bank_name}` : '',
        method.account_name ? `Account name: ${method.account_name}` : '',
        method.address ? `Number: ${method.address}` : '',
        method.iban ? `IBAN: ${method.iban}` : '',
        method.instructions ?? '',
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n\n')
    .concat(
      '\n\nAfter paying they upload the proof on their order page, and a person verifies it — usually within a few hours.',
    );
}

/**
 * An order, in two steps.
 *
 * The first call prices it from the published catalog and puts a review card on
 * screen; the second — armed by the visitor's tap — writes the row. Products are
 * refused outright, exactly as the order form refuses them, because they are
 * still in build and have no price to honour.
 */
async function placeOrder(args: Args, context: ToolContext): Promise<string> {
  const itemId = text(args.item_id, 64);
  const planId = text(args.plan_id, 64);

  const catalog = await getCatalog();
  const item = catalog.find((entry) => entry.itemId === itemId);
  const plan = item?.plans.find((entry) => entry.id === planId);

  if (!item || !plan) {
    // Naming the alternatives is what turns a dead end into a retry: the model
    // reached here because it guessed a name where an id was wanted.
    const known = item
      ? `Plans for ${item.name}: ${item.plans.map((entry) => entry.id).join(', ')}`
      : `Known item ids: ${catalog.map((entry) => entry.itemId).join(', ')}`;
    return `No such item or plan. ${known}. Use those exact ids.`;
  }
  if (item.group === 'Products') {
    return `${item.name} is still in build and cannot be ordered. Say so plainly and offer to add them to the launch list with subscribe_to_updates.`;
  }

  const value = `${item.itemId}:${plan.id}`;

  if (!armed(context, 'order', value)) {
    context.cards.push({
      kind: 'confirm',
      action: 'order',
      value,
      title: `${item.name} — ${plan.name}`,
      note: 'Nothing is charged now. The order is raised as awaiting payment, and you pay from your dashboard.',
      rows: [
        { k: 'What', v: `${item.name} (${plan.name})` },
        { k: 'Price', v: `${money(plan.price)}${plan.unit}` },
        { k: 'Note', v: plan.note || '—' },
      ],
      cta: 'Place this order',
    });

    return `Review card shown for ${item.name} ${plan.name} at ${money(plan.price)}${plan.unit}. Tell them to tap to confirm — do not claim it is ordered yet.`;
  }

  const ref = await nextOrderRef();
  const order = await createOrder({
    ref,
    status: 'Awaiting payment',
    verified: false,
    item_id: item.itemId,
    item_name: item.name,
    plan_id: plan.id,
    plan_name: plan.name,
    price: plan.price,
    unit: plan.unit,
    group_key: item.group,
    currency: 'USD',
    amount_due: plan.price,
    amount_paid: 0,
    payment_status: 'unpaid',
    name: context.viewer.name,
    email: context.viewer.email,
    phone: context.viewer.phone || null,
    company: null,
    country: null,
    notes: [text(args.notes, 1000), 'Ordered through Pip.'].filter(Boolean).join('\n\n'),
    user_id: context.viewer.id || null,
    ip: null,
    spam_score: 0,
  });

  if (context.viewer.id) await purgeViewer(context.viewer.id).catch(() => undefined);

  await createNotification({
    kind: 'system',
    title: `Order ${ref} placed through Pip`,
    body: `${context.viewer.name} — ${item.name} (${plan.name}), ${money(plan.price)}${plan.unit}`,
    href: `${routes.dashboard}/orders`,
    user_id: null,
  }).catch(() => undefined);

  context.cards.push({
    kind: 'done',
    title: `Order ${ref} raised`,
    detail: `${item.name} — ${plan.name}. Nothing has been charged; pay when you are ready and a person verifies it.`,
    href: `${routes.dashboard}/orders/${order.id}/pay`,
    hrefLabel: 'Pay this order',
  });

  return `Order ${ref} is on their account, awaiting payment. Confirm it in one line and mention they can pay from the button on screen.`;
}

/** Gives a slot back, in the same two steps as taking one. */
async function cancelConsultation(args: Args, context: ToolContext): Promise<string> {
  const upcoming = await upcomingBooking(context);
  if (!upcoming) return 'They have no consultation booked. Offer to book one instead.';

  const uid = upcoming.uid;
  if (!uid) {
    return `Their booking is on ${slotLabel(upcoming.slot_at, context.timeZone)} but it was not taken through Pip, so it has to be changed from the confirmation email. Offer a person.`;
  }

  if (!armed(context, 'cancel', uid)) {
    context.cards.push({
      kind: 'confirm',
      action: 'cancel',
      value: uid,
      title: 'Cancel your consultation',
      note: 'The slot goes back into the calendar. You can always book another.',
      rows: [{ k: 'Booked for', v: slotLabel(upcoming.slot_at, context.timeZone) }],
      cta: 'Cancel it',
    });
    return 'Shown them what would be cancelled. Ask them to tap to confirm — nothing is cancelled yet.';
  }

  await calcom.cancel(uid, text(args.reason, 200) || 'Cancelled by the customer through Pip');
  await updateBooking(upcoming.id, { status: 'cancelled' }).catch(() => undefined);

  await createNotification({
    kind: 'booking',
    title: `Consultation cancelled — ${context.viewer.name}`,
    body: `${slotLabel(upcoming.slot_at, context.timeZone)}. Cancelled through Pip.`,
    href: routes.dashboard,
    user_id: null,
  }).catch(() => undefined);

  context.cards.push({
    kind: 'done',
    title: 'Consultation cancelled',
    detail: 'The slot is back in the calendar. Book another whenever suits.',
  });

  return 'Cancelled. Say so in one line and offer to rebook whenever they want.';
}

/** The next consultation this person holds, if any. */
async function upcomingBooking(context: ToolContext) {
  const rows = await bookingsForEmail(context.viewer.email).catch(() => []);

  const next = rows
    .filter((row) => row.status !== 'cancelled' && Date.parse(row.slot_at) > Date.now())
    .sort((a, b) => a.slot_at.localeCompare(b.slot_at))[0];

  if (!next) return null;

  // The Cal.com id is recorded in the note when Pip took the booking.
  const uid = /Cal\.com ([A-Za-z0-9_-]+)/.exec(next.notes ?? '')?.[1] ?? null;
  return { id: next.id, slot_at: next.slot_at, uid };
}

async function messageTeam(args: Args, context: ToolContext): Promise<string> {
  const subject = text(args.subject, 200);
  const message = text(args.message, 4000);
  if (!subject || !message) return 'Ask what they want to say first.';
  if (!context.viewer.id) return 'This needs a signed-in account. Use request_human instead.';

  const thread = await createThread({
    subject,
    user_id: context.viewer.id,
    email: context.viewer.email,
    name: context.viewer.name,
    status: 'open',
    order_ref: null,
    last_message_at: new Date().toISOString(),
    last_message_from: 'customer',
    message_count: 0,
    unread_for_staff: true,
    unread_for_customer: false,
  });

  await appendThreadMessage(thread.id, {
    role: 'customer',
    author_id: context.viewer.id,
    author_name: context.viewer.name,
    body: message,
  });

  await createNotification({
    kind: 'message',
    title: `New thread from ${context.viewer.name}`,
    body: `${subject}\n${message.slice(0, 300)}`,
    href: `${routes.dashboard}/messages`,
    user_id: null,
  }).catch(() => undefined);

  context.cards.push({
    kind: 'done',
    title: 'Message sent',
    detail: `"${subject}" is with the team. Their reply lands in your dashboard and you will be notified.`,
    href: `${routes.dashboard}/messages`,
    hrefLabel: 'Open messages',
  });

  return 'Sent. Tell them where the reply will appear and roughly when — one working day.';
}

async function subscribe(args: Args, context: ToolContext): Promise<string> {
  await upsertSubscriber(context.viewer.email, {
    email: context.viewer.email,
    name: context.viewer.name,
    confirmed: true,
    source: 'pip',
  });

  context.cards.push({
    kind: 'done',
    title: 'You are on the list',
    detail: `We will email ${context.viewer.email} the moment ${text(args.topic, 80) || 'there is news'}.`,
  });

  return 'Added to the launch list. One short line back — do not oversell it, and do not promise a date.';
}

async function updateDetails(args: Args, context: ToolContext): Promise<string> {
  if (!context.viewer.id) return 'This needs a signed-in account.';

  const patch: Record<string, string> = {};
  if (text(args.phone, 32)) patch.phone = text(args.phone, 32);
  if (text(args.company, 128)) patch.company = text(args.company, 128);
  if (text(args.city, 64)) patch.city = text(args.city, 64);
  if (text(args.country, 64)) patch.country = text(args.country, 64);

  if (Object.keys(patch).length === 0) return 'Nothing to save. Ask them what to change.';

  await updateProfile(context.viewer.id, patch);
  await purgeViewer(context.viewer.id).catch(() => undefined);

  return `Saved to their account: ${Object.keys(patch).join(', ')}. Confirm in a few words and carry on.`;
}

/** The only pages Pip can link to. A model cannot invent a URL from here. */
const PAGES: Record<string, { label: string; href: string }> = {
  websites: { label: 'Websites', href: routes.websites },
  chatbots: { label: 'Chatbots', href: routes.chatbots },
  'calling-agents': { label: 'AI calling agents', href: routes.callingAgents },
  automations: { label: 'Automations', href: routes.automations },
  academy: { label: 'The Academy', href: routes.academy },
  examples: { label: 'Work we have done', href: routes.examples },
  pricing: { label: 'Pricing', href: routes.pricing },
  faq: { label: 'Common questions', href: routes.faq },
  order: { label: 'Place an order', href: routes.order },
  contact: { label: 'Contact us', href: routes.contact },
  dashboard: { label: 'Your dashboard', href: routes.dashboard },
  legal: { label: 'Terms and policies', href: routes.legal },
};

/** "How much", "what do you charge", "is it expensive" — all the same question. */
const PRICE_INTENT = /\b(cost|costs|price|prices|pricing|charge|charges|how much|fee|fees|quote|budget|expensive|cheap|afford)\b/i;

async function showPages(args: Args, context: ToolContext): Promise<string> {
  // Linking to the pricing page instead of saying the number is the single most
  // common way a model dodges a price question. It is refused here rather than
  // discouraged in the prompt, because discouragement only works most of the time.
  if (PRICE_INTENT.test(context.visitorMessage) && !context.toolsUsed.has('get_pricing')) {
    return 'They asked what something costs. Call get_pricing and give them the actual figures first — a link is not an answer to a price question.';
  }

  const wanted = Array.isArray(args.pages) ? args.pages : [];
  const items = wanted
    .map((page) => PAGES[String(page)])
    .filter((page): page is { label: string; href: string } => Boolean(page))
    .slice(0, 3);

  if (items.length === 0) return 'None of those pages exist. Answer in words instead.';

  context.cards.push({ kind: 'links', items });
  return `Shown to the visitor as links: ${items.map((item) => item.label).join(', ')}. Mention them in one short line — do not paste the addresses.`;
}

async function requestHuman(args: Args, context: ToolContext): Promise<string> {
  const reason = text(args.reason, 200);
  const summary = text(args.summary, 1000);
  const priority = ['high', 'normal', 'low'].includes(String(args.priority))
    ? String(args.priority)
    : 'normal';

  context.handoff = true;

  await touchConversation(context.conversationId, {
    status: 'handoff',
    name: context.viewer.name,
    email: context.viewer.email,
    summary: `${reason} — ${summary}`.slice(0, 2000),
  }).catch(() => undefined);

  await createNotification({
    kind: 'message',
    title: `Pip handed over a chat — ${priority} priority`,
    body: `${context.viewer.name} (${context.viewer.email})\nReason: ${reason}\n${summary}`,
    href: `${routes.dashboard}/manage/chats`,
    user_id: null,
  }).catch((error) => console.error('[pip] handoff alert failed:', error.message));

  const message = [
    'Hi Office Pigeon, I was chatting with Pip and need a person.',
    '',
    `Name: ${context.viewer.name}`,
    `Email: ${context.viewer.email}`,
    '',
    `My question: ${context.visitorMessage.slice(0, 300)}`,
  ].join('\n');

  context.cards.push({
    kind: 'handoff',
    reason,
    whatsapp: whatsappLink(message),
    phone: contactPoints.phoneHref,
    email: contactPoints.emailHref,
    booking: calcomConfig()?.bookingUrl ?? contactPoints.demoCall,
  });

  return 'The team has this now, and the ways to reach a person are already on screen. Say so in one plain line — do not mention tickets, escalation or systems.';
}

/* ── Dispatch ────────────────────────────────────────────────────────── */

/**
 * Runs one tool call.
 *
 * A tool that throws returns its failure to the model as text rather than
 * ending the turn: the conversation is worth more than the tool, and Pip can
 * still offer a person.
 */
export async function runTool(
  name: string,
  args: Args,
  context: ToolContext,
): Promise<string> {
  try {
    context.toolsUsed.add(name);
    switch (name) {
      case 'search_knowledge':
        return await searchKnowledge(args);
      case 'get_pricing':
        return await getPricing(args);
      case 'get_faqs':
        return await faqs(args);
      case 'list_consultation_slots':
        return await listSlots(args, context);
      case 'book_consultation':
        return await bookConsultation(args, context);
      case 'capture_lead':
        return await captureLead(args, context);
      case 'get_my_account':
        return await myAccount(context);
      case 'show_pages':
        return await showPages(args, context);
      case 'list_academy_classes':
        return await academyClasses(args);
      case 'get_payment_details':
        return await paymentDetails();
      case 'place_order':
        return await placeOrder(args, context);
      case 'cancel_consultation':
        return await cancelConsultation(args, context);
      case 'message_team':
        return await messageTeam(args, context);
      case 'subscribe_to_updates':
        return await subscribe(args, context);
      case 'update_my_details':
        return await updateDetails(args, context);
      case 'request_human':
        return await requestHuman(args, context);
      default:
        return `There is no tool called ${name}.`;
    }
  } catch (error) {
    console.error(`[pip] tool ${name} failed:`, (error as Error).message);
    return 'That did not work. Do not retry it — tell the visitor plainly and offer to put them in front of the team.';
  }
}
