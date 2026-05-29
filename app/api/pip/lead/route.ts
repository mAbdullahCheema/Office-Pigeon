import { NextRequest, NextResponse } from 'next/server';
import { leadSchema } from '@/lib/pip-ai/schemas';
import { savePipLead } from '@/lib/pip-ai/server';
import { publicErrorMessage } from '@/lib/pip-ai/safetyRules';

export async function POST(request: NextRequest) {
  try {
    const input = leadSchema.parse(await request.json());
    const result = await savePipLead(input, {
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer')
    });
    return NextResponse.json(result);
  } catch (error) {
    console.warn('[Pip AI] Lead route failed.', error);
    return NextResponse.json({ message: publicErrorMessage() }, { status: 400 });
  }
}
