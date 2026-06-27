import type { Metadata } from 'next';
import JsonLd from '@/app/_components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/pageMetadata';
import ContactView from './ContactView';

export const metadata: Metadata = pageMetadata('contact');

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />
      <ContactView />
    </>
  );
}
