import { PIP_AI_DEFAULTS } from '@/lib/pip-ai/constants';
import { getPineconeIndex, hasPineconeEnv, pineconeNamespace, usesIntegratedEmbedding } from './client';

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
    [key: string]: unknown;
  };
}

export async function searchKnowledge(query: string): Promise<KnowledgeMatch[]> {
  if (!hasPineconeEnv()) {
    console.warn('[Pip AI] Pinecone is not configured; returning empty knowledge context.');
    return [];
  }

  const requestedTopK = Number(process.env.PIP_AI_MAX_CONTEXT_CHUNKS || PIP_AI_DEFAULTS.maxContextChunks);
  const topK = Math.min(6, Math.max(4, Number.isFinite(requestedTopK) ? requestedTopK : PIP_AI_DEFAULTS.maxContextChunks));
  const index: any = getPineconeIndex().namespace(pineconeNamespace());

  if (!usesIntegratedEmbedding()) {
    console.warn('[Pip AI] Non-integrated embeddings are not configured in this project yet; returning empty context.');
    return [];
  }

  let result: any;
  try {
    result = await index.searchRecords({
      query: {
        topK,
        inputs: { text: query }
      },
      fields: ['text', 'source_file', 'category', 'heading', 'chunk_index', 'priority']
    });
  } catch (error) {
    console.warn('[Pip AI] Pinecone search failed; triggering human fallback.', error);
    return [];
  }

  const hits = result?.result?.hits || result?.matches || [];

  return hits.map((hit: any) => ({
    id: hit._id || hit.id,
    score: hit._score || hit.score,
    text: hit.fields?.text || hit.metadata?.text || '',
    metadata: {
      source_file: hit.fields?.source_file || hit.metadata?.source_file,
      category: hit.fields?.category || hit.metadata?.category,
      heading: hit.fields?.heading || hit.metadata?.heading,
      chunk_index: hit.fields?.chunk_index || hit.metadata?.chunk_index,
      priority: hit.fields?.priority || hit.metadata?.priority
    }
  }));
}
