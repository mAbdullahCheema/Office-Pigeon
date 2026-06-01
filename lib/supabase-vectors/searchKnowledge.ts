import { PIP_AI_DEFAULTS } from '@/lib/pip-ai/constants';
import { getSupabaseAdmin, hasSupabaseAdminEnv } from '@/lib/supabase/admin';
import { embedText, hasEmbeddingEnv } from './embedding';

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
  return hasSupabaseAdminEnv() && hasEmbeddingEnv();
}

function asScore(match: any) {
  if (typeof match.score === 'number') return match.score;
  if (typeof match.similarity === 'number') return match.similarity;
  if (typeof match.distance === 'number') return Math.max(0, 1 - match.distance);
  return 1;
}

function normalizeVectorResult(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.vectors)) return data.vectors;
  if (Array.isArray(data?.matches)) return data.matches;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export async function searchKnowledge(query: string): Promise<KnowledgeMatch[]> {
  if (!hasSupabaseVectorEnv()) {
    console.warn('[Pip AI] Supabase vector search is not configured; returning empty knowledge context.');
    return [];
  }

  const requestedTopK = Number(process.env.PIP_AI_MAX_CONTEXT_CHUNKS || PIP_AI_DEFAULTS.maxContextChunks);
  const topK = Math.min(6, Math.max(4, Number.isFinite(requestedTopK) ? requestedTopK : PIP_AI_DEFAULTS.maxContextChunks));
  const { bucket: bucketName, index: indexName } = getSupabaseVectorConfig();

  try {
    const queryEmbedding = await embedText(query);
    const supabase = getSupabaseAdmin();
    const bucket = (supabase.storage as any).vectors.from(bucketName);
    const index = bucket.index(indexName);
    const { data, error } = await index.queryVectors({
      queryVector: { float32: queryEmbedding },
      topK,
      returnMetadata: true
    });

    if (error) {
      console.warn('[Pip AI] Supabase vector search failed; returning empty knowledge context.', error);
      return [];
    }

    return normalizeVectorResult(data).map((match: any) => {
      const metadata = match.metadata || {};
      return {
        id: match.key || match.id || metadata.id || 'office-pigeon-context',
        score: asScore(match),
        text: metadata.content || metadata.text || match.content || '',
        metadata: {
          source_file: metadata.source_file || metadata.source_files,
          category: metadata.category,
          heading: metadata.heading || metadata.title,
          chunk_index: typeof metadata.chunkNumber === 'string' ? Number(metadata.chunkNumber.replace('chunk-', '')) : undefined,
          priority: metadata.priority,
          service: metadata.service,
          confidence: metadata.confidence
        }
      };
    });
  } catch (error) {
    console.warn('[Pip AI] Supabase vector search failed; returning empty knowledge context.', error);
    return [];
  }
}
