/**
 * Rebuilds Pip's knowledge base from the live site.
 *
 *   npm run kb:index          rebuild
 *   npm run kb:index -- --dry print what would be written, touch nothing
 *
 * The database is the source of truth: prices, packages, FAQs and case studies
 * come from the same rows the pages render, so Pip cannot quote a price the
 * site does not sell. Anything already in the namespace is written to
 * `page-backups/` first, then replaced — a knowledge base with two generations
 * of contradictory copy in it is worse than an empty one.
 *
 * Pip's own behaviour rules are deliberately NOT indexed. They live in
 * `lib/pip/prompt.ts`, where they cannot be retrieved into a reply and quoted
 * back at a visitor.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Pinecone } from '@pinecone-database/pinecone';

import { legalDocs } from '../lib/legal-content';
import { contactPoints } from '../lib/routes';
import { createServiceClient } from '../lib/supabase/service';

const dry = process.argv.includes('--dry');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const apiKey = process.env.PINECONE_API_KEY ?? '';
const host = process.env.PINECONE_INDEX_HOST ?? '';
const indexName = process.env.PINECONE_INDEX ?? 'office-pigeon';
const namespaceName = process.env.PINECONE_NAMESPACE ?? 'office-pigeon-production';

if (!apiKey || !host) {
  console.error('PINECONE_API_KEY and PINECONE_INDEX_HOST are required.');
  process.exit(1);
}

const supabase = createServiceClient();
const pinecone = new Pinecone({ apiKey });
const namespace = pinecone.index(indexName, host).namespace(namespaceName);

/* ── Documents ───────────────────────────────────────────────────────── */

type Doc = {
  id: string;
  title: string;
  category: string;
  text: string;
};

/** Long documents are split on paragraphs; a chunk is never cut mid-sentence. */
const CHUNK = 1400;

function chunk(doc: Doc): Doc[] {
  if (doc.text.length <= CHUNK) return [doc];

  const parts: string[] = [];
  let current = '';

  for (const paragraph of doc.text.split(/\n{2,}/)) {
    if (current && current.length + paragraph.length > CHUNK) {
      parts.push(current.trim());
      current = '';
    }
    current += `${paragraph}\n\n`;
  }
  if (current.trim()) parts.push(current.trim());

  return parts.map((text, position) => ({
    ...doc,
    id: `${doc.id}-${position}`,
    text: `${doc.title}\n\n${text}`,
  }));
}

async function rows<T>(table: string, select = '*'): Promise<T[]> {
  const { data, error } = await supabase.from(table).select(select).limit(500);
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as T[];
}

type Item = {
  item_id: string;
  group_key: string;
  name: string;
  blurb: string | null;
  body: string | null;
  tagline: string | null;
  detail_body: string | null;
  features: unknown;
  published: boolean;
};

type Plan = { item_id: string; name: string; price: number; unit: string | null; note: string | null };
type Faq = { question: string; answer: string; category: string | null; published: boolean };
type Example = { title: string; summary: string | null; result: string | null; sector: string | null; published: boolean };
type Review = { name: string; role: string | null; quote: string; published: boolean };
type ClassRow = { title: string; subject: string | null; level: string | null; schedule: string | null; price: number | null; published: boolean };

function list(value: unknown): string {
  if (!Array.isArray(value)) return '';
  return value.filter((entry) => typeof entry === 'string').join('; ');
}

async function build(): Promise<Doc[]> {
  const [items, plans, faqs, examples, reviews, classes] = await Promise.all([
    rows<Item>('catalog_items'),
    rows<Plan>('catalog_plans'),
    rows<Faq>('faqs'),
    rows<Example>('examples'),
    rows<Review>('reviews'),
    rows<ClassRow>('academy_classes').catch(() => [] as ClassRow[]),
  ]);

  const live = items.filter((item) => item.published);
  const docs: Doc[] = [];

  /* What the company is and what it sells. */
  const groups = new Map<string, string[]>();
  for (const item of live) {
    const names = groups.get(item.group_key) ?? [];
    names.push(item.name);
    groups.set(item.group_key, names);
  }

  docs.push({
    id: 'overview',
    title: 'Office Pigeon overview',
    category: 'overview',
    text: [
      'Office Pigeon builds and runs the AI that answers calls, chats and enquiries for growing businesses, builds the websites those enquiries land on, automates the work that follows, and teaches live classes through the Office Pigeon Academy.',
      'Slogan: we automate your success.',
      [...groups.entries()].map(([group, names]) => `${group}: ${names.join(', ')}.`).join('\n'),
      'Services are live and sold today. Academy classes are live and enrolling. The four standalone products are still in build — there is no trial, no price and no release date for them yet.',
    ].join('\n\n'),
  });

  /* One document per thing that can be bought, prices included. */
  for (const item of live) {
    const mine = plans.filter((plan) => plan.item_id === item.item_id);
    const pricing = mine.length
      ? mine
          .map((plan) => `${plan.name}: $${plan.price}${plan.unit ?? ''}${plan.note ? ` — ${plan.note}` : ''}`)
          .join('\n')
      : 'Not priced yet. It is still in build, so no price, trial or release date can be given.';

    docs.push({
      id: `item-${item.item_id}`,
      title: `${item.name} (${item.group_key})`,
      category: 'catalog',
      text: [
        `${item.name} — ${item.group_key}.`,
        item.tagline ?? '',
        item.blurb ?? '',
        item.body ?? '',
        item.detail_body ?? '',
        list(item.features) ? `Includes: ${list(item.features)}` : '',
        `Pricing:\n${pricing}`,
      ]
        .filter(Boolean)
        .join('\n\n'),
    });
  }

  /* Published FAQs, one per record so a search returns the right answer whole. */
  faqs
    .filter((faq) => faq.published)
    .forEach((faq, position) => {
      docs.push({
        id: `faq-${position + 1}`,
        title: faq.question,
        category: 'faq',
        text: `Question: ${faq.question}\n\nAnswer: ${faq.answer}${faq.category ? `\n\nCategory: ${faq.category}` : ''}`,
      });
    });

  /* Case studies — what to answer with when asked "has this worked before". */
  examples
    .filter((example) => example.published)
    .forEach((example, position) => {
      docs.push({
        id: `example-${position + 1}`,
        title: example.title,
        category: 'examples',
        text: [
          example.title,
          example.sector ? `Sector: ${example.sector}` : '',
          example.summary ?? '',
          example.result ? `Result: ${example.result}` : '',
        ]
          .filter(Boolean)
          .join('\n\n'),
      });
    });

  const quotes = reviews.filter((review) => review.published);
  if (quotes.length > 0) {
    docs.push({
      id: 'reviews',
      title: 'What customers say',
      category: 'reviews',
      text: quotes
        .map((review) => `"${review.quote}" — ${review.name}${review.role ? `, ${review.role}` : ''}`)
        .join('\n\n'),
    });
  }

  const teaching = classes.filter((row) => row.published);
  if (teaching.length > 0) {
    docs.push({
      id: 'academy-classes',
      title: 'Academy classes',
      category: 'academy',
      text: teaching
        .map(
          (row) =>
            `${row.title}${row.subject ? ` — ${row.subject}` : ''}${row.level ? ` (${row.level})` : ''}${
              row.schedule ? `, ${row.schedule}` : ''
            }${row.price ? `, $${row.price}` : ''}`,
        )
        .join('\n'),
    });
  }

  docs.push({
    id: 'contact',
    title: 'Contact and booking',
    category: 'contact',
    text: [
      `Phone and WhatsApp: ${contactPoints.phone}.`,
      `Email: ${contactPoints.email}.`,
      `Free 30-minute consultation, booked at ${contactPoints.demoCall}. Pip can offer open times and book one directly in the chat.`,
      'Customers sign in at the dashboard to see their orders, invoices, payments, files and classes.',
    ].join('\n'),
  });

  /* The published legal centre — refunds, privacy, terms. */
  for (const doc of legalDocs) {
    docs.push({
      id: `legal-${doc.id}`,
      title: doc.title,
      category: 'legal',
      text: [
        `${doc.title} (updated ${doc.updated}).`,
        doc.intro,
        ...doc.sections.map((section) =>
          [section.h, ...section.ps, ...(section.list ?? []).map((entry) => `- ${entry}`)].join('\n'),
        ),
      ].join('\n\n'),
    });
  }

  return docs.flatMap(chunk);
}

/* ── Backup, replace ─────────────────────────────────────────────────── */

/** Everything currently in the namespace, so a rebuild is reversible. */
async function backup(): Promise<number> {
  const saved: Record<string, unknown>[] = [];
  let token: string | undefined;

  do {
    const page = await namespace.listPaginated({ limit: 100, paginationToken: token });
    const ids = (page.vectors ?? []).map((vector) => vector.id).filter(Boolean) as string[];
    if (ids.length > 0) {
      const fetched = await namespace.fetch({ ids });
      for (const [id, record] of Object.entries(fetched.records ?? {})) {
        saved.push({ id, metadata: record.metadata });
      }
    }
    token = page.pagination?.next;
  } while (token);

  if (saved.length === 0) return 0;

  const file = join(root, 'page-backups', `pinecone-${namespaceName}-${Date.now()}.json`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(saved, null, 2), 'utf8');
  console.log(`  backed up ${saved.length} records to ${file}`);
  return saved.length;
}

async function main() {
  console.log(`Rebuilding ${indexName}/${namespaceName}${dry ? ' (dry run)' : ''}`);

  const docs = await build();
  console.log(`  built ${docs.length} records from the live site`);

  const byCategory = new Map<string, number>();
  for (const doc of docs) byCategory.set(doc.category, (byCategory.get(doc.category) ?? 0) + 1);
  for (const [category, total] of byCategory) console.log(`    ${category}: ${total}`);

  if (dry) {
    console.log('\nFirst record:\n');
    console.log(docs[0]?.text.slice(0, 600));
    return;
  }

  await backup();

  // Replace rather than merge: a stale record left behind is a wrong answer
  // waiting to be retrieved, and there is no way to spot one from the outside.
  await namespace.deleteAll().catch(() => undefined);

  const now = new Date().toISOString();
  const records = docs.map((doc) => ({
    _id: doc.id,
    text: doc.text,
    title: doc.title,
    heading: doc.title,
    category: doc.category,
    source_file: 'live-site',
    updated_at: now,
  }));

  // The integrated embedding endpoint takes 96 records at a time.
  for (let start = 0; start < records.length; start += 90) {
    const batch = records.slice(start, start + 90);
    await namespace.upsertRecords({ records: batch });
    console.log(`  upserted ${start + batch.length}/${records.length}`);
  }

  console.log('Done. Pip now answers from the live site.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
