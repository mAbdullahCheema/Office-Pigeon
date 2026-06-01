import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { searchOfficePigeonKnowledgeForTool } from '@/lib/server/office-pigeon-vector-search';

const hits = new Map<string, { count: number; resetAt: number }>();

const requestSchema = z.object({
  query: z.string().trim().min(1).max(1000),
  conversation_summary: z.string().trim().max(2000).optional(),
  caller_need: z.string().trim().max(500).optional(),
  caller_business_type: z.string().trim().max(200).optional(),
  caller_language: z.string().trim().max(100).optional()
});

function authorized(request: NextRequest) {
  const secret = process.env.ELEVENLABS_TOOL_SECRET;
  const supplied = request.headers.get('x-elevenlabs-tool-secret');
  return Boolean(secret && supplied && supplied === secret);
}

function rateLimited(request: NextRequest) {
  const key = request.headers.get('x-forwarded-for') || 'elevenlabs-local';
  const now = Date.now();
  const current = hits.get(key);

  if (!current || current.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  current.count += 1;
  return current.count > 60;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (rateLimited(request)) {
    return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
  }

  try {
    const input = requestSchema.parse(await request.json());
    const result = await searchOfficePigeonKnowledgeForTool(input);
    console.info('[ElevenLabs Tool] Office Pigeon knowledge search completed.', {
      query_length: input.query.length,
      caller_need_present: Boolean(input.caller_need),
      confidence: result.confidence
    });
    return NextResponse.json(result);
  } catch (error) {
    console.warn('[ElevenLabs Tool] Office Pigeon knowledge search failed.', {
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      {
        answer:
          'I do not want to guess the exact details, but Office Pigeon can usually help depending on the project scope. The best next step would be a quick free consultation so the team can recommend the right setup.',
        facts: [],
        confidence: 'low',
        recommended_next_step: 'Offer a free consultation so the Office Pigeon team can recommend the right setup.',
        missing_details: 'The request could not be answered safely from confirmed Office Pigeon knowledge.'
      },
      { status: 200 }
    );
  }
}
