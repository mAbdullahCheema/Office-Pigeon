export type LLMRole = 'system' | 'user' | 'assistant';

export interface LLMMessage {
  role: LLMRole;
  content: string;
}

export interface LLMResult {
  text: string;
  provider: string;
  model: string;
  raw?: unknown;
  error?: string;
}

export type LLMProvider = (messages: LLMMessage[], signal: AbortSignal) => Promise<LLMResult>;
