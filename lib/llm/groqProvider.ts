import { PIP_AI_DEFAULTS } from '@/lib/pip-ai/constants';
import { LLMMessage, LLMResult } from './types';
import { normalizeText, postJson } from './normalizeResponse';

export async function groqProvider(messages: LLMMessage[], signal: AbortSignal): Promise<LLMResult> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || PIP_AI_DEFAULTS.groqModel;

  if (!apiKey) throw new Error('Groq is not configured.');

  const data = await postJson(
    'https://api.groq.com/openai/v1/chat/completions',
    { Authorization: `Bearer ${apiKey}` },
    { model, messages, temperature: 0.45, max_tokens: 600 },
    signal
  );

  return {
    text: normalizeText(data.choices?.[0]?.message?.content, 'Groq'),
    provider: 'groq',
    model,
    raw: data
  };
}
