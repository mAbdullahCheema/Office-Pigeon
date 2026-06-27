import type { Metadata } from 'next';
import JsonLd from '@/app/_components/JsonLd';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/pageMetadata';
import { routeById, SITE_URL } from '@/lib/site/routes';
import { CHATBOT_PACKAGES } from '@/src/config';
import ChatbotsView from './ChatbotsView';

export const metadata: Metadata = pageMetadata('chatbots');

export default function ChatbotsPage() {
  const r = routeById('chatbots')!;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Smart Chatbots', path: '/chatbots' },
          ]),
          serviceJsonLd({
            name: 'Smart Chatbots',
            description: r.description,
            url: `${SITE_URL}/chatbots`,
            packages: CHATBOT_PACKAGES,
          }),
        ]}
      />
      <ChatbotsView />
    </>
  );
}
