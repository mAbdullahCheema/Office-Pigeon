/**
 * Writes the shipped content into an empty database.
 *
 *   npm run db:seed
 *
 * Only fills tables that are empty, so it is safe to run against a project that
 * already has content — it will simply report that there is nothing to do.
 * `lib/content-defaults.ts` and `lib/page-content.ts` are the source, which is
 * why the seeded site and the fallback the pages render are always the same.
 */

import { defaultCatalog, defaultTestimonials } from '../lib/content-defaults';
import { defaultExamples, defaultFaqs } from '../lib/page-content';
import { createServiceClient } from '../lib/supabase/service';
import type { KeyedTable } from '../lib/supabase/types';

const supabase = createServiceClient();

/** The contact details and copy the marketing pages read at render time. */
const defaultSettings = [
  { key: 'site.title', group_key: 'brand', value: 'Office Pigeon' },
  { key: 'site.slogan', group_key: 'brand', value: 'We automate your success' },
  {
    key: 'site.description',
    group_key: 'brand',
    value:
      'We build and run the AI that answers every call, reply and enquiry for your business.',
  },
  { key: 'contact.email', group_key: 'contact', value: 'help@officepigeon.com' },
  { key: 'contact.phone', group_key: 'contact', value: '' },
  { key: 'contact.whatsapp', group_key: 'contact', value: '' },
  { key: 'contact.address', group_key: 'contact', value: '' },
  { key: 'booking.days', group_key: 'booking', value: '1,2,3,4,5' },
  { key: 'booking.hours', group_key: 'booking', value: '10:00-18:00' },
  { key: 'booking.timezone', group_key: 'booking', value: 'Asia/Karachi' },
  { key: 'booking.url', group_key: 'booking', value: '' },
  { key: 'chat.assistantName', group_key: 'chat', value: 'Pip' },
  {
    key: 'chat.greeting',
    group_key: 'chat',
    value: 'Hi! I am Pip 🐦 Tell me what you need — a product, a service, or classes.',
  },
  { key: 'social.facebook', group_key: 'social', value: '' },
  { key: 'social.instagram', group_key: 'social', value: '' },
  { key: 'social.linkedin', group_key: 'social', value: '' },
];

async function seed(table: KeyedTable, rows: Record<string, unknown>[]) {
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });

  if (count) {
    console.log(`  ${table.padEnd(20)} skipped — already holds ${count} row(s)`);
    return;
  }

  const { error } = await supabase.from(table).insert(rows as never);
  if (error) console.error(`  ${table.padEnd(20)} FAILED: ${error.message}`);
  else console.log(`  ${table.padEnd(20)} ${rows.length}`);
}

async function main() {
  console.log(`Seeding ${process.env.NEXT_PUBLIC_SUPABASE_URL}\n`);

  await seed(
    'catalog_items',
    defaultCatalog.map((item, index) => ({
      item_id: item.itemId,
      group_key: item.group,
      name: item.name,
      icon: item.icon,
      tint: item.tint,
      blurb: item.blurb,
      body: item.body,
      tagline: item.tagline,
      href: item.href,
      slot: item.slot,
      photo: item.photo,
      audience: item.audience ?? null,
      accent: item.accent ?? null,
      wash: item.wash ?? null,
      detail_body: item.detailBody ?? null,
      features: item.features ?? [],
      stats: item.stats ?? [],
      detail_slot: item.detailSlot ?? null,
      detail_photo: item.detailPhoto ?? null,
      page: item.page ?? null,
      sort_order: item.order ?? index,
      published: true,
    })),
  );

  // Plans reference their item, so they can only land once the items have.
  await seed(
    'catalog_plans',
    defaultCatalog.flatMap((item) =>
      item.plans.map((plan, index) => ({
        plan_id: plan.id,
        item_id: item.itemId,
        name: plan.name,
        price: plan.price,
        unit: plan.unit,
        note: plan.note,
        sort_order: index,
      })),
    ),
  );

  await seed(
    'examples',
    defaultExamples.map((example, index) => ({
      title: example.title,
      group_key: example.group,
      kind: example.kind,
      sector: example.sector,
      body: example.body,
      results: example.results,
      tint: example.tint,
      slot: example.slot,
      photo: example.photo,
      sort_order: index,
      published: true,
    })),
  );

  await seed(
    'reviews',
    defaultTestimonials.map((review, index) => ({
      quote: review.text,
      name: review.name,
      role: review.role,
      initials: review.initials,
      tint: review.tint,
      sort_order: index,
      published: true,
    })),
  );

  await seed(
    'faqs',
    defaultFaqs.map((faq, index) => ({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sort_order: index,
      published: true,
    })),
  );

  await seed('settings', defaultSettings);

  console.log('\nDone.');
}

main().catch((error) => {
  console.error('\nSeed failed:', error);
  process.exit(1);
});
