import type { Metadata } from 'next';

/**
 * Home — Phase 2 SSR foundation placeholder.
 *
 * A real Server Component (no "use client"): its <h1>, copy, and the metadata
 * below render in raw HTML / view-source with JS disabled. This proves the SSR
 * pipeline that fixes SEO-01. It is NOT yet wired to the live site — Phase 3
 * ports the full Home (hero/SystemDemo, sections) and per-route metadata + JSON-LD.
 */
export const metadata: Metadata = {
  title: 'AI Websites, Chatbots, Calling Agents & Automations',
  description:
    'Office Pigeon builds premium websites, smart chatbots, AI calling agents, and workflow automations that capture leads and reply instantly — so growing businesses never miss a customer.',
  alternates: { canonical: '/' },
};

const products = [
  {
    name: 'Websites',
    blurb: 'Premium, fast, conversion-focused sites that turn visitors into booked customers.',
  },
  {
    name: 'Smart Chatbots',
    blurb: 'Answer questions, qualify leads, and book jobs 24/7 on your site and WhatsApp.',
  },
  {
    name: 'AI Calling Agents',
    blurb: 'Pick up every call, handle bookings, and follow up — in a natural human voice.',
  },
  {
    name: 'Workflow Automations',
    blurb: 'Connect your tools so leads, notifications, and follow-ups happen on their own.',
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <p className="font-mono text-sm font-semibold tracking-widest text-orange-600 uppercase">
        Office Pigeon
      </p>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
        AI systems that capture leads and reply instantly — so you never miss a customer.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-gray-700">
        We build websites, smart chatbots, AI calling agents, and workflow automations
        for growing businesses. One system that answers, qualifies, books, and follows up
        around the clock.
      </p>

      <ul className="mt-12 grid gap-6 sm:grid-cols-2">
        {products.map((p) => (
          <li key={p.name} className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-bold text-gray-900">{p.name}</h2>
            <p className="mt-2 text-gray-700">{p.blurb}</p>
          </li>
        ))}
      </ul>

      <p className="mt-12 text-sm text-gray-500">
        Server-rendered with Next.js — this content is in the page source with no
        JavaScript required.
      </p>
    </main>
  );
}
