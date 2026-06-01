import { GoogleGenAI } from '@google/genai';

export const DEFAULT_EMBEDDING_MODEL = 'gemini-embedding-001';

function getEmbeddingApiKey() {
  return process.env.EMBEDDING_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
}

export function hasEmbeddingEnv() {
  return Boolean(getEmbeddingApiKey());
}

export function getEmbeddingModel() {
  return process.env.EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;
}

export async function embedText(text: string) {
  const apiKey = getEmbeddingApiKey();
  if (!apiKey) {
    throw new Error('Embedding provider is missing EMBEDDING_API_KEY, GEMINI_API_KEY, or GOOGLE_AI_API_KEY.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const result = await ai.models.embedContent({
    model: getEmbeddingModel(),
    contents: text
  });

  const values =
    result.embeddings?.[0]?.values ||
    (result as { embedding?: { values?: number[] }; values?: number[] }).embedding?.values ||
    (result as { values?: number[] }).values;

  if (!values?.length) {
    throw new Error('Embedding provider returned an empty embedding.');
  }

  return values;
}
