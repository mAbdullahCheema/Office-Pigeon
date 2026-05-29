import { OFFICE_PIGEON } from './constants';

export function getWhatsappNumber() {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || OFFICE_PIGEON.whatsappNumber;
}

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${getWhatsappNumber()}?text=${encodeURIComponent(message)}`;
}

export function buildHandoffMessage(input: {
  name?: string | null;
  businessName?: string | null;
  email?: string | null;
  phone?: string | null;
  userQuestion?: string | null;
  summary?: string | null;
  recommendedService?: string | null;
}) {
  return `Hi Office Pigeon, I was chatting with Pip AI and need help from a human.

My details:
Name: ${input.name || 'Not provided'}
Business: ${input.businessName || 'Not provided'}
Email: ${input.email || 'Not provided'}
Phone: ${input.phone || 'Not provided'}

My question:
${input.userQuestion || 'Not provided'}

Conversation summary:
${input.summary || 'Not provided'}

Recommended service:
${input.recommendedService || 'Not sure yet'}`;
}

export function buildGeneralWhatsAppMessage(type: string, packageName?: string) {
  switch (type) {
    case 'workflow_audit':
      return 'Hi Office Pigeon, I want to book a free workflow automation audit for my business.';
    case 'website':
      return 'Hi Office Pigeon, I want help choosing the right website package for my business.';
    case 'chatbot':
      return 'Hi Office Pigeon, I want help choosing the right chatbot package for my business.';
    case 'package':
      return `Hi Office Pigeon, I am interested in ${packageName || 'one of your packages'} and would like help.`;
    case 'human_fallback':
      return 'Hi Office Pigeon, I was chatting with Pip AI and need help from a human.';
    default:
      return 'Hi Office Pigeon, I want to book a free consultation.';
  }
}
