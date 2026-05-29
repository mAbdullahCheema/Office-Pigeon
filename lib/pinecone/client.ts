import { Pinecone } from '@pinecone-database/pinecone';

export function hasPineconeEnv() {
  return Boolean(process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_NAME);
}

export function getPineconeClient() {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error('Pinecone is not configured.');
  }

  return new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
}

export function getPineconeIndex() {
  const indexName = process.env.PINECONE_INDEX_NAME;
  if (!indexName) throw new Error('PINECONE_INDEX_NAME is missing.');

  const pc = getPineconeClient();
  const host = process.env.PINECONE_INDEX_HOST;
  return host ? pc.index(indexName, host) : pc.index(indexName);
}

export function pineconeNamespace() {
  return process.env.PINECONE_NAMESPACE || 'office-pigeon';
}

export function usesIntegratedEmbedding() {
  return (process.env.PINECONE_USE_INTEGRATED_EMBEDDING || 'true').toLowerCase() === 'true';
}
