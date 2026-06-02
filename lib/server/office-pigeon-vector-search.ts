import { getSupabaseAdmin, hasSupabaseAdminEnv } from '@/lib/supabase/admin';
import { embedText, hasEmbeddingEnv } from '@/lib/supabase-vectors/embedding';

export interface OfficePigeonVectorSearchInput {
  query: string;
  conversation_summary?: string;
  caller_need?: string;
  caller_business_type?: string;
  caller_language?: string;
}

export interface OfficePigeonKnowledgeChunk {
  id: string;
  content: string;
  title?: string;
  category?: string;
  service?: string;
  confidence?: string;
  source_files?: string;
}

export interface OfficePigeonKnowledgeResponse {
  answer: string;
  facts: string[];
  confidence: 'high' | 'medium' | 'low';
  recommended_next_step: string;
  missing_details: string | null;
}

const SAFE_LOW_CONFIDENCE_ANSWER =
  'I do not want to guess the exact details, but Office Pigeon can usually help depending on the project scope. The best next step would be a quick free consultation so the team can recommend the right setup.';

const BUCKET_NAME = 'officepigeon';
const INDEX_NAME = process.env.SUPABASE_VECTOR_INDEX || 'officepigeon-knowledge';

function normalizeVectorResult(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.vectors)) return data.vectors;
  if (Array.isArray(data?.matches)) return data.matches;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function cleanText(value: string) {
  return value.replace(/^#+\s*/gm, '').replace(/\s+/g, ' ').trim();
}

function keywordSet(input: OfficePigeonVectorSearchInput) {
  const text = `${input.query} ${input.caller_need || ''}`.toLowerCase();
  const words = new Set((text.match(/[a-z0-9$]+/g) || []).filter((word) => word.length > 2));

  if (/\b(number|phone|twilio|own)\b/i.test(text)) {
    ['number', 'phone', 'twilio', 'existing', 'provider', 'carrier'].forEach((word) => words.add(word));
  }
  if (/\b(language|languages|multilingual|spanish|english|urdu|arabic)\b/i.test(text)) {
    ['language', 'languages', 'multilingual', 'english', 'supported'].forEach((word) => words.add(word));
  }
  if (/\b(guarantee|guaranteed|sales|leads|revenue|results)\b/i.test(text)) {
    ['guarantee', 'guaranteed', 'sales', 'leads', 'revenue', 'results', 'rankings'].forEach((word) => words.add(word));
  }

  return words;
}

function compactFact(content: string, input: OfficePigeonVectorSearchInput) {
  const text = cleanText(content);
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).filter(Boolean);
  if (/\b(language|languages|multilingual)\b/i.test(input.query)) {
    const languageSentence = sentences.find((sentence) => /\b(language|supported languages|multilingual|english)\b/i.test(sentence));
    if (languageSentence) return languageSentence.trim().slice(0, 420);
  }

  if (/\b(number|own number|existing number|twilio|carrier)\b/i.test(input.query)) {
    const numberSentence = sentences.find((sentence) => /\b(own existing number|twilio-powered number|carrier restrictions|phone provider)\b/i.test(sentence));
    if (numberSentence) return numberSentence.trim().slice(0, 420);
  }

  if (/\b(guarantee|sales|leads|revenue|results)\b/i.test(input.query)) {
    const guaranteeSentence = sentences.find((sentence) => /\b(does not guarantee|cannot guarantee|No\.|sales|leads|revenue|results)\b/i.test(sentence));
    if (guaranteeSentence) return guaranteeSentence.trim().slice(0, 420);
  }

  if (isPricingQuestion(input)) {
    const priceSentence = sentences.find((sentence) => /\b(price|starts at|fixed)\b/i.test(sentence) || /\$\d/.test(sentence));
    if (priceSentence) {
      const usageSentence = sentences.find((sentence) => /\b(includes up to|extra minutes|support:|timeline:|revision:)\b/i.test(sentence));
      return [priceSentence, usageSentence].filter(Boolean).join(' ').trim().slice(0, 420);
    }
  }

  const keywords = keywordSet(input);
  const scored = sentences.map((sentence, index) => {
    const lower = sentence.toLowerCase();
    let score = index === 0 ? 1 : 0;
    for (const word of keywords) {
      if (lower.includes(word)) score += 2;
    }
    if (/\b(price|setup|month|monthly|\$|fixed|starts at)\b/i.test(sentence) && isPricingQuestion(input)) score += 8;
    if (/\b(calling|phone|voice|twilio|number|outbound|inbound|minutes|language)\b/i.test(sentence) && isCallingAgentQuestion(input)) score += 8;
    if (/\b(no|does not|cannot)\b/i.test(sentence) && /\b(guarantee|sales|leads|revenue|results)\b/i.test(sentence)) score += 12;
    return { sentence: sentence.trim(), index, score };
  });

  const best = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence);

  return best.join(' ').trim().slice(0, 420);
}

function isPricingQuestion(input: OfficePigeonVectorSearchInput) {
  return /\b(price|pricing|cost|charge|charges|fee|fees|pay|payment|monthly|setup|how much)\b/i.test(
    `${input.query} ${input.caller_need || ''}`
  );
}

function isCallingAgentQuestion(input: OfficePigeonVectorSearchInput) {
  return /\b(calling|caller|call|calls|phone|voice|number|twilio|outbound|inbound|minutes|recording|language)\b/i.test(
    `${input.query} ${input.caller_need || ''}`
  );
}

function scoreChunk(chunk: OfficePigeonKnowledgeChunk, input: OfficePigeonVectorSearchInput, rank: number) {
  const category = chunk.category || '';
  const service = chunk.service || '';
  const content = chunk.content || '';
  const title = chunk.title || '';
  const query = input.query.toLowerCase();
  let score = 100 - rank;

  if (chunk.confidence === 'high') score += 8;
  if (/\b(AI language model|provided context|according to the documents)\b/i.test(content)) score -= 40;
  if (title && query.includes(title.toLowerCase().replace(/&/g, 'and'))) score += 35;
  if (title && title.toLowerCase().replace(/&/g, 'and').split(/\s+/).every((word) => word.length < 3 || query.includes(word))) score += 18;
  if (isPricingQuestion(input) && /\b(pricing|packages|payment|website_packages|chatbot_packages|smart_calling_agents)\b/i.test(category)) {
    score += 28;
  }
  if (isPricingQuestion(input) && /\b(price|setup|month|monthly|\$|extra minutes|payment)\b/i.test(content)) {
    score += 18;
  }
  if (isCallingAgentQuestion(input) && /calling|voice|phone|AI Calling Agents/i.test(`${category} ${service} ${content}`)) {
    score += 32;
  }
  if (/\b(number|own number|existing number|twilio|carrier)\b/i.test(input.query) && /\b(own existing number|twilio-powered number|carrier restrictions|phone provider)\b/i.test(content)) {
    score += 45;
  }
  if (/\b(language|languages|multilingual)\b/i.test(input.query) && /\b(language|supported languages|multilingual|english)\b/i.test(content)) {
    score += 35;
  }
  if (/\b(guarantee|sales|leads|revenue|results)\b/i.test(input.query) && /\b(does not guarantee|cannot guarantee|No\.|sales|leads|revenue|results)\b/i.test(content)) {
    score += 45;
  }
  if (/\b(behavior|objection|legal)\b/i.test(category) && (isPricingQuestion(input) || isCallingAgentQuestion(input))) {
    score -= 18;
  }
  if (/\bbehavior\b/i.test(category) && !/\b(pip|assistant|behavior)\b/i.test(input.query)) score -= 22;

  return score;
}

function buildSearchText(input: OfficePigeonVectorSearchInput) {
  return [
    input.query,
    input.caller_need ? `Caller need: ${input.caller_need}` : '',
    input.caller_business_type ? `Business type: ${input.caller_business_type}` : '',
    input.caller_language ? `Caller language: ${input.caller_language}` : '',
    input.conversation_summary ? `Conversation summary: ${input.conversation_summary}` : ''
  ]
    .filter(Boolean)
    .join('\n');
}

function confidenceFor(chunks: OfficePigeonKnowledgeChunk[], input: OfficePigeonVectorSearchInput): 'high' | 'medium' | 'low' {
  if (chunks.length === 0) return 'low';

  const top = chunks[0];
  const blob = `${top.category || ''} ${top.service || ''} ${top.content || ''}`;
  if (isCallingAgentQuestion(input) && /calling|voice|phone|AI Calling Agents/i.test(blob)) return 'high';
  if (isPricingQuestion(input) && /\b(price|setup|month|monthly|\$|extra minutes|payment|website_packages|chatbot_packages|smart_calling_agents)\b/i.test(blob)) {
    return 'high';
  }
  if (top.confidence === 'high') return 'high';
  if (chunks.length >= 2) return 'medium';
  return 'low';
}

function recommendedNextStep(input: OfficePigeonVectorSearchInput, confidence: 'high' | 'medium' | 'low') {
  if (confidence === 'low') return 'Offer a free consultation so the Office Pigeon team can recommend the right setup.';
  if (isPricingQuestion(input)) return 'Explain the confirmed price, then offer a free consultation for exact scope.';
  if (isCallingAgentQuestion(input)) return 'Ask about call volume, booking process, and whether the business needs inbound, outbound, or both.';
  return 'Answer briefly and offer a free consultation or WhatsApp if the caller wants to continue.';
}

function answerFromFacts(facts: string[], confidence: 'high' | 'medium' | 'low', input: OfficePigeonVectorSearchInput) {
  if (confidence === 'low' || facts.length === 0) return SAFE_LOW_CONFIDENCE_ANSWER;
  const prioritized = isPricingQuestion(input) ? facts.filter((fact) => /\$|price|setup|month|monthly|fixed|starts at/i.test(fact)) : facts;
  if (isPricingQuestion(input) && prioritized.length) return prioritized[0];
  return (prioritized.length ? prioritized : facts)[0];
}

export function hasOfficePigeonVectorSearchEnv() {
  return hasSupabaseAdminEnv() && hasEmbeddingEnv();
}

export async function searchOfficePigeonVectorChunks(input: OfficePigeonVectorSearchInput, topK = 12) {
  if (!hasOfficePigeonVectorSearchEnv()) {
    console.warn('[Office Pigeon Vector Search] Missing server-side vector search environment.');
    return [];
  }

  const embedding = await embedText(buildSearchText(input));
  const supabase = getSupabaseAdmin();
  const bucket = (supabase.storage as any).vectors.from(BUCKET_NAME);
  const index = bucket.index(INDEX_NAME);
  const { data, error } = await index.queryVectors({
    queryVector: { float32: embedding },
    topK,
    returnMetadata: true
  });

  if (error) {
    console.warn('[Office Pigeon Vector Search] Supabase vector query failed.', {
      bucket: BUCKET_NAME,
      index: INDEX_NAME,
      message: error.message
    });
    return [];
  }

  return normalizeVectorResult(data)
    .map((match: any, rank: number) => {
      const metadata = match.metadata || {};
      return {
        id: match.key || metadata.id || `office-pigeon-${rank}`,
        content: metadata.content || '',
        title: metadata.title,
        category: metadata.category,
        service: metadata.service,
        confidence: metadata.confidence,
        source_files: metadata.source_files,
        rank
      };
    })
    .filter((chunk: OfficePigeonKnowledgeChunk & { rank: number }) => chunk.content.trim())
    .sort((a: OfficePigeonKnowledgeChunk & { rank: number }, b: OfficePigeonKnowledgeChunk & { rank: number }) => {
      const aRank = scoreChunk(a, input, a.rank);
      const bRank = scoreChunk(b, input, b.rank);
      return bRank - aRank;
    })
    .map(({ rank, ...chunk }: OfficePigeonKnowledgeChunk & { rank: number }) => chunk);
}

export async function searchOfficePigeonKnowledgeForTool(input: OfficePigeonVectorSearchInput): Promise<OfficePigeonKnowledgeResponse> {
  const chunks = await searchOfficePigeonVectorChunks(input);
  const selected = chunks.slice(0, 5);
  const confidence = confidenceFor(selected, input);
  const facts = confidence === 'low' ? [] : selected.map((chunk) => compactFact(chunk.content, input)).filter(Boolean).slice(0, 5);

  return {
    answer: answerFromFacts(facts, confidence, input),
    facts,
    confidence,
    recommended_next_step: recommendedNextStep(input, confidence),
    missing_details: confidence === 'low' ? 'Exact Office Pigeon details were not confirmed by available service details.' : null
  };
}
