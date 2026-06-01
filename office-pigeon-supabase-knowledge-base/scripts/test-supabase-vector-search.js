import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const bucketName = process.env.SUPABASE_VECTOR_BUCKET || 'officepigeon';
const indexName = process.env.SUPABASE_VECTOR_INDEX || 'officepigeon-knowledge';
const embeddingModel = process.env.EMBEDDING_MODEL || 'gemini-embedding-001';

const queries = [
  'How much is the Starter Business Website?',
  'What can AI Calling Agents do?',
  'Are call recordings included?',
  'Can the AI confirm bookings automatically?',
  'What happens if I exceed included calling minutes?',
  'How do I book a free consultation?'
];

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function getEmbeddingApiKey() {
  return process.env.EMBEDDING_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
}

async function embedText(ai, text) {
  const result = await ai.models.embedContent({ model: embeddingModel, contents: text });
  const values = result.embeddings?.[0]?.values || result.embedding?.values || result.values;
  if (!values?.length) throw new Error('Embedding provider returned an empty embedding.');
  return values;
}

function normalizeResults(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.vectors)) return data.vectors;
  if (Array.isArray(data?.matches)) return data.matches;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function scoreFor(match) {
  if (typeof match.score === 'number') return match.score;
  if (typeof match.similarity === 'number') return match.similarity;
  if (typeof match.distance === 'number') return Math.max(0, 1 - match.distance);
  return 1;
}

async function main() {
  const apiKey = getEmbeddingApiKey();
  if (!apiKey) throw new Error('Embedding provider is missing EMBEDDING_API_KEY, GEMINI_API_KEY, or GOOGLE_AI_API_KEY.');

  const ai = new GoogleGenAI({ apiKey });
  const supabase = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const bucket = supabase.storage.vectors.from(bucketName);
  const index = bucket.index(indexName);

  for (const query of queries) {
    const embedding = await embedText(ai, query);
    const { data, error } = await index.queryVectors({
      queryVector: { float32: embedding },
      topK: 3,
      returnMetadata: true
    });

    if (error) throw error;

    console.log(`\nQuery: ${query}`);
    normalizeResults(data).forEach((match, i) => {
      const metadata = match.metadata || {};
      const score = scoreFor(match);
      console.log(`${i + 1}. ${metadata.title || metadata.id || match.key} (${metadata.category || 'uncategorized'}) score=${score ?? 'n/a'}`);
    });
  }
}

main().catch((error) => {
  console.error('Supabase vector search test failed:', error);
  process.exit(1);
});
