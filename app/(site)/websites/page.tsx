import type { Metadata } from 'next';

import { WebsitesView } from '@/components/site/services/WebsitesView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { routes } from '@/lib/routes';
import { breadcrumbs, graph, service, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'Fast, mobile-first websites built around one thing: turning a visitor into a booked job. From $500, live in a day.';

export const metadata: Metadata = pageMeta({
  path: routes.websites,
  title: 'Websites',
  description,
});

const schema = graph(
  webPage({ path: routes.websites, name: 'Websites — Office Pigeon', description }),
  breadcrumbs([{ name: 'Websites', path: routes.websites }]),
  service({
    itemId: 'website',
    name: 'Website design and build',
    description,
    path: routes.websites,
    serviceType: 'Web design and development',
  }),
);

export default function WebsitesPage() {
  return (
    <Shell active="websites">
      <JsonLd data={schema} />
      <WebsitesView />
    </Shell>
  );
}
