import { getPineconeIndex, pineconeNamespace, usesIntegratedEmbedding } from './client';

export interface KnowledgeRecord {
  id: string;
  text: string;
  metadata: Record<string, string | number | boolean>;
}

export async function upsertKnowledge(records: KnowledgeRecord[]) {
  if (!usesIntegratedEmbedding()) {
    throw new Error('PINECONE_USE_INTEGRATED_EMBEDDING must be true unless you add a custom embedding implementation.');
  }

  const index: any = getPineconeIndex().namespace(pineconeNamespace());
  const batchSize = 96;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize).map((record) => ({
      _id: record.id,
      text: record.text,
      ...record.metadata
    }));

    if (typeof index.upsertRecords === 'function') {
      await index.upsertRecords({ records: batch });
    } else {
      await index.upsert(
        batch.map((record) => ({
          id: record._id,
          values: [],
          metadata: record
        }))
      );
    }
  }

  return { count: records.length, namespace: pineconeNamespace() };
}
