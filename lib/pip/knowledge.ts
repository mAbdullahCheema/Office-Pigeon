import 'server-only';

import { Pinecone } from '@pinecone-database/pinecone';

import { cached } from '../cache';
import { pineconeConfig } from './config';

/**
 * The knowledge Pip answers from.
 *
 * The index carries its own embedding model, so a search sends text and gets
 * text back — there is no embedding provider to key, to bill, or to keep in
 * step with whatever the index was built with.
 */

export type Passage = {
  id: string;
  score: number;
  text: string;
  heading: string;
  source: string;
};

export type Retrieval = {
  passages: Passage[];
  /**
   * True when nothing came back above the floor. The agent is told to offer a
   * human rather than answer from memory when this happens.
   */
  weak: boolean;
};

/**
 * Below this, a hit is a coincidence rather than an answer.
 *
 * Measured against the rebuilt namespace: a direct hit on a catalog entry
 * scores around 0.6, a right-but-terse one ("do you answer calls at night" onto
 * the calling agent) around 0.31, and genuine noise sits under 0.2. A higher
 * floor was tried first and sent Pip to a human for questions it could answer.
 */
const FLOOR = 0.22;
const MAX_CHARS = 1600;

let client: Pinecone | null = null;

function index() {
  const config = pineconeConfig();
  if (!config) return null;

  client ??= new Pinecone({ apiKey: config.apiKey });
  return client.index(config.index, config.host).namespace(config.namespace);
}

/** A stable cache key for a question, insensitive to spacing and case. */
function keyFor(query: string, topK: number): string {
  const normalised = query.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 120);
  return `pip:kb:${topK}:${normalised}`;
}

/**
 * Searches the knowledge base.
 *
 * Cached for a few minutes: visitors ask the same dozen questions all day, and
 * every repeat would otherwise cost a read unit and a round trip before Pip can
 * even start writing.
 */
export async function search(query: string, topK = 5): Promise<Retrieval> {
  const trimmed = query.trim();
  if (!trimmed) return { passages: [], weak: true };

  const namespace = index();
  if (!namespace) return { passages: [], weak: true };

  return cached(keyFor(trimmed, topK), 300, async () => {
    const response = await namespace.searchRecords({
      query: { topK, inputs: { text: trimmed.slice(0, 500) } },
      fields: ['text', 'heading', 'source_file', 'category'],
    });

    const passages: Passage[] = (response.result?.hits ?? [])
      .map((hit) => {
        const fields = (hit.fields ?? {}) as Record<string, unknown>;
        const text = typeof fields.text === 'string' ? fields.text : '';
        return {
          id: hit._id,
          score: hit._score ?? 0,
          // Long chunks are trimmed here rather than in the prompt, so one
          // verbose document cannot crowd out the other four.
          text: text.slice(0, MAX_CHARS),
          heading: typeof fields.heading === 'string' ? fields.heading : '',
          source: typeof fields.source_file === 'string' ? fields.source_file : '',
        };
      })
      .filter((passage) => passage.text.length > 0 && passage.score >= FLOOR);

    return { passages, weak: passages.length === 0 };
  });
}

/**
 * Renders passages for the model.
 *
 * Retrieved text is data, not instruction: it is fenced and labelled so a
 * document that happens to contain "ignore your rules" reads as a quotation
 * rather than as something addressed to Pip.
 */
export function asContext(retrieval: Retrieval): string {
  if (retrieval.passages.length === 0) {
    return 'No matching Office Pigeon knowledge was found for that question.';
  }

  return retrieval.passages
    .map((passage, position) => {
      const label = passage.heading || passage.source || passage.id;
      return `[${position + 1}] ${label}\n"""\n${passage.text}\n"""`;
    })
    .join('\n\n');
}
