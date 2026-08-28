import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/supabase/config';

/** Nothing behind a session, and no JSON endpoint, belongs in an index. */
const disallow = ['/dashboard', '/api'];

/**
 * The assistants that read pages to answer a question, listed by name.
 *
 * They are covered by the wildcard rule already, so naming them changes no
 * behaviour — it states the intent explicitly, which is what stops a future
 * "block the AI crawlers" edit from quietly costing the site every citation it
 * earns inside ChatGPT, Claude, Perplexity and Google's AI answers. Being the
 * source an assistant quotes is the point; the site's whole catalogue is public
 * anyway, and a blocked crawler simply answers about someone else instead.
 */
const assistants = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  'Amazonbot',
  'cohere-ai',
  'meta-externalagent',
  'DuckAssistBot',
  'YouBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      ...assistants.map((userAgent) => ({ userAgent, allow: '/', disallow })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
