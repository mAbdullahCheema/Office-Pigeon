import { NextRequest, NextResponse } from 'next/server';
import { answerPipChat } from '@/lib/pip-ai/server';
import { chatRequestSchema } from '@/lib/pip-ai/schemas';
import { publicErrorMessage } from '@/lib/pip-ai/safetyRules';

const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(request: NextRequest) {
  const key = request.headers.get('x-forwarded-for') || 'local';
  const now = Date.now();
  const current = hits.get(key);

  if (!current || current.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  current.count += 1;
  return current.count > 30;
}

export async function POST(request: NextRequest) {
  if (rateLimited(request)) {
    return NextResponse.json({ message: 'Please wait a moment before sending more messages.' }, { status: 429 });
  }

  try {
    const input = chatRequestSchema.parse(await request.json());
    const result = await answerPipChat(input);
    return NextResponse.json(result);
  } catch (error) {
    console.warn('[Pip AI] Chat route failed.', error);
    return NextResponse.json(
      {
        answer: publicErrorMessage(),
        provider: 'error_fallback',
        actions: [
          { type: 'whatsapp', label: 'Continue on WhatsApp' },
          { type: 'book_call', label: 'Book Free Consultation' }
        ]
      },
      { status: 200 }
    );
  }
}
