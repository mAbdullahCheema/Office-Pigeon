import type { Metadata } from 'next';
import JsonLd from '@/app/_components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/pageMetadata';
import ExamplesView from './ExamplesView';

export const metadata: Metadata = pageMetadata('examples');

export default function ExamplesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Previews', path: '/examples' },
        ])}
      />
      <ExamplesView />
    </>
  );
}
