import { PIP_AI_DEFAULTS } from '@/lib/pip-ai/constants';
import { LLMMessage, LLMResult } from './types';
import { normalizeText, postJson } from './normalizeResponse';

export async function cerebrasProvider(messages: LLMMessage[], signal: AbortSignal): Promise<LLMResult> {
  const apiKey = process.env.CEREBRAS_API_KEY;
  const model = process.env.CEREBRAS_MODEL || PIP_AI_DEFAULTS.cerebrasModel;

  if (!apiKey) throw new Error('Cerebras is not configured.');

  const data = await postJson(
    'https://api.cerebras.ai/v1/chat/completions',
    { Authorization: `Bearer ${apiKey}` },
    { model, messages, temperature: 0.45, max_tokens: 600 },
    signal
  );

  return {
    text: normalizeText(data.choices?.[0]?.message?.content, 'Cerebras'),
    provider: 'cerebras',
    model,
    raw: data
  };
}
