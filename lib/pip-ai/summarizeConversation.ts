import { LLMMessage } from '@/lib/llm/types';

export function summarizeConversation(messages: LLMMessage[], maxChars = 1200) {
  const summary = messages
    .filter((message) => message.role !== 'system')
    .slice(-8)
    .map((message) => `${message.role === 'assistant' ? 'Pip' : 'Visitor'}: ${message.content}`)
    .join('\n');

  return summary.length > maxChars ? `${summary.slice(0, maxChars)}...` : summary;
}
