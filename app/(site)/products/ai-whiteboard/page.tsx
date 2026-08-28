import type { Metadata } from 'next';

import { ComingSoonView } from '@/components/site/products/ComingSoonView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { comingSoonProduct } from '@/lib/coming-soon';
import { routes } from '@/lib/routes';
import { breadcrumbs, graph, softwareApplication, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'A teaching canvas that draws the diagram, explains the step and saves the whole lesson for the student to replay. Still in build — tell us what you would teach on it.';

export const metadata: Metadata = pageMeta({
  path: routes.whiteboard,
  title: 'AI Whiteboard — coming soon',
  description,
});

const schema = graph(
  webPage({ path: routes.whiteboard, name: 'AI Whiteboard — coming soon — Office Pigeon', description }),
  breadcrumbs([
    { name: 'Products', path: routes.products },
    { name: 'AI Whiteboard', path: routes.whiteboard },
  ]),
  softwareApplication({
    itemId: 'ai-whiteboard',
    name: 'AI Whiteboard',
    description,
    path: routes.whiteboard,
    category: 'EducationalApplication',
  }),
);

export default function WhiteboardPage() {
  return (
    <Shell active="products">
      <JsonLd data={schema} />
      <ComingSoonView focus={comingSoonProduct('ai-whiteboard')!} />
    </Shell>
  );
}
