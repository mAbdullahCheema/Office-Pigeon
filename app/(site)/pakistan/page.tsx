import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo/pageMetadata';
import PakistanView from './PakistanView';

/**
 * Geo-gated PK page. TODO (Phase 3): port the Express country-gate to Next
 * middleware (canAccessPakistanPage + country resolution). Until the
 * hreflang/region strategy is decided (SEO-09) it is noindex and excluded from
 * the sitemap.
 */
export const metadata: Metadata = {
  ...pageMetadata('pakistan'),
  robots: { index: false, follow: true },
};

export default function PakistanPage() {
  return <PakistanView />;
}
