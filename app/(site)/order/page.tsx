import type { Metadata } from 'next';

import { OrderView } from '@/components/site/order/OrderView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { routes } from '@/lib/routes';
import { breadcrumbs, graph, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';
import { getCatalog } from '@/lib/site-content';

const description =
  'Tell us what you need and a real person replies with a firm quote — usually within a few hours. Nothing is charged here.';

export const metadata: Metadata = pageMeta({
  path: routes.order,
  title: 'Place an order',
  description,
});

const schema = graph(
  webPage({ path: routes.order, name: 'Place an order — Office Pigeon', description }),
  breadcrumbs([{ name: 'Place an order', path: routes.order }]),
);

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string; plan?: string }>;
}) {
  const [catalog, params] = await Promise.all([getCatalog(), searchParams]);

  // Products are still in build, so they are not orderable. Dropping them here
  // also drops any `?item=` deep link into one — the flow just opens on step 0.
  const orderable = catalog.filter((entry) => entry.group !== 'Products');

  return (
    <Shell active="order">
      <JsonLd data={schema} />
      <OrderView catalog={orderable} preselect={{ item: params.item, plan: params.plan }} />
    </Shell>
  );
}
