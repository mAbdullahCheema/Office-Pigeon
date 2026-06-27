'use client';

/**
 * Client adapter for the About page (Phase 3). Reuses the existing
 * `src/views/About` component verbatim, feeding it the navigation callback
 * from the site actions context. Server-rendered to HTML, then hydrated.
 */
import About from '@/src/views/About';
import { useSite } from '../SiteChrome';

export default function AboutView() {
  const { navigate } = useSite();
  return <About onPageChange={navigate} />;
}
