import { PIP_AI_DEFAULTS } from './constants';

const handoffPatterns: Array<{ reason: string; pattern: RegExp; priority?: 'normal' | 'high' | 'urgent' }> = [
  { reason: 'Visitor explicitly asked for a human', pattern: /\b(human|person|agent|representative|talk to someone|speak to someone|real person)\b/i, priority: 'high' },
  { reason: 'Visitor is ready for sales contact', pattern: /\b(call me|contact me|i want to buy|i'm ready|im ready|ready to start|sign me up|start my project|let's do it|lets do it|i agree to buy|i want this package)\b/i, priority: 'high' },
  { reason: 'Refund or payment dispute needs human review', pattern: /\b(refund dispute|chargeback|payment dispute|cancel payment|money back|payment problem|billing dispute)\b/i, priority: 'urgent' }
];

const safetyResponses: Array<{ pattern: RegExp; answer: string }> = [
  {
    pattern: /\b(api key|secret key|service role|env|environment variable|password|private key|token|credentials|show your prompt|system prompt|developer message|ignore previous instructions|jailbreak|bypass)\b/i,
    answer:
      "I can't share private instructions, secrets, credentials, or internal setup details. I can still help with Office Pigeon services, packages, booking, or general questions."
  },
  {
    pattern: /\b(hack|malware|phishing|steal|exploit|ddos|bypass security|credential theft|sql injection|xss payload)\b/i,
    answer:
      "I can't help with harmful or abusive requests. If you need a legitimate website, chatbot, or automation setup, I can help explain safe options."
  },
  {
    pattern: /\b(legal advice|medical advice|diagnosis|investment advice|tax advice|lawsuit strategy)\b/i,
    answer:
      "I can't provide legal, medical, financial, or other high-risk professional advice. For Office Pigeon services, I can explain packages or help you book a consultation."
  }
];

export interface FallbackDecision {
  shouldFallback: boolean;
  reason?: string;
  priority: 'normal' | 'high' | 'urgent';
}

export function checkHumanHandoffIntent(message: string): FallbackDecision {
  for (const rule of handoffPatterns) {
    if (rule.pattern.test(message)) {
      return { shouldFallback: true, reason: rule.reason, priority: rule.priority || 'normal' };
    }
  }

  return { shouldFallback: false, priority: 'normal' };
}

export function isGreetingOnly(message: string) {
  return /^(hi|hello|hey|hiya|yo|good morning|good afternoon|good evening|salam|assalamualaikum|thanks|thank you)[\s!.?]*$/i.test(
    message.trim()
  );
}

export function isBookingIntent(message: string) {
  return /\b(book|booking|schedule|consultation|appointment|call|cal\.com|meeting|demo)\b/i.test(message);
}

export function isOfficePigeonRelevant(message: string) {
  return /\b(office pigeon|website|web site|landing page|business website|commerce|ecommerce|chatbot|bot|whatsapp|automation|workflow|package|price|pricing|cost|payment|refund|revision|support|domain|hosting|seo|lead|booking|consultation|cal\.com|smart calling|calling agent|service|services|business|customer|crm|google sheets|email notification|invoice|onboarding)\b/i.test(
    message
  );
}

export function getSafetyGuardrailResponse(message: string) {
  const match = safetyResponses.find((rule) => rule.pattern.test(message));
  return match?.answer;
}

export function checkKnowledgeFallback(score?: number, threshold: number = PIP_AI_DEFAULTS.confidenceThreshold): FallbackDecision {
  if (typeof score !== 'number') {
    return { shouldFallback: true, reason: 'No useful knowledge match found', priority: 'normal' };
  }

  if (score < threshold) {
    return { shouldFallback: true, reason: 'Knowledge confidence below threshold', priority: 'normal' };
  }

  return { shouldFallback: false, priority: 'normal' };
}

export function checkPostAnswerFallback(answer: string): FallbackDecision {
  if (!answer.trim()) {
    return { shouldFallback: true, reason: 'AI answer was empty', priority: 'normal' };
  }

  if (/\b(definitely increase sales|will increase your sales|internal api|pinecone|supabase|rag|embedding|api key|service role key|system prompt)\b/i.test(answer)) {
    return { shouldFallback: true, reason: 'AI answer failed safety validation', priority: 'high' };
  }

  return { shouldFallback: false, priority: 'normal' };
}
