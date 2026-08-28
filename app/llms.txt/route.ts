import { catalog } from '@/lib/catalog';
import { coursePath, courses } from '@/lib/courses';
import { contactPoints, routes } from '@/lib/routes';
import { abs } from '@/lib/schema';

/**
 * `/llms.txt` — the site, in the form an assistant can read in one request.
 *
 * A language model answering "how much is an AI receptionist" does not crawl
 * twenty pages; it fetches whatever single document describes the site and
 * quotes from that. Handing it one page of plain text with the prices attached
 * is the difference between being quoted correctly, being quoted from a
 * two-year-old cache, and not being quoted at all.
 *
 * Everything below is generated from `lib/catalog.ts` and `lib/courses.ts` —
 * the same modules the pricing table and the course pages render from — so this
 * file cannot fall out of step with the site the way a hand-written one would.
 */

const sections = [
  { group: 'Services', heading: 'Done-for-you services', note: 'Built and run for you, month to month. Cancel any time.' },
  { group: 'Products', heading: 'Products', note: 'All four are still in build; the prices below are the planned subscriptions.' },
  { group: 'Academy', heading: 'Academy', note: 'Live online classes. The first session is free.' },
] as const;

function priceLines(group: string): string {
  return catalog
    .filter((item) => item.group === group)
    .map((item) => {
      const plans = item.plans
        .map((plan) => `${plan.name} $${plan.price} ${plan.unit} (${plan.note})`)
        .join('; ');
      return `- **${item.name}** — ${item.blurb}\n  - ${plans}`;
    })
    .join('\n');
}

function body(): string {
  return `# Office Pigeon

> Office Pigeon builds and runs the AI that answers a small business's calls, messages and enquiries — websites, chatbots, AI calling agents and automation workflows — alongside four AI products in build and an online academy teaching students in sixteen countries. Prices are published in full and billed month to month.

Contact: ${contactPoints.email} · ${contactPoints.phone} · WhatsApp ${contactPoints.whatsapp}
Book a free call: ${contactPoints.demoCall}

## How the business works

- Everything is priced in the open at ${abs(routes.pricing)}. There is no "contact us for pricing".
- Services are a one-time build fee plus a monthly fee that covers hosting, monitoring and edits.
- A typical service goes live in about 14 days; a one-page website goes live in a day.
- Orders are placed at ${abs(routes.order)}. Nothing is charged there — a person replies with a firm quote first.
- The site's own AI assistant, Pip, answers questions, quotes prices, books calls and hands over to a human when asked. Pip is available to signed-in visitors; anyone else can use the phone, WhatsApp, email or booking link above.

${sections
  .map(
    (section) => `## ${section.heading}

${section.note}

${priceLines(section.group)}`,
  )
  .join('\n\n')}

## Professional courses

${courses
  .map((course) => `- [${course.name}](${abs(coursePath(course))}) — ${course.cardBlurb}`)
  .join('\n')}

## Key pages

- [Home](${abs(routes.home)}) — what Office Pigeon does, in one page
- [Pricing](${abs(routes.pricing)}) — every price, in one table
- [Websites](${abs(routes.websites)}) — website design and build
- [Chatbots](${abs(routes.chatbots)}) — site and WhatsApp chatbots
- [AI Calling Agents](${abs(routes.callingAgents)}) — voice agents that answer and book
- [Automations](${abs(routes.automations)}) — workflow automation
- [Academy](${abs(routes.academy)}) — live tutoring, school and professional
- [Examples](${abs(routes.examples)}) — real builds and what changed
- [FAQ](${abs(routes.faq)}) — the questions asked most often
- [Contact](${abs(routes.contact)}) — how to reach a human
- [Legal](${abs(routes.legal)}) — terms, privacy and refunds

## Not part of the public site

- ${abs(routes.dashboard)} and everything under it is a signed-in customer and staff area.
- ${abs('/api')} endpoints are for the site's own pages and are rate limited.
`;
}

/**
 * Rendered once and revalidated hourly. The content is module data, so it only
 * changes on a deploy; the hour is there so a future move of the catalog into
 * Postgres does not silently pin this file to whatever the prices were at build
 * time.
 */
export const dynamic = 'force-static';
export const revalidate = 3600;

export function GET() {
  return new Response(body(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
