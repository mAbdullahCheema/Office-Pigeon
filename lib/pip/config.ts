import 'server-only';

/**
 * Everything Pip needs from the environment, read at call time.
 *
 * Nothing here is cached in a module constant: a missing key must be able to
 * turn a tier off without a rebuild, and the E2E script sets these variables in
 * the same process it then reads them from.
 */

function env(name: string): string {
  return process.env[name]?.trim() ?? '';
}

/* ── Language models ─────────────────────────────────────────────────── */

export type ProviderTier = {
  /** Stable id, recorded on the message so a bad answer can be traced back. */
  id: string;
  label: string;
  /** OpenAI-compatible base, without the trailing `/chat/completions`. */
  baseUrl: string;
  apiKey: string;
  model: string;
  /**
   * Provider-specific body fields. Used to hold the reasoning models down:
   * left alone, a gpt-oss or Nemotron tier spends most of its output budget
   * thinking and returns an empty answer.
   */
  extra?: Record<string, unknown>;
  /**
   * Set for providers that reject a conversation containing somebody else's
   * tool calls. Gemini's OpenAI-compatible layer wants a `thought_signature`
   * alongside every function call it is shown, which nothing else emits, so
   * replaying a tool round to it is a guaranteed 400. It still answers the
   * first round perfectly well, which is most turns.
   */
  skipAfterToolCalls?: boolean;
};

/**
 * The failover chain, in the order it is tried.
 *
 * Every tier speaks the OpenAI chat-completions dialect and every tier supports
 * tool calling, so a failover changes who answers but never what Pip can do.
 * Tiers without a key are dropped rather than attempted — an unset key is a
 * deliberate "skip this one", not an error.
 */
export function providerChain(): ProviderTier[] {
  const openRouter = env('OPENROUTER_API_KEY');

  const tiers: ProviderTier[] = [
    {
      id: 'openrouter',
      label: 'OpenRouter · DeepSeek v4 Flash',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: openRouter,
      model: env('OPENROUTER_MODEL') || 'deepseek/deepseek-v4-flash',
    },
    {
      // Google's OpenAI-compatible surface, so it costs no extra client code.
      id: 'google',
      label: 'Google AI Studio',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      apiKey: env('GOOGLE_AI_API_KEY'),
      model: env('GOOGLE_MODEL') || 'gemini-3.6-flash',
      skipAfterToolCalls: true,
    },
    {
      id: 'openrouter-free',
      label: 'OpenRouter · free tier',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: openRouter,
      model: env('OPENROUTER_FREE_MODEL') || 'nvidia/nemotron-3-ultra-550b-a55b:free',
      // No reasoning override here: OpenRouter's `reasoning` parameter makes
      // this model return a response with no choices at all. Measured, not
      // assumed — it answers fine without it.
    },
    {
      id: 'cerebras',
      label: 'Cerebras',
      baseUrl: 'https://api.cerebras.ai/v1',
      apiKey: env('CEREBRAS_API_KEY'),
      model: env('CEREBRAS_MODEL') || 'gpt-oss-120b',
      extra: { reasoning_effort: 'low' },
    },
    {
      id: 'groq',
      label: 'Groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: env('GROQ_API_KEY'),
      model: env('GROQ_MODEL') || 'openai/gpt-oss-120b',
      extra: { reasoning_effort: 'low' },
    },
  ];

  return tiers.filter((tier) => tier.apiKey.length > 0);
}

/**
 * Whether Pip can answer at all.
 *
 * With no provider the widget still loads and still offers the phone, WhatsApp
 * and booking links — it just says so instead of pretending to think.
 */
export function pipEnabled(): boolean {
  return env('PIP_ENABLED') !== 'false' && providerChain().length > 0;
}

/* ── Knowledge ───────────────────────────────────────────────────────── */

export type PineconeConfig = {
  apiKey: string;
  host: string;
  index: string;
  namespace: string;
};

export function pineconeConfig(): PineconeConfig | null {
  const apiKey = env('PINECONE_API_KEY');
  const host = env('PINECONE_INDEX_HOST');
  if (!apiKey || !host) return null;

  return {
    apiKey,
    host,
    index: env('PINECONE_INDEX') || 'office-pigeon',
    namespace: env('PINECONE_NAMESPACE') || 'office-pigeon-production',
  };
}

/* ── Booking ─────────────────────────────────────────────────────────── */

export type CalcomConfig = {
  apiKey: string;
  eventTypeId: number;
  username: string;
  slug: string;
  /** Public page, offered whenever the API path is unavailable. */
  bookingUrl: string;
};

export function calcomConfig(): CalcomConfig | null {
  const apiKey = env('CALCOM_API_KEY');
  const eventTypeId = Number(env('CALCOM_EVENT_TYPE_ID'));
  if (!apiKey || !Number.isFinite(eventTypeId) || eventTypeId <= 0) return null;

  const username = env('CALCOM_USERNAME') || 'office-pigeon';
  const slug = env('CALCOM_EVENT_SLUG') || 'demo-call';

  return {
    apiKey,
    eventTypeId,
    username,
    slug,
    bookingUrl: `https://cal.com/${username}/${slug}`,
  };
}
