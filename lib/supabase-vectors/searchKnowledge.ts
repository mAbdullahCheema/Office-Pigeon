import { PIP_AI_DEFAULTS } from '@/lib/pip-ai/constants';
import {
  hasOfficePigeonVectorSearchEnv,
  searchOfficePigeonVectorChunks
} from '@/lib/server/office-pigeon-vector-search';

export interface KnowledgeMatch {
  id: string;
  text: string;
  score?: number;
  metadata: {
    source_file?: string;
    category?: string;
    heading?: string;
    chunk_index?: number;
    priority?: string;
    service?: string;
    confidence?: string;
    [key: string]: unknown;
  };
}

export function getSupabaseVectorConfig() {
  return {
    bucket: process.env.SUPABASE_VECTOR_BUCKET || 'officepigeon',
    index: process.env.SUPABASE_VECTOR_INDEX || 'officepigeon-knowledge'
  };
}

export function hasSupabaseVectorEnv() {
  return hasOfficePigeonVectorSearchEnv();
}

export async function searchKnowledge(query: string): Promise<KnowledgeMatch[]> {
  if (!hasSupabaseVectorEnv()) {
    console.warn('[Pip AI] Supabase vector search is not configured; returning empty knowledge context.');
    return [];
  }

  const requestedTopK = Number(process.env.PIP_AI_MAX_CONTEXT_CHUNKS || PIP_AI_DEFAULTS.maxContextChunks);
  const topK = Math.min(6, Math.max(4, Number.isFinite(requestedTopK) ? requestedTopK : PIP_AI_DEFAULTS.maxContextChunks));

  try {
    const chunks = await searchOfficePigeonVectorChunks({ query }, topK);
    return chunks.map((chunk, index) => ({
      id: chunk.id,
      score: 1 - index * 0.01,
      text: chunk.content,
      metadata: {
        source_file: chunk.source_files,
        category: chunk.category,
        heading: chunk.title,
        service: chunk.service,
        confidence: chunk.confidence
      }
    }));
  } catch (error) {
    console.warn('[Pip AI] Supabase vector search failed; returning empty knowledge context.', error);
    return [];
  }
}
