import { GoogleGenAI } from '@google/genai';
import { PIP_AI_DEFAULTS } from '@/lib/pip-ai/constants';
import { LLMMessage, LLMResult } from './types';
import { normalizeText } from './normalizeResponse';

export async function geminiProvider(messages: LLMMessage[], signal: AbortSignal): Promise<LLMResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || PIP_AI_DEFAULTS.geminiModel;

  if (!apiKey) throw new Error('Gemini is not configured.');

  const ai = new GoogleGenAI({ apiKey });
  const system = messages.find((message) => message.role === 'system')?.content;
  const contents = messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }]
    }));

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: system,
      temperature: 0.45,
      maxOutputTokens: 600,
      abortSignal: signal
    } as any
  });

  return {
    text: normalizeText(response.text, 'Gemini'),
    provider: 'gemini',
    model,
    raw: response
  };
}
