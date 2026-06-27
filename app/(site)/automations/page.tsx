import type { Metadata } from 'next';
import JsonLd from '@/app/_components/JsonLd';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/pageMetadata';
import { routeById, SITE_URL } from '@/lib/site/routes';
import AutomationsView from './AutomationsView';

export const metadata: Metadata = pageMetadata('automations');

export default function AutomationsPage() {
  const r = routeById('automations')!;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Workflow Automations', path: '/automations' },
          ]),
          serviceJsonLd({
            name: 'Workflow Automations',
            description: r.description,
            url: `${SITE_URL}/automations`,
          }),
        ]}
      />
      <AutomationsView />
    </>
  );
}
