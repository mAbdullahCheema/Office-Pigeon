import { PIP_AI_DEFAULTS } from '@/lib/pip-ai/constants';
import { LLMMessage, LLMResult } from './types';
import { normalizeText, postJson } from './normalizeResponse';

export async function openrouterProvider(messages: LLMMessage[], signal: AbortSignal): Promise<LLMResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || PIP_AI_DEFAULTS.openRouterModel;

  if (!apiKey) throw new Error('OpenRouter is not configured.');

  const data = await postJson(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || '',
      'X-Title': process.env.OPENROUTER_SITE_NAME || 'Office Pigeon'
    },
    { model, messages, temperature: 0.45, max_tokens: 600 },
    signal
  );

  return {
    text: normalizeText(data.choices?.[0]?.message?.content, 'OpenRouter'),
    provider: 'openrouter',
    model,
    raw: data
  };
}
