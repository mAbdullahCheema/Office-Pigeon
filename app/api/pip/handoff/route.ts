import { NextResponse } from 'next/server';
import { handoffRequestSchema } from '@/lib/pip-ai/schemas';
import { createPipHandoff } from '@/lib/pip-ai/server';
import { publicErrorMessage } from '@/lib/pip-ai/safetyRules';

export async function POST(request: Request) {
  try {
    const input = handoffRequestSchema.parse(await request.json());
    return NextResponse.json(await createPipHandoff(input));
  } catch (error) {
    console.warn('[Pip AI] Handoff route failed.', error);
    return NextResponse.json({ message: publicErrorMessage() }, { status: 400 });
  }
}
