import { KnowledgeMatch } from '@/lib/supabase-vectors/searchKnowledge';

export function buildKnowledgeContext(matches: KnowledgeMatch[]) {
  if (matches.length === 0) {
    return 'No Office Pigeon knowledge context was found for this question.';
  }

  return matches
    .map((match, index) => {
      const heading = match.metadata.heading ? ` - ${match.metadata.heading}` : '';
      return `[Context ${index + 1}: ${match.metadata.source_file}${heading}]\n${match.text}`;
    })
    .join('\n\n---\n\n');
}

export function buildActionPayload(recommendedService: string, fallback = false) {
  if (fallback) {
    return [
      { type: 'whatsapp', label: 'Continue on WhatsApp' },
      { type: 'book_call', label: 'Book Free Consultation' },
      { type: 'human_handoff', label: 'Send My Details' }
    ];
  }

  const actions = [
    { type: 'book_call', label: 'Book Free Consultation' },
    { type: 'whatsapp', label: 'Continue on WhatsApp' }
  ];

  if (recommendedService === 'Free AI Consultation') {
    actions.unshift({ type: 'recommend_service', label: 'Recommend a Service' });
  }

  return actions;
}
