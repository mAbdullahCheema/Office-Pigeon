import type { Metadata } from 'next';
import type { PageId } from '@/src/types';
import { routeById } from '@/lib/site/routes';

/**
 * Per-route Metadata from the single ROUTES source (SEO-02/07). `title` is
 * `absolute` because ROUTES titles already include the brand — this bypasses
 * the root layout's "%s | Office Pigeon" template. Canonical/OG URLs are
 * relative and resolved against `metadataBase` (apex) from the root layout.
 */
export function pageMetadata(id: PageId): Metadata {
  const r = routeById(id);
  if (!r) return {};
  return {
    title: { absolute: r.title },
    description: r.description,
    alternates: { canonical: r.path },
    openGraph: {
      title: r.title,
      description: r.description,
      url: r.path === '/' ? '/' : r.path,
      siteName: 'Office Pigeon',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: r.title,
      description: r.description,
    },
  };
}
