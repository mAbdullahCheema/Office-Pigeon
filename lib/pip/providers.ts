import 'server-only';

import { providerChain, type ProviderTier } from './config';

/**
 * One call to a language model, tried down the failover chain.
 *
 * All four providers speak the OpenAI chat-completions dialect, so the wire
 * format is written once here rather than four times through four SDKs. What
 * differs between them — base URL, key, model id — is data in `config.ts`.
 */

export type ToolCall = {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
};

export type ChatMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: ToolCall[] }
  | { role: 'tool'; tool_call_id: string; name: string; content: string };

export type ToolSpec = {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type AssistantReply = {
  content: string;
  toolCalls: ToolCall[];
};

export type Completion = AssistantReply & {
  /** Which tier answered, so a strange reply can be traced to a model. */
  provider: string;
  model: string;
};

/**
 * A provider that hangs is a provider that failed; the chain must move on.
 * Generous, because a first token can genuinely take a while under load, and a
 * needless failover costs the visitor more time than waiting would have.
 */
const TIMEOUT_MS = 45_000;

/**
 * Tool-call markup written into the message body rather than emitted as a tool
 * call. Covers DeepSeek's DSML tokens, the Llama/Nemotron `<|python_tag|>` and
 * the plain XML-ish form some models fall back to.
 */
const LEAKED_TOOL_CALL = /<[|｜][^>]*(?:DSML|tool_call|python_tag|function_call)/i;

export class AllProvidersFailed extends Error {
  readonly attempts: { provider: string; reason: string }[];

  constructor(attempts: { provider: string; reason: string }[]) {
    super(
      attempts.length === 0
        ? 'No language model is configured'
        : `Every provider failed: ${attempts.map((a) => `${a.provider} (${a.reason})`).join(', ')}`,
    );
    this.name = 'AllProvidersFailed';
    this.attempts = attempts;
  }
}

type RawChoice = {
  message?: {
    content?: string | null;
    tool_calls?: ToolCall[] | null;
  };
};

/**
 * Some providers answer a malformed request with 400 and a body that explains
 * it. That is worth surfacing in the log, but never to the visitor.
 */
async function reasonFor(response: Response): Promise<string> {
  const body = await response.text().catch(() => '');
  return `${response.status} ${body.slice(0, 300)}`.trim();
}

/**
 * One tier, on its own.
 *
 * Exported for the end-to-end check, which has to know whether *this* provider
 * works — asking through the chain would report a healthy neighbour instead.
 */
export async function callTier(
  tier: ProviderTier,
  messages: ChatMessage[],
  tools: ToolSpec[],
  maxTokens: number,
  /** Wall-clock ms since epoch after which this call must already be over. */
  deadline?: number,
): Promise<Completion> {
  const controller = new AbortController();
  // A tier never gets longer than the turn has left. Without this the last
  // tier tried could start a 45-second call one second before the budget runs
  // out and overshoot it by 44.
  const allowance = deadline ? Math.min(TIMEOUT_MS, deadline - Date.now()) : TIMEOUT_MS;
  const timer = setTimeout(() => controller.abort(), Math.max(allowance, 0));

  try {
    const response = await fetch(`${tier.baseUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${tier.apiKey}`,
        'Content-Type': 'application/json',
        // OpenRouter attributes traffic with these two and rate-limits
        // unattributed callers harder. The others ignore them.
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://officepigeon.com',
        // ASCII only: a header value is a ByteString, and an em dash here
        // throws before the request is ever sent.
        'X-Title': 'Office Pigeon Pip',
      },
      body: JSON.stringify({
        model: tier.model,
        messages,
        ...(tools.length > 0 ? { tools, tool_choice: 'auto' } : {}),
        ...(tier.extra ?? {}),
        temperature: 0.3,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) throw new Error(await reasonFor(response));

    const data = (await response.json()) as { choices?: RawChoice[] };
    const message = data.choices?.[0]?.message;
    if (!message) throw new Error('no choices in response');

    const toolCalls = (message.tool_calls ?? []).filter(
      (call) => call?.function?.name && typeof call.function.arguments === 'string',
    );
    const content = (message.content ?? '').trim();

    // A reply with neither text nor a tool call is a failure this tier cannot
    // recover from, and the next one may well handle the same prompt.
    if (!content && toolCalls.length === 0) throw new Error('empty completion');

    // Some models fall back to writing tool calls as markup in the message
    // body instead of emitting them properly — DeepSeek does it with a large
    // tool set. The call never runs, and the markup would be shown to the
    // visitor as if it were an answer. Treat it as a failed tier: the next one
    // gets the same prompt and normally handles it.
    if (toolCalls.length === 0 && LEAKED_TOOL_CALL.test(content)) {
      throw new Error('tool call leaked into the message body');
    }

    return { content, toolCalls, provider: tier.id, model: tier.model };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Asks the first provider that answers.
 *
 * Each tier gets exactly one attempt: a retry against a provider that just
 * failed costs the visitor another 30 seconds for a worse chance than simply
 * moving down the chain.
 */
export async function complete(
  messages: ChatMessage[],
  tools: ToolSpec[] = [],
  maxTokens = 900,
  /**
   * When the whole turn must be over by. Five tiers at 45 seconds each, across
   * five rounds, is a quarter of an hour of one visitor holding a server slot
   * — which is not a chat reply anyone wants and is a real availability risk
   * when several providers degrade at once. Past the deadline the chain stops
   * trying rather than working through tiers whose answer would arrive too
   * late to use.
   */
  deadline?: number,
): Promise<Completion> {
  const attempts: { provider: string; reason: string }[] = [];
  const replayingTools = messages.some(
    (message) => message.role === 'assistant' && (message.tool_calls?.length ?? 0) > 0,
  );

  for (const tier of providerChain()) {
    if (tier.skipAfterToolCalls && replayingTools) continue;

    if (deadline && Date.now() >= deadline) {
      attempts.push({ provider: tier.id, reason: 'turn budget exhausted' });
      break;
    }

    try {
      return await callTier(tier, messages, tools, maxTokens, deadline);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      attempts.push({ provider: tier.id, reason });
      console.warn(`[pip] ${tier.label} failed: ${reason}`);
    }
  }

  throw new AllProvidersFailed(attempts);
}
