import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { routes } from '@/lib/routes';

/**
 * The board is closed while AI Whiteboard is in build. The canvas itself still
 * lives in `components/site/whiteboard/`; this route only stops people reaching
 * it, and sends them to the product's coming-soon page instead.
 */
export const metadata: Metadata = {
  title: 'AI Whiteboard',
  description: 'The board is closed while AI Whiteboard is in build.',
  // A redirect has nothing to index, and the destination is already in the
  // sitemap under its own URL.
  robots: { index: false, follow: true },
};

export default function WhiteboardAppPage() {
  redirect(routes.whiteboard);
}
