import type { Metadata } from 'next';
import JsonLd from '@/app/_components/JsonLd';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/pageMetadata';
import { routeById, SITE_URL } from '@/lib/site/routes';
import { CALLING_AGENT_PACKAGES } from '@/src/config';
import CallingAgentsView from './CallingAgentsView';

export const metadata: Metadata = pageMetadata('calling-agents');

export default function CallingAgentsPage() {
  const r = routeById('calling-agents')!;
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'AI Calling Agents', path: '/calling-agents' },
          ]),
          serviceJsonLd({
            name: 'AI Calling Agents',
            description: r.description,
            url: `${SITE_URL}/calling-agents`,
            packages: CALLING_AGENT_PACKAGES,
          }),
        ]}
      />
      <CallingAgentsView />
    </>
  );
}
