import type { Metadata } from 'next';

import { ComingSoonView } from '@/components/site/products/ComingSoonView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { comingSoonProduct } from '@/lib/coming-soon';
import { routes } from '@/lib/routes';
import { breadcrumbs, graph, softwareApplication, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'Admissions, attendance, fees, timetables and report cards in one system, with the parent messaging attached. Still in build — tell us what your school needs and we will build toward it.';

export const metadata: Metadata = pageMeta({
  path: routes.smartSchool,
  title: 'Smart School OS — coming soon',
  description,
});

const schema = graph(
  webPage({ path: routes.smartSchool, name: 'Smart School OS — coming soon — Office Pigeon', description }),
  breadcrumbs([
    { name: 'Products', path: routes.products },
    { name: 'Smart School OS', path: routes.smartSchool },
  ]),
  softwareApplication({
    itemId: 'smart-school-os',
    name: 'Smart School OS',
    description,
    path: routes.smartSchool,
    category: 'EducationalApplication',
  }),
);

export default function SmartSchoolPage() {
  return (
    <Shell active="products">
      <JsonLd data={schema} />
      <ComingSoonView focus={comingSoonProduct('smart-school-os')!} />
    </Shell>
  );
}
