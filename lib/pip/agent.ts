import 'server-only';

import { systemPrompt } from './prompt';
import { AllProvidersFailed, complete, type ChatMessage } from './providers';
import { runTool, toolSpecs, type ToolContext } from './tools';
import type { PipCard, PipConfirm, PipTranscriptEntry } from './types';

/**
 * One turn of the conversation.
 *
 * The model is asked, its tool calls are run, and it is asked again with the
 * results — until it answers in words. Four rounds is the ceiling: a question
 * that genuinely needs more than a search, a price list and a calendar read is
 * a question for a person, and the loop ends by saying so.
 */

const MAX_ROUNDS = 4;
/** Enough history for the thread to make sense, short enough to stay cheap. */
const HISTORY_TURNS = 12;
/**
 * Output budgets. The tool rounds need room for a call plus a sentence; the
 * final round is an answer a person has to read in a chat window, and 500
 * tokens is already longer than anything Pip should be saying.
 */
const TOOL_TOKENS = 800;
const FINAL_TOKENS = 500;
/** A turn that wants more tools than this is looping, not working. */
const MAX_TOOL_CALLS = 8;
/**
 * How long one turn may take, end to end.
 *
 * The per-call timeout in `providers.ts` bounds a single provider, not a turn:
 * five tiers across five rounds is a quarter of an hour of one visitor holding
 * a request open, a rate-limit slot and a database connection — which is not a
 * chat reply anyone would still want, and is how a provider outage turns into
 * an outage here.
 *
 * Seventy-five seconds is deliberately generous against the normal case, which
 * is under fifteen: it leaves room for one provider to time out at forty-five
 * and the next to answer, without ever letting the worst case run away. Past
 * it the turn ends the way every other total failure ends — a person picks it
 * up — rather than by hanging.
 */
const TURN_BUDGET_MS = 75_000;
/** Longer than this and it is a document, not a reply. */
const MAX_REPLY = 1200;

/**
 * Tidies what the model wrote.
 *
 * Small models pad with blank lines, reach for markdown, and occasionally trail
 * off mid-sentence when they hit the token ceiling. The chat bubble renders
 * plain text, so `**bold**` would arrive with its asterisks showing.
 */
function tidy(reply: string): string {
  const trimmed = reply
    .trim()
    // Last line of defence against tool-call markup. `providers.ts` fails a
    // tier that leaks it, but a fragment surviving into an otherwise good
    // answer must still never be shown.
    .replace(/<[|｜][^>]*[|｜]>/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|\s)\*(\S[^*]*?)\*(?=\s|$|[.,;:!?])/g, '$1$2')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n');
  if (trimmed.length <= MAX_REPLY) return trimmed;

  const cut = trimmed.slice(0, MAX_REPLY);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('\n'));
  return `${cut.slice(0, lastStop > 400 ? lastStop + 1 : MAX_REPLY)}`.trim();
}

export type PipTurn = {
  reply: string;
  cards: PipCard[];
  handoff: boolean;
  quickReplies: string[];
  provider: string;
  model: string;
};

export type PipInput = {
  history: PipTranscriptEntry[];
  message: string;
  viewer: { id: string; name: string; email: string; phone: string };
  conversationId: string;
  timeZone: string;
  confirmed: PipConfirm | null;
};

/** What Pip says when every provider is down. Never a blank window. */
const DOWN =
  'I cannot reach my own systems for a moment, so I would rather not guess at an answer. The team can pick this up right now.';

function quickRepliesFor(cards: PipCard[], handoff: boolean): string[] {
  if (handoff) return [];
  // A card that wants a decision should not be competing with three prompts
  // for something else.
  if (cards.some((card) => card.kind !== 'links')) return [];

  return ['What would this cost?', 'Book a free consultation', 'Talk to a human'];
}

/** The same intent `show_pages` is gated on, so the two agree on what a price question is. */
const PRICE_INTENT = /\b(cost|costs|price|prices|pricing|charge|charges|how much|fee|fees|expensive|cheap|afford)\b/i;

/**
 * Makes a price question get a price.
 *
 * Small models sometimes read the price list, then answer around it — "you can
 * see the plans on our pricing page" — which is the single most annoying way a
 * sales assistant can fail. When that happens the answer is sent back once with
 * the figures still in context and an instruction to state them. One extra call,
 * only on the turns that got it wrong.
 */
async function withPrices(
  reply: string,
  messages: ChatMessage[],
  context: { toolsUsed: Set<string> },
  question: string,
  deadline: number,
): Promise<string> {
  const dodged =
    PRICE_INTENT.test(question) && context.toolsUsed.has('get_pricing') && !/\d/.test(reply);
  if (!dodged) return reply;

  try {
    const second = await complete(
      [
        ...messages,
        { role: 'assistant', content: reply },
        {
          role: 'system',
          content:
            'You were asked what something costs and did not give the figures. The prices are in this conversation already. Answer again in two or three sentences, stating the actual numbers. Do not send them to a page instead.',
        },
      ],
      [],
      FINAL_TOKENS,
      deadline,
    );

    return second.content || reply;
  } catch {
    // The first answer was at least an answer.
    return reply;
  }
}

/** Spells out the call a tap has just authorised. */
function confirmationHint(confirmed: PipConfirm | null): string | null {
  if (!confirmed) return null;

  if (confirmed.action === 'slot') {
    return `The visitor has just tapped a slot to confirm it. Call book_consultation now with start="${confirmed.value}". Do not ask them anything else first.`;
  }

  if (confirmed.action === 'order') {
    const [itemId, planId] = confirmed.value.split(':');
    return `The visitor has just tapped to confirm this order. Call place_order now with item_id="${itemId}" and plan_id="${planId}". Do not ask them anything else first.`;
  }

  return 'The visitor has just tapped to confirm the cancellation. Call cancel_consultation now.';
}

export async function runPip(input: PipInput): Promise<PipTurn> {
  const context: ToolContext = {
    viewer: input.viewer,
    conversationId: input.conversationId,
    timeZone: input.timeZone,
    confirmed: input.confirmed,
    visitorMessage: input.message,
    cards: [],
    handoff: false,
    toolsUsed: new Set<string>(),
  };

  const messages: ChatMessage[] = [
    { role: 'system', content: await systemPrompt({ viewer: input.viewer, timeZone: input.timeZone }) },
    ...input.history.slice(-HISTORY_TURNS).map((entry): ChatMessage => ({
      role: entry.role === 'visitor' ? 'user' : 'assistant',
      content: entry.content,
    })),
    { role: 'user', content: input.message },
  ];

  // A tap is unambiguous, so the second half of a two-step action should not
  // depend on the model re-deriving ids from the conversation. It is told
  // exactly which call the visitor just armed.
  const armed = confirmationHint(input.confirmed);
  if (armed) messages.push({ role: 'system', content: armed });

  // One clock for the whole turn, set before the first provider is asked.
  const deadline = Date.now() + TURN_BUDGET_MS;

  let provider = 'none';
  let model = 'none';
  let toolCallsSpent = 0;
  /** One tool, one set of arguments, once — a repeat is a stuck model. */
  const alreadyRun = new Map<string, string>();

  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    // The last round runs without tools, so the model has no choice but to
    // answer in words rather than looping on another search. The same applies
    // once the tool budget is gone.
    const spent = round === MAX_ROUNDS - 1 || toolCallsSpent >= MAX_TOOL_CALLS;
    const tools = spent ? [] : toolSpecs;

    let answer;
    try {
      answer = await complete(messages, tools, spent ? FINAL_TOKENS : TOOL_TOKENS, deadline);
    } catch (error) {
      if (!(error instanceof AllProvidersFailed)) throw error;

      console.error('[pip]', error.message);
      // Every provider being down is itself a reason for a person, and the
      // handoff tool is a plain server function — it works with no model at all.
      await runTool(
        'request_human',
        {
          reason: 'Pip could not reach any language provider',
          summary: `Visitor asked: ${input.message.slice(0, 500)}`,
          priority: 'high',
        },
        context,
      );

      return {
        reply: DOWN,
        cards: context.cards,
        handoff: true,
        quickReplies: [],
        provider: 'none',
        model: 'none',
      };
    }

    provider = answer.provider;
    model = answer.model;

    if (answer.toolCalls.length === 0) {
      const reply = await withPrices(answer.content, messages, context, input.message, deadline);

      return {
        reply: tidy(reply),
        cards: context.cards,
        handoff: context.handoff,
        quickReplies: quickRepliesFor(context.cards, context.handoff),
        provider,
        model,
      };
    }

    messages.push({ role: 'assistant', content: answer.content || null, tool_calls: answer.toolCalls });

    for (const call of answer.toolCalls) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function.arguments || '{}') as Record<string, unknown>;
      } catch {
        // A model that emits malformed arguments gets told so and can retry
        // with the same tool rather than the turn collapsing.
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          name: call.function.name,
          content: 'The arguments were not valid JSON. Call it again with a valid object.',
        });
        continue;
      }

      const signature = `${call.function.name}:${JSON.stringify(args)}`;
      const seen = alreadyRun.get(signature);
      if (seen !== undefined) {
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          name: call.function.name,
          content: `You already ran this and got: ${seen}\n\nDo not call it again. Answer the visitor now.`,
        });
        continue;
      }

      toolCallsSpent += 1;
      const result = await runTool(call.function.name, args, context);
      alreadyRun.set(signature, result.slice(0, 500));

      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        name: call.function.name,
        content: result,
      });
    }
  }

  // Out of rounds with nothing said. Rare, and a person is the honest answer.
  await runTool(
    'request_human',
    {
      reason: 'Pip could not settle on an answer',
      summary: `Visitor asked: ${input.message.slice(0, 500)}`,
      priority: 'normal',
    },
    context,
  );

  return {
    reply: 'I am going round in circles on this one, so let me put you in front of someone who can answer it properly.',
    cards: context.cards,
    handoff: true,
    quickReplies: [],
    provider,
    model,
  };
}
