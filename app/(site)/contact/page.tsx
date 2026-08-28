import type { Metadata } from 'next';

import { ContactView } from '@/components/site/contact/ContactView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { routes } from '@/lib/routes';
import { breadcrumbs, graph, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'Products, services or a class for your child — tell us what is slipping through and the right person replies, usually within a few hours.';

export const metadata: Metadata = pageMeta({
  path: routes.contact,
  title: 'Contact',
  description,
});

const schema = graph(
  webPage({
    path: routes.contact,
    name: 'Contact — Office Pigeon',
    description,
    type: 'ContactPage',
  }),
  breadcrumbs([{ name: 'Contact', path: routes.contact }]),
);

export default function ContactPage() {
  return (
    <Shell active="contact">
      <JsonLd data={schema} />
      <ContactView />
    </Shell>
  );
}
