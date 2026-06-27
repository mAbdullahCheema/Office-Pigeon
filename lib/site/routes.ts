import type { PageId } from '@/src/types';

/**
 * Single source of truth for site routes + per-page SEO metadata (Phase 3).
 *
 * Used by Next `app/` (sitemap, per-route generateMetadata, the chrome's
 * pathname→page mapping). Mirrors — and is migrating away from — the maps in
 * `src/App.tsx` (the legacy SPA router). PageId stays imported from
 * `src/types` so the union is single-sourced.
 */
export const SITE_URL = 'https://officepigeon.com';

export interface RouteDef {
  id: PageId;
  path: string;
  /** <title> — kept aligned with src/App.tsx PAGE_TITLES. */
  title: string;
  /** Unique meta description per page (SEO-02). */
  description: string;
  /** Include in sitemap.xml (false for noindex-ish/legal-thin pages we still keep). */
  inSitemap: boolean;
  priority?: number;
}

export const ROUTES: RouteDef[] = [
  {
    id: 'home',
    path: '/',
    title: 'Office Pigeon | AI Websites, Chatbots, Calling Agents & Automations',
    description:
      'Office Pigeon builds premium websites, smart chatbots, AI calling agents, and workflow automations that capture leads and reply instantly — so growing businesses never miss a customer.',
    inSitemap: true,
    priority: 1,
  },
  {
    id: 'websites',
    path: '/websites',
    title: 'Website Development for Growing Businesses | Office Pigeon',
    description:
      'Premium, fast, conversion-focused websites for growing businesses — responsive design, lead capture, and WhatsApp booking. Starter sites from $500, fully managed.',
    inSitemap: true,
    priority: 0.9,
  },
  {
    id: 'chatbots',
    path: '/chatbots',
    title: 'Smart Chatbots for Websites & WhatsApp | Office Pigeon',
    description:
      'Smart AI chatbots that answer questions, qualify leads, and book jobs 24/7 across your website and WhatsApp. FAQ, lead & booking, and full assistant tiers.',
    inSitemap: true,
    priority: 0.9,
  },
  {
    id: 'calling-agents',
    path: '/calling-agents',
    title: 'AI Calling Agents for Businesses | Office Pigeon',
    description:
      'AI calling agents that answer every call in a natural voice, capture leads, collect booking requests, and follow up — inbound and approved outbound, fully managed.',
    inSitemap: true,
    priority: 0.9,
  },
  {
    id: 'automations',
    path: '/automations',
    title: 'Workflow Automation for Growing Businesses | Office Pigeon',
    description:
      'Workflow automations that connect your tools so leads, reminders, follow-ups, and CRM/sheet syncing happen on their own — no manual copy-pasting.',
    inSitemap: true,
    priority: 0.9,
  },
  {
    id: 'examples',
    path: '/examples',
    title: 'Previews and Case Studies | Office Pigeon',
    description:
      'See example website builds and case studies across auto repair, beauty, cleaning, fitness, and real estate — the kind of systems Office Pigeon ships.',
    inSitemap: true,
    priority: 0.7,
  },
  {
    id: 'about',
    path: '/about',
    title: 'About Office Pigeon | AI Business Systems',
    description:
      'Office Pigeon helps businesses look credible, reply faster, and run with less manual effort using AI websites, chatbots, calling agents, and automations.',
    inSitemap: true,
    priority: 0.6,
  },
  {
    id: 'contact',
    path: '/contact',
    title: 'Contact Office Pigeon | Free AI Consultation',
    description:
      'Talk to Office Pigeon about your website, chatbot, AI calling agent, or automation. Book a free strategic consultation and get a clear plan for your business.',
    inSitemap: true,
    priority: 0.8,
  },
  {
    id: 'faq',
    path: '/faq',
    title: 'FAQ | Office Pigeon',
    description:
      'Answers about Office Pigeon pricing, packages, chatbot message limits, AI calling minutes, payments, refunds, and how our AI business systems work.',
    inSitemap: true,
    priority: 0.6,
  },
  {
    id: 'pakistan',
    path: '/pakistan',
    title: 'Office Pigeon Pakistan | Websites, Chatbots & AI Calling Agents',
    description:
      'Office Pigeon Pakistan builds professional websites, smart chatbots, WhatsApp inquiry systems, and AI calling agents for faster customer response and better lead capture.',
    // Geo-gated (PK-only); kept out of the global sitemap pending hreflang/region decision (SEO-09).
    inSitemap: false,
  },
  {
    id: 'privacy',
    path: '/privacy',
    title: 'Privacy Policy | Office Pigeon',
    description: 'How Office Pigeon collects, uses, and protects your information.',
    inSitemap: true,
    priority: 0.2,
  },
  {
    id: 'terms',
    path: '/terms',
    title: 'Terms of Service | Office Pigeon',
    description: 'The terms governing use of Office Pigeon services and website.',
    inSitemap: true,
    priority: 0.2,
  },
  {
    id: 'refund',
    path: '/refund',
    title: 'Refund Policy | Office Pigeon',
    description: 'Office Pigeon refund policy for custom design, engineering, and managed services.',
    inSitemap: true,
    priority: 0.2,
  },
  {
    id: 'fair-usage',
    path: '/fair-usage',
    title: 'Fair Usage Policy | Office Pigeon',
    description: 'Office Pigeon fair usage policy for messages, call minutes, and managed services.',
    inSitemap: true,
    priority: 0.2,
  },
];

const ROUTE_BY_ID = new Map<PageId, RouteDef>(ROUTES.map((r) => [r.id, r]));
const ROUTE_BY_PATH = new Map<string, RouteDef>(ROUTES.map((r) => [r.path, r]));

export function routeById(id: PageId): RouteDef | undefined {
  return ROUTE_BY_ID.get(id);
}

export function pathForPage(id: PageId): string {
  return ROUTE_BY_ID.get(id)?.path ?? '/';
}

export function pageFromPath(pathname: string): PageId {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return ROUTE_BY_PATH.get(normalized)?.id ?? 'home';
}
