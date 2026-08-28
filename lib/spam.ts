/**
 * Cheap heuristic spam score in the range 0–1. Deliberately dependency-free so
 * the identical logic can run inside the spam-check edge function.
 */

const SPAM_WORDS = [
  'seo services',
  'crypto',
  'bitcoin',
  'casino',
  'viagra',
  'loan offer',
  'work from home',
  'guaranteed ranking',
  'buy followers',
  'telegram me',
];

export function spamScore(input: { name?: string; email?: string; message?: string }): number {
  const message = (input.message ?? '').toLowerCase();
  const name = (input.name ?? '').toLowerCase();
  const email = (input.email ?? '').toLowerCase();

  let score = 0;

  for (const word of SPAM_WORDS) {
    if (message.includes(word)) score += 0.25;
  }

  const links = (message.match(/https?:\/\//g) ?? []).length;
  if (links >= 2) score += 0.2;
  if (links >= 4) score += 0.3;

  if (message.length > 0 && message.length < 15) score += 0.15;
  if (/(.)\1{6,}/.test(message)) score += 0.2;
  if (/[一-鿿Ѐ-ӿ]/.test(message)) score += 0.1;
  if (!/\s/.test(name) && name.length > 20) score += 0.1;
  if (/^[a-z0-9]{12,}@/.test(email)) score += 0.15;

  const upper = message.replace(/[^a-z]/gi, '');
  if (upper.length > 20) {
    const caps = (message.match(/[A-Z]/g) ?? []).length / upper.length;
    if (caps > 0.6) score += 0.2;
  }

  return Math.min(1, Number(score.toFixed(2)));
}

export const SPAM_THRESHOLD = 0.6;
