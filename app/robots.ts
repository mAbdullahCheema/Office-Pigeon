import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site/routes';

/**
 * robots.txt (SEO-05). Allow crawling, but keep free-preview hosting and the
 * admin manager out of the index (these were noindex on the Express side too).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/previews/', '/admin'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
