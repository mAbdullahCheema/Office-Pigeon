import { NextResponse } from 'next/server';
import { recommendPackage } from '@/lib/pip-ai/recommendPackage';
import { recommendRequestSchema } from '@/lib/pip-ai/schemas';

export async function POST(request: Request) {
  const input = recommendRequestSchema.parse(await request.json());
  return NextResponse.json(recommendPackage(`${input.needHelpWith || ''} ${input.message}`));
}
