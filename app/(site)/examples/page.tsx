import type { Metadata } from 'next';

import { ExamplesView } from '@/components/site/examples/ExamplesView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { getExamples } from '@/lib/site-content';
import { routes } from '@/lib/routes';
import { breadcrumbs, graph, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'Real builds and what they changed — websites, chatbots, calling agents, automations, product rollouts and Academy classes.';

export const metadata: Metadata = pageMeta({
  path: routes.examples,
  title: 'Examples',
  description,
});

const schema = graph(
  webPage({
    path: routes.examples,
    name: 'Examples — Office Pigeon',
    description,
    type: 'CollectionPage',
  }),
  breadcrumbs([{ name: 'Examples', path: routes.examples }]),
);

export default async function ExamplesPage() {
  const examples = await getExamples();

  return (
    <Shell active="examples">
      <JsonLd data={schema} />
      <ExamplesView examples={examples} />
    </Shell>
  );
}
