import type { Metadata } from 'next';
import JsonLd from '@/app/_components/JsonLd';
import { serviceJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/pageMetadata';
import { routeById, SITE_URL } from '@/lib/site/routes';
import HomeView from './HomeView';

export const metadata: Metadata = pageMetadata('home');

export default function HomePage() {
  const r = routeById('home')!;
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: 'AI Business Systems',
          description: r.description,
          url: SITE_URL,
        })}
      />
      <HomeView />
    </>
  );
}
