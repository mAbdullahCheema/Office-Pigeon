import { PIP_AI_DEFAULTS } from '@/lib/pip-ai/constants';
import { LLMMessage, LLMResult } from './types';
import { normalizeText, postJson } from './normalizeResponse';

export async function cohereProvider(messages: LLMMessage[], signal: AbortSignal): Promise<LLMResult> {
  const apiKey = process.env.COHERE_API_KEY;
  const model = process.env.COHERE_MODEL || PIP_AI_DEFAULTS.cohereModel;

  if (!apiKey) throw new Error('Cohere is not configured.');

  const system = messages.find((message) => message.role === 'system')?.content;
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content || 'Hello';
  const chatHistory = messages
    .filter((message) => message.role !== 'system')
    .slice(0, -1)
    .map((message) => ({
      role: message.role === 'assistant' ? 'CHATBOT' : 'USER',
      message: message.content
    }));

  const data = await postJson(
    'https://api.cohere.com/v1/chat',
    { Authorization: `Bearer ${apiKey}` },
    { model, preamble: system, message: lastUserMessage, chat_history: chatHistory, temperature: 0.45, max_tokens: 600 },
    signal
  );

  return {
    text: normalizeText(data.text, 'Cohere'),
    provider: 'cohere',
    model,
    raw: data
  };
}
