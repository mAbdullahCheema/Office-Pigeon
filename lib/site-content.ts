import 'server-only';

import { cached, KEYS, TTL } from './cache';
import { defaultCatalog, defaultTestimonials, type CatalogContent } from './content-defaults';
import { defaultExamples, defaultFaqs, type ExampleContent, type FaqContent } from './page-content';
import { admin } from './supabase/admin';
import type {
  CatalogItemRow,
  CatalogPlanRow,
  ExampleRow,
  FaqRow,
  ReviewRow,
} from './supabase/types';

/**
 * Reads the published site content out of Supabase. Every getter falls back to
 * the shipped defaults when the table is empty or unreachable, so the site
 * renders before — and during — a re-seed.
 *
 * This module is also the naming boundary. Postgres columns are snake_case;
 * the page components speak the camelCase shapes in `content-defaults.ts` and
 * `page-content.ts`. Mapping here means a column rename never reaches a
 * component.
 *
 * Every getter is read through the shared cache. This content changes when a
 * staff member edits it and at no other time, but it is read on every render of
 * every marketing page. `purgeContent()` in the dashboard actions drops these
 * keys the moment an edit lands, so the cache never serves an edit its author
 * cannot see.
 */

async function published<T>(table: 'catalog_items' | 'examples' | 'reviews' | 'faqs'): Promise<T[]> {
  const { data, error } = await admin()
    .from(table)
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })
    .limit(200);

  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

/**
 * Backoff between attempts, in milliseconds. The delays are what decide how
 * wide a blip the retry can absorb: these cover roughly a second and a half,
 * measured against the skew windows actually seen in the dev log.
 */
const RETRY_DELAYS_MS = [150, 450, 900];

/**
 * The transient failures worth retrying rather than falling back on.
 *
 * `JWT issued at future` is the one seen in practice. This project authenticates
 * with an `sb_secret_…` key rather than a signed service-role JWT, so the token
 * PostgREST validates is minted by Supabase's own gateway — the skew is between
 * two of their nodes, not between this machine and them, and it clears on its
 * own within a second. The local system clock is not involved.
 */
function transient(message: string): boolean {
  const text = message.toLowerCase();
  return (
    text.includes('issued at future') ||
    text.includes('jwt') ||
    text.includes('fetch failed') ||
    text.includes('timeout') ||
    text.includes('econnreset')
  );
}

/**
 * Reads one content key through the cache, falling back to the shipped defaults
 * when Supabase cannot answer.
 *
 * A failure is never written to the cache. That is the point of catching out
 * here rather than inside the loader: the fallback covers the one render that
 * hit the outage, so a blip cannot pin the site to default content for the rest
 * of the five-minute TTL.
 */
async function content<T>(
  key: string,
  ttlSeconds: number,
  fallback: T,
  load: () => Promise<T>,
): Promise<T> {
  try {
    return await cached(key, ttlSeconds, async () => {
      let last: unknown;

      for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
        try {
          return await load();
        } catch (error) {
          last = error;
          const message = (error as Error).message ?? '';
          // A real error — a renamed column, a dropped table — is not going to
          // fix itself, so it fails immediately rather than after four tries.
          if (!transient(message) || attempt === RETRY_DELAYS_MS.length) throw error;
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
        }
      }

      throw last;
    });
  } catch (error) {
    console.error(`[content] ${key} unavailable:`, (error as Error).message);
    return fallback;
  }
}

export type CatalogEntry = CatalogContent;

export async function getCatalog(): Promise<CatalogEntry[]> {
  return content(KEYS.catalog, TTL.content, defaultCatalog, async () => {
    const [items, plans] = await Promise.all([
      published<CatalogItemRow>('catalog_items'),
      (async () => {
        const { data, error } = await admin()
          .from('catalog_plans')
          .select('*')
          .order('sort_order', { ascending: true })
          .limit(200);
        // Throw rather than fall through: a catalog cached without its plans is
        // a catalog priced at nothing for the next five minutes.
        if (error) throw new Error(error.message);
        return (data ?? []) as CatalogPlanRow[];
      })(),
    ]);

    if (items.length === 0) return defaultCatalog;

    return items.map((item) => ({
      itemId: item.item_id,
      group: item.group_key,
      tint: item.tint ?? '',
      icon: item.icon ?? '',
      name: item.name,
      blurb: item.blurb ?? '',
      body: item.body ?? '',
      tagline: item.tagline ?? '',
      href: item.href ?? '',
      slot: item.slot ?? '',
      photo: item.photo ?? '',
      order: item.sort_order,
      audience: item.audience ?? undefined,
      accent: item.accent ?? undefined,
      wash: item.wash ?? undefined,
      detailBody: item.detail_body ?? undefined,
      features: item.features,
      stats: item.stats,
      detailSlot: item.detail_slot ?? undefined,
      detailPhoto: item.detail_photo ?? undefined,
      page: item.page ?? undefined,
      plans: plans
        .filter((plan) => plan.item_id === item.item_id)
        .map((plan) => ({
          id: plan.plan_id,
          name: plan.name,
          price: plan.price,
          unit: plan.unit ?? '',
          note: plan.note ?? '',
        })),
    }));
  });
}

export async function getCatalogGroup(group: CatalogContent['group']): Promise<CatalogEntry[]> {
  const entries = await getCatalog();
  return entries.filter((entry) => entry.group === group);
}

export type Testimonial = {
  text: string;
  name: string;
  role: string;
  initials: string;
  tint: string;
};

export async function getTestimonials(): Promise<Testimonial[]> {
  return content(KEYS.reviews, TTL.content, defaultTestimonials, async () => {
    const rows = await published<ReviewRow>('reviews');
    if (rows.length === 0) return defaultTestimonials;

    return rows.map((row) => ({
      text: row.quote,
      name: row.name,
      role: row.role ?? '',
      initials: row.initials ?? '',
      tint: row.tint ?? '',
    }));
  });
}

export type Faq = FaqContent;

export async function getFaqs(): Promise<Faq[]> {
  return content(KEYS.faqs, TTL.content, defaultFaqs, async () => {
    const rows = await published<FaqRow>('faqs');
    if (rows.length === 0) return defaultFaqs;

    return rows.map((row) => ({
      question: row.question,
      answer: row.answer,
      category: row.category,
    }));
  });
}

export type Example = ExampleContent;

export async function getExamples(): Promise<Example[]> {
  return content(KEYS.examples, TTL.content, defaultExamples, async () => {
    const rows = await published<ExampleRow>('examples');
    if (rows.length === 0) return defaultExamples;

    return rows.map((row) => ({
      title: row.title,
      group: row.group_key,
      kind: row.kind ?? '',
      sector: row.sector ?? '',
      body: row.body ?? '',
      results: row.results,
      tint: row.tint ?? '',
      slot: row.slot ?? '',
      photo: row.photo ?? '',
    }));
  });
}

/** Free-form key/value settings the site reads at render time. */
export async function getSettings(): Promise<Record<string, string>> {
  return content(KEYS.settings, TTL.settings, {}, async () => {
    const { data, error } = await admin().from('settings').select('key, value').limit(200);
    if (error) throw new Error(error.message);
    return Object.fromEntries((data ?? []).map((row) => [row.key, row.value ?? '']));
  });
}
