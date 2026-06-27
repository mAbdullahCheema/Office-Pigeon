import type { Metadata } from 'next';
import JsonLd from '@/app/_components/JsonLd';
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/pageMetadata';
import { GENERAL_FAQS } from '@/src/config';
import FAQView from './FAQView';

export const metadata: Metadata = pageMetadata('faq');

export default function FAQPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
          faqPageJsonLd(GENERAL_FAQS),
        ]}
      />
      <FAQView />
    </>
  );
}
