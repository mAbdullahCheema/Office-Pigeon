/** Mirror of lib/spam.ts — keep the two in step when tuning. */

export const SPAM_THRESHOLD = 0.6;

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

export function spamScore({
  name = '',
  email = '',
  message = '',
}: {
  name?: string | null;
  email?: string | null;
  message?: string | null;
}): number {
  const body = (message ?? '').toLowerCase();
  const who = (name ?? '').toLowerCase();
  const mail = (email ?? '').toLowerCase();

  let score = 0;

  for (const word of SPAM_WORDS) {
    if (body.includes(word)) score += 0.25;
  }

  const links = (body.match(/https?:\/\//g) ?? []).length;
  if (links >= 2) score += 0.2;
  if (links >= 4) score += 0.3;

  if (body.length > 0 && body.length < 15) score += 0.15;
  if (/(.)\1{6,}/.test(body)) score += 0.2;
  if (/[一-鿿Ѐ-ӿ]/.test(body)) score += 0.1;
  if (!/\s/.test(who) && who.length > 20) score += 0.1;
  if (/^[a-z0-9]{12,}@/.test(mail)) score += 0.15;

  const letters = body.replace(/[^a-z]/gi, '');
  if (letters.length > 20) {
    const caps = ((message ?? '').match(/[A-Z]/g) ?? []).length / letters.length;
    if (caps > 0.6) score += 0.2;
  }

  return Math.min(1, Number(score.toFixed(2)));
}
