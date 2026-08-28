import type { Metadata } from 'next';

import { AutomationsView } from '@/components/site/services/AutomationsView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { routes } from '@/lib/routes';
import { breadcrumbs, graph, service, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'Workflows that chase quotes, send reminders, ask for reviews and keep your CRM honest — from $100 per workflow.';

export const metadata: Metadata = pageMeta({
  path: routes.automations,
  title: 'Automations',
  description,
});

const schema = graph(
  webPage({ path: routes.automations, name: 'Automations — Office Pigeon', description }),
  breadcrumbs([{ name: 'Automations', path: routes.automations }]),
  service({
    itemId: 'automation',
    name: 'Business automation workflows',
    description,
    path: routes.automations,
    serviceType: 'Business process automation',
  }),
);

export default function AutomationsPage() {
  return (
    <Shell active="automations">
      <JsonLd data={schema} />
      <AutomationsView />
    </Shell>
  );
}
