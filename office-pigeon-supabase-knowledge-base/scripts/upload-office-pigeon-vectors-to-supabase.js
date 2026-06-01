import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(scriptDir, '..');
const chunksPath = path.join(outputDir, 'supabase-vector-chunks.jsonl');
const reportPath = path.join(outputDir, 'supabase-vector-upload-report.md');

const bucketName = process.env.SUPABASE_VECTOR_BUCKET || 'officepigeon';
const indexName = process.env.SUPABASE_VECTOR_INDEX || 'officepigeon-knowledge';
const embeddingModel = process.env.EMBEDDING_MODEL || 'gemini-embedding-001';

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

function parseJsonl(input) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function vectorBuckets(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.vectorBuckets)) return data.vectorBuckets;
  if (Array.isArray(data?.buckets)) return data.buckets;
  return [];
}

function vectorIndexes(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.indexes)) return data.indexes;
  return [];
}

async function ensureBucket(supabase) {
  const vectors = supabase.storage.vectors;
  if (!vectors) {
    throw new Error('Supabase Vector Buckets API is not available in the installed Supabase client.');
  }

  const { data, error } = await vectors.listBuckets();
  if (error) throw error;

  const exists = vectorBuckets(data).some((bucket) => {
    const name = bucket.vectorBucketName || bucket.name || bucket.id;
    return name === bucketName;
  });

  if (!exists) {
    const created = await vectors.createBucket(bucketName);
    if (created.error) throw created.error;
  }

  return vectors.from(bucketName);
}

async function ensureIndex(bucket, dimension) {
  const { data, error } = await bucket.listIndexes();
  if (error) throw error;

  const existing = vectorIndexes(data).find((index) => {
    const name = index.indexName || index.name;
    return name === indexName;
  });

  const existingDimension = existing?.dimension || existing?.dimensions;
  if (existing && existingDimension && Number(existingDimension) !== dimension) {
    throw new Error(`Existing Supabase vector index ${indexName} has dimension ${existingDimension}, but embeddings are ${dimension}.`);
  }

  if (!existing) {
    const created = await bucket.createIndex({
      indexName,
      dataType: 'float32',
      dimension,
      distanceMetric: 'cosine'
    });
    if (created.error) throw created.error;
  }

  return bucket.index(indexName);
}

async function clearExistingVectors(index) {
  const { data, error } = await index.listVectors({});
  if (error) throw error;

  const keys = (Array.isArray(data?.vectors) ? data.vectors : [])
    .map((vector) => vector.key)
    .filter(Boolean);

  for (let i = 0; i < keys.length; i += 100) {
    const deleted = await index.deleteVectors({ keys: keys.slice(i, i + 100) });
    if (deleted.error) throw deleted.error;
  }
}

async function writeReport(input) {
  const projectHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).host : 'not configured';
  const failures = input.failures.length
    ? input.failures.map((failure) => `- ${failure.id}: ${failure.error}`).join('\n')
    : '- None';

  const report = `# Supabase Vector Upload Report

Status: ${input.failures.length ? 'completed with failures' : 'success'}

- Uploaded at: ${new Date().toISOString()}
- Supabase project host: \`${projectHost}\`
- Vector bucket: \`${bucketName}\`
- Vector index: \`${indexName}\`
- Embedding model: \`${embeddingModel}\`
- Embedding dimension: ${input.dimension}
- Chunks read: ${input.total}
- Vectors uploaded: ${input.uploaded}
- Failed chunks: ${input.failures.length}

## Failures

${failures}
`;

  await fs.writeFile(reportPath, report, 'utf8');
}

export async function indexKnowledge() {
  const supabaseUrl = requiredEnv('SUPABASE_URL');
  const serviceRoleKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  const embeddingApiKey = getEmbeddingApiKey();
  if (!embeddingApiKey) {
    throw new Error('Embedding provider is missing EMBEDDING_API_KEY, GEMINI_API_KEY, or GOOGLE_AI_API_KEY.');
  }

  const chunks = parseJsonl(await fs.readFile(chunksPath, 'utf8'));
  if (!chunks.length) throw new Error('No vector chunks found. Run the generator first.');

  const ai = new GoogleGenAI({ apiKey: embeddingApiKey });
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const sampleEmbedding = await embedText(ai, chunks[0].content);
  const dimension = sampleEmbedding.length;
  const bucket = await ensureBucket(supabase);
  const index = await ensureIndex(bucket, dimension);
  await clearExistingVectors(index);

  let uploaded = 0;
  const failures = [];
  const batchSize = 24;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const slice = chunks.slice(i, i + batchSize);
    const vectors = [];

    for (let offset = 0; offset < slice.length; offset += 1) {
      const chunk = slice[offset];
      try {
        const embedding = i === 0 && offset === 0 ? sampleEmbedding : await embedText(ai, chunk.content);
        vectors.push({
          key: chunk.id,
          data: { float32: embedding },
          metadata: {
            id: chunk.id,
            title: chunk.title,
            category: chunk.category,
            service: chunk.service,
            audience: chunk.audience,
            content: chunk.content,
            source_files: chunk.source_files.join(', '),
            confidence: chunk.confidence,
            chunkNumber: `chunk-${chunk.chunk_index}`,
            sectionNumber: `section-${chunk.section_index}`,
            updated_at: chunk.updated_at,
            brand: 'Office Pigeon'
          }
        });
      } catch (error) {
        failures.push({ id: chunk.id, error: error instanceof Error ? error.message : String(error) });
      }
    }

    if (vectors.length) {
      const result = await index.putVectors({ vectors });
      if (result.error) {
        for (const vector of vectors) {
          const retry = await index.putVectors({ vectors: [vector] });
          if (retry.error) {
            failures.push({ id: vector.key, error: retry.error.message || String(retry.error) });
          } else {
            uploaded += 1;
          }
        }
      } else {
        uploaded += vectors.length;
      }
    }
  }

  await writeReport({ dimension, total: chunks.length, uploaded, failures });

  if (failures.length) {
    throw new Error(`Uploaded ${uploaded}/${chunks.length} vectors, but ${failures.length} chunks failed. See ${reportPath}.`);
  }

  return { bucket: bucketName, index: indexName, chunkCount: chunks.length, uploaded, dimension };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  indexKnowledge()
    .then((result) => {
      console.log(`Uploaded ${result.uploaded} vectors to ${result.bucket}/${result.index}.`);
    })
    .catch((error) => {
      console.error('Supabase vector upload failed:', error);
      process.exit(1);
    });
}
