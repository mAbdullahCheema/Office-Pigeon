import type { Metadata } from 'next';

import { HomeView } from '@/components/site/home/HomeView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { routes } from '@/lib/routes';
import { graph, organization, webPage, website } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';
import { getCatalog, getTestimonials } from '@/lib/site-content';

export const metadata: Metadata = pageMeta({
  path: routes.home,
  title: 'Office Pigeon — AI products, done-for-you services & a global academy',
  absoluteTitle: true,
  description:
    'We build and run the AI that answers every call, reply and enquiry for you — website, chatbot, calling agent and automations. Live in 14 days, handled end to end.',
  socialTitle: 'Office Pigeon — done-for-you AI services & a global academy',
});

/**
 * The homepage is where the organization and website nodes are declared in
 * full; every other page references them by `@id` instead of restating them.
 */
const schema = graph(
  organization(),
  website(),
  webPage({
    path: routes.home,
    name: 'Office Pigeon — AI products, done-for-you services & a global academy',
    description:
      'We build and run the AI that answers every call, reply and enquiry for you — website, chatbot, calling agent and automations. Live in 14 days, handled end to end.',
  }),
);

export default async function HomePage() {
  const [entries, testimonials] = await Promise.all([getCatalog(), getTestimonials()]);

  return (
    <Shell active="home">
      <JsonLd data={schema} />
      <HomeView
        services={entries.filter((entry) => entry.group === 'Services')}
        testimonials={testimonials}
      />
    </Shell>
  );
}
