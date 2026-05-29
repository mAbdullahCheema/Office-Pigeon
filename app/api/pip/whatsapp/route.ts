import { NextResponse } from 'next/server';
import { whatsappRequestSchema } from '@/lib/pip-ai/schemas';
import { buildGeneralWhatsAppMessage, buildHandoffMessage, buildWhatsAppUrl } from '@/lib/pip-ai/whatsapp';

export async function POST(request: Request) {
  const input = whatsappRequestSchema.parse(await request.json());
  const message =
    input.type === 'human_fallback'
      ? buildHandoffMessage({
          name: input.name,
          businessName: input.businessName,
          email: input.email,
          phone: input.phone,
          userQuestion: input.question,
          summary: input.summary,
          recommendedService: input.recommendedService
        })
      : buildGeneralWhatsAppMessage(input.type, input.packageName);

  return NextResponse.json({ message, url: buildWhatsAppUrl(message) });
}
