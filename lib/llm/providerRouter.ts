import { PIP_AI_DEFAULTS } from '@/lib/pip-ai/constants';
import { cerebrasProvider } from './cerebrasProvider';
import { cohereProvider } from './cohereProvider';
import { geminiProvider } from './geminiProvider';
import { groqProvider } from './groqProvider';
import { openrouterProvider } from './openrouterProvider';
import { LLMMessage, LLMProvider, LLMResult } from './types';

const providers: Array<{ name: string; run: LLMProvider }> = [
  { name: 'gemini', run: geminiProvider },
  { name: 'openrouter', run: openrouterProvider },
  { name: 'cerebras', run: cerebrasProvider },
  { name: 'groq', run: groqProvider },
  { name: 'cohere', run: cohereProvider }
];

function timeoutMs() {
  return Number(process.env.PIP_AI_PROVIDER_TIMEOUT_MS || PIP_AI_DEFAULTS.providerTimeoutMs);
}

export async function routeLLM(messages: LLMMessage[]): Promise<LLMResult & { fallbackTriggered: boolean }> {
  const errors: string[] = [];

  for (const provider of providers) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs());

    try {
      const result = await provider.run(messages, controller.signal);
      clearTimeout(timer);
      return { ...result, fallbackTriggered: errors.length > 0 };
    } catch (error) {
      clearTimeout(timer);
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${provider.name}: ${message}`);
      console.warn(`[Pip AI] ${provider.name} failed; trying next provider.`, message);
    }
  }

  throw new Error(`All Pip AI providers failed. ${errors.join(' | ')}`);
}
