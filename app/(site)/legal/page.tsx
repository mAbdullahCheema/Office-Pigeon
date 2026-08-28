import type { Metadata } from 'next';

import { LegalView } from '@/components/site/legal/LegalView';
import { Shell } from '@/components/site/Shell';
import { routes } from '@/lib/routes';
import { pageMeta } from '@/lib/seo';

export const metadata: Metadata = pageMeta({
  path: routes.legal,
  title: 'Legal',
  description:
    'Privacy policy, terms of service and refunds, cookie policy, data processing agreement and accessibility statement.',
});

export default function LegalPage() {
  return (
    <Shell active="contact" blobs>
      <LegalView />
    </Shell>
  );
}
