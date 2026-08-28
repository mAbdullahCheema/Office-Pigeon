import type { Metadata } from 'next';

import { PricingView } from '@/components/site/pricing/PricingView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { routes } from '@/lib/routes';
import { breadcrumbs, graph, offerCatalog, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'Flat prices, month-to-month. Service bundles, product subscriptions and Academy classes, priced in the open.';

export const metadata: Metadata = pageMeta({
  path: routes.pricing,
  title: 'Pricing',
  description,
});

const schema = graph(
  webPage({ path: routes.pricing, name: 'Pricing — Office Pigeon', description }),
  breadcrumbs([{ name: 'Pricing', path: routes.pricing }]),
  offerCatalog(),
);

export default function PricingPage() {
  return (
    <Shell active="pricing">
      <JsonLd data={schema} />
      <PricingView />
    </Shell>
  );
}
