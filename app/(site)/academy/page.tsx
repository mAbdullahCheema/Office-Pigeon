import type { Metadata } from 'next';

import { AcademyView } from '@/components/site/academy/AcademyView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { routes } from '@/lib/routes';
import { breadcrumbs, educationalOrganization, graph, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'Live one-to-one and small-group tutoring on British, American, Canadian, Australian, Pakistani and GCC curricula — taught by specialist tutors in sixteen countries.';

export const metadata: Metadata = pageMeta({
  path: routes.academy,
  title: 'Academy',
  description,
});

const schema = graph(
  webPage({ path: routes.academy, name: 'Academy — Office Pigeon', description }),
  breadcrumbs([{ name: 'Academy', path: routes.academy }]),
  educationalOrganization(),
);

export default function AcademyPage() {
  return (
    <Shell active="academy">
      <JsonLd data={schema} />
      <AcademyView />
    </Shell>
  );
}
