import { NextResponse } from 'next/server';
import { hasSupabaseAdminEnv } from '@/lib/supabase/admin';
import { hasSupabaseVectorEnv } from '@/lib/supabase-vectors/searchKnowledge';

export async function GET() {
  return NextResponse.json({
    ok: true,
    supabase: hasSupabaseAdminEnv(),
    supabaseVectors: hasSupabaseVectorEnv(),
    llm: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      openrouter: Boolean(process.env.OPENROUTER_API_KEY),
      cerebras: Boolean(process.env.CEREBRAS_API_KEY),
      groq: Boolean(process.env.GROQ_API_KEY),
      cohere: Boolean(process.env.COHERE_API_KEY)
    }
  });
}
