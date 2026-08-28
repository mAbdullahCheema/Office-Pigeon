import type { Metadata } from 'next';

import { ComingSoonView } from '@/components/site/products/ComingSoonView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { routes } from '@/lib/routes';
import { breadcrumbs, graph, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'Smart School OS, AI Finance, AI Whiteboard and AI Recipes are all still in build. Our done-for-you services — websites, chatbots, calling agents and automations — are open today.';

export const metadata: Metadata = pageMeta({
  path: routes.products,
  title: 'Products — coming soon',
  description,
});

const schema = graph(
  webPage({
    path: routes.products,
    name: 'Products — Office Pigeon',
    description,
    type: 'CollectionPage',
  }),
  breadcrumbs([{ name: 'Products', path: routes.products }]),
);

export default function ProductsPage() {
  return (
    <Shell active="products">
      <JsonLd data={schema} />
      <ComingSoonView />
    </Shell>
  );
}
