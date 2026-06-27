import type { MetadataRoute } from 'next';
import { ROUTES, SITE_URL } from '@/lib/site/routes';

/**
 * sitemap.xml (SEO-05), generated from the single ROUTES source. Excludes the
 * geo-gated Pakistan page (pending hreflang/region decision, SEO-09) and any
 * route flagged inSitemap:false.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.filter((r) => r.inSitemap).map((r) => ({
    url: `${SITE_URL}${r.path === '/' ? '' : r.path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: r.priority ?? 0.5,
  }));
}
