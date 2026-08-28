import type { Metadata } from 'next';

import { ChatbotsView } from '@/components/site/services/ChatbotsView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { routes } from '@/lib/routes';
import { breadcrumbs, graph, service, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'A chatbot trained on your prices, hours and policies — answering on your site and WhatsApp, day or night. From $300.';

export const metadata: Metadata = pageMeta({
  path: routes.chatbots,
  title: 'Chatbots',
  description,
});

const schema = graph(
  webPage({ path: routes.chatbots, name: 'Chatbots — Office Pigeon', description }),
  breadcrumbs([{ name: 'Chatbots', path: routes.chatbots }]),
  service({
    itemId: 'chatbot',
    name: 'AI chatbot build and hosting',
    description,
    path: routes.chatbots,
    serviceType: 'AI chatbot development',
  }),
);

export default function ChatbotsPage() {
  return (
    <Shell active="chatbots">
      <JsonLd data={schema} />
      <ChatbotsView />
    </Shell>
  );
}
