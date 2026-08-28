import type { Metadata } from 'next';

import { ComingSoonView } from '@/components/site/products/ComingSoonView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { comingSoonProduct } from '@/lib/coming-soon';
import { routes } from '@/lib/routes';
import { breadcrumbs, graph, softwareApplication, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'Books that reconcile themselves, chase unpaid invoices and answer cash-flow questions in plain English. Still in build — join the list and we will show you first.';

export const metadata: Metadata = pageMeta({
  path: routes.aiFinance,
  title: 'AI Finance — coming soon',
  description,
});

const schema = graph(
  webPage({ path: routes.aiFinance, name: 'AI Finance — coming soon — Office Pigeon', description }),
  breadcrumbs([
    { name: 'Products', path: routes.products },
    { name: 'AI Finance', path: routes.aiFinance },
  ]),
  softwareApplication({
    itemId: 'ai-finance',
    name: 'AI Finance',
    description,
    path: routes.aiFinance,
    category: 'FinanceApplication',
  }),
);

export default function AiFinancePage() {
  return (
    <Shell active="products">
      <JsonLd data={schema} />
      <ComingSoonView focus={comingSoonProduct('ai-finance')!} />
    </Shell>
  );
}
