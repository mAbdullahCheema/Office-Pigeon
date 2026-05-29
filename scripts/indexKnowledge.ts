import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { upsertKnowledge, KnowledgeRecord } from '@/lib/pinecone/upsertKnowledge';
import { hasSupabaseAdminEnv, getSupabaseAdmin } from '@/lib/supabase/admin';
import { pineconeNamespace } from '@/lib/pinecone/client';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const knowledgeDir = path.join(root, 'knowledge');

function categoryFromFile(file: string) {
  return file.replace(/\.md$/, '').replace(/-/g, '_');
}

function headingForChunk(chunk: string) {
  const heading = chunk.split('\n').find((line) => line.startsWith('#'));
  return heading?.replace(/^#+\s*/, '').trim() || 'Office Pigeon Knowledge';
}

function chunkMarkdown(markdown: string) {
  const words = markdown.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  const size = 520;
  const overlap = 75;

  for (let i = 0; i < words.length; i += size - overlap) {
    chunks.push(words.slice(i, i + size).join(' '));
  }

  return chunks;
}

export async function indexKnowledge() {
  const files = (await fs.readdir(knowledgeDir)).filter((file) => file.endsWith('.md')).sort();
  const records: KnowledgeRecord[] = [];
  const now = new Date().toISOString();

  for (const file of files) {
    const markdown = await fs.readFile(path.join(knowledgeDir, file), 'utf8');
    const chunks = chunkMarkdown(markdown);
    chunks.forEach((text, index) => {
      records.push({
        id: `${file.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${index}`,
        text,
        metadata: {
          source_file: file,
          category: categoryFromFile(file),
          heading: headingForChunk(text),
          chunk_index: index,
          updated_at: now,
          priority: /packages|pricing|faq|behavior/.test(file) ? 'high' : 'normal'
        }
      });
    });
  }

  let status = 'success';
  let errorMessage: string | null = null;

  try {
    await upsertKnowledge(records);
  } catch (error) {
    status = 'error';
    errorMessage = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    if (hasSupabaseAdminEnv()) {
      await getSupabaseAdmin().from('pip_ai_knowledge_index_log').insert({
        namespace: pineconeNamespace(),
        chunk_count: records.length,
        status,
        error_message: errorMessage
      });
    }
  }

  return { namespace: pineconeNamespace(), chunkCount: records.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  indexKnowledge()
    .then((result) => {
      console.log(`Indexed ${result.chunkCount} chunks into namespace ${result.namespace}.`);
    })
    .catch((error) => {
      console.error('Knowledge indexing failed:', error);
      process.exit(1);
    });
}
