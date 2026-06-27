import type { Metadata } from 'next';
import JsonLd from '@/app/_components/JsonLd';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/pageMetadata';
import { routeById, SITE_URL } from '@/lib/site/routes';
import { WEBSITE_PACKAGES } from '@/src/config';
import WebsitesView from './WebsitesView';

export const metadata: Metadata = pageMetadata('websites');

export default function WebsitesPage() {
  const r = routeById('websites')!;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Websites', path: '/websites' },
          ]),
          serviceJsonLd({
            name: 'Website Development',
            description: r.description,
            url: `${SITE_URL}/websites`,
            packages: WEBSITE_PACKAGES,
          }),
        ]}
      />
      <WebsitesView />
    </>
  );
}
