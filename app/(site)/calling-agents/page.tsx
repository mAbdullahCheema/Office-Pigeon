import type { Metadata } from 'next';

import { CallingAgentsView } from '@/components/site/services/CallingAgentsView';
import { Shell } from '@/components/site/Shell';
import { JsonLd } from '@/components/ui/JsonLd';
import { routes } from '@/lib/routes';
import { breadcrumbs, graph, service, webPage } from '@/lib/schema';
import { pageMeta } from '@/lib/seo';

const description =
  'A voice agent that answers on the first ring, qualifies the caller, books the job and texts you the summary. From $600.';

export const metadata: Metadata = pageMeta({
  path: routes.callingAgents,
  title: 'AI Calling Agents',
  description,
});

const schema = graph(
  webPage({ path: routes.callingAgents, name: 'AI Calling Agents — Office Pigeon', description }),
  breadcrumbs([{ name: 'AI Calling Agents', path: routes.callingAgents }]),
  service({
    itemId: 'calling-agent',
    name: 'AI calling agent build and hosting',
    description,
    path: routes.callingAgents,
    serviceType: 'AI voice agent development',
  }),
);

export default function CallingAgentsPage() {
  return (
    <Shell active="calling">
      <JsonLd data={schema} />
      <CallingAgentsView />
    </Shell>
  );
}
