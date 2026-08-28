import { Fx } from '@/components/ui/Fx';
import { appFor } from '@/lib/catalog';
import type { CatalogEntry } from '@/lib/site-content';

import { ProductPage } from './ProductPage';

const app = appFor('finance')!;

const feed = [
  { icon: '🏦', name: 'Meezan · card settlement', match: 'Matched to INV-2041', amount: '+$4,280', color: '#0F9C6E' },
  { icon: '🧾', name: 'Shell fuel · 14 receipts', match: 'Categorised: Vehicles', amount: '−$1,146', color: '#E8480F' },
  { icon: '👥', name: 'Payroll · 6 staff', match: 'Scheduled Aug 28', amount: '−$9,400', color: '#E8480F' },
];

function HeroCard() {
  return (
    <Fx s="background:#fff;border-radius:38px;padding:20px;box-shadow:0 26px 54px rgba(196,120,74,.2), inset 0 2px 4px rgba(255,255,255,.95);animation:pop .9s cubic-bezier(.34,1.4,.64,1) .1s both">
      <Fx s="display:flex;align-items:center;gap:10px">
        <Fx as="span" s="width:9px;height:9px;border-radius:50%;background:#0F9C6E;animation:glow 2s ease-in-out infinite" />
        <Fx
          as="span"
          s="font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(36,26,22,.45)"
        >
          Reconciled 4:02 AM
        </Fx>
      </Fx>
      <Fx s="display:grid;grid-template-columns:repeat(auto-fit, minmax(min(140px, 100%), 1fr));gap:10px;margin-top:16px">
        <Fx s="background:#E9FBF3;border-radius:22px;padding:16px 18px">
          <Fx s="font-size:11.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(36,26,22,.5)">
            Cash on hand
          </Fx>
          <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:30px;margin-top:6px;color:#0B7B57">
            $84,120
          </Fx>
        </Fx>
        <Fx s="background:#FFF4D8;border-radius:22px;padding:16px 18px">
          <Fx s="font-size:11.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(36,26,22,.5)">
            Owed to you
          </Fx>
          <Fx s="font-family:var(--font-bricolage),system-ui,sans-serif;font-weight:800;font-size:30px;margin-top:6px;color:#96690A">
            $19,480
          </Fx>
        </Fx>
      </Fx>
      <Fx s="background:#FFF6F1;border-radius:24px;padding:18px 20px;margin-top:10px">
        <Fx s="font-size:13px;font-weight:700;color:rgba(36,26,22,.55)">You asked</Fx>
        <Fx s="font-size:15.5px;font-weight:700;margin-top:6px">Can I afford a second van in March?</Fx>
        <Fx s="height:1px;background:#F3E3D8;margin:14px 0" />
        <Fx s="font-size:14.5px;line-height:1.6;color:rgba(36,26,22,.72)">
          Yes — up to <strong>$34,000</strong> financed over 3 years. March closes at $61k after payroll and the GST
          payment, leaving 2.4 months of cover.
        </Fx>
      </Fx>
      <Fx s="display:flex;flex-direction:column;gap:8px;margin-top:10px">
        {feed.map((row) => (
          <Fx key={row.name} s="display:flex;align-items:center;gap:12px;background:#FFF6F1;border-radius:18px;padding:12px 16px">
            <Fx
              as="span"
              s="width:30px;height:30px;flex:none;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:13px"
            >
              {row.icon}
            </Fx>
            <Fx as="span" s="flex:1;min-width:0;line-height:1.35">
              <Fx as="span" s="display:block;font-weight:700;font-size:13.5px">
                {row.name}
              </Fx>
              <Fx as="span" s="display:block;font-size:12px;color:rgba(36,26,22,.52)">
                {row.match}
              </Fx>
            </Fx>
            <Fx as="span" s={`font-weight:800;font-size:13.5px;color:${row.color}`}>
              {row.amount}
            </Fx>
          </Fx>
        ))}
      </Fx>
    </Fx>
  );
}

export function AiFinanceView({ entry, licensed }: { entry: CatalogEntry; licensed: boolean }) {
  return (
    <ProductPage
      app={app}
      entry={entry}
      licensed={licensed}
      badge={{ pill: '7-DAY FREE TRIAL', note: 'No card. Full app.' }}
      title="Your books, reconciled before you open them."
      lede="AI Finance matches your bank feed to invoices and bills overnight, then answers plain questions about the money — “can I afford a second van in March?” — with the working shown."
      buyLabel="Buy it from $99/mo"
      heroCard={<HeroCard />}
      stats={[
        { value: '8 hrs', label: 'bookkeeping saved monthly' },
        { value: '2 min', label: 'to a cash-flow answer' },
        { value: '96%', label: 'of lines auto-matched' },
        { value: '0', label: 'spreadsheets required' },
      ]}
      featuresTitle="Everything a bookkeeper does on a Tuesday."
      features={[
        {
          icon: '🔗',
          title: 'Bank feeds that match themselves',
          body: 'Connect an account and every line lands against the right invoice, bill or category overnight. You review exceptions, not everything.',
        },
        {
          icon: '💬',
          title: 'Ask it in plain English',
          body: '“What did we spend on fuel last quarter?” Answers come with the transactions behind them, so you can check the working.',
        },
        {
          icon: '📤',
          title: 'Invoices sent and chased',
          body: 'Issue from a template, then let it nudge on day 7, 14 and 30 in your tone of voice. Paid invoices close themselves.',
        },
        {
          icon: '📈',
          title: 'Cash-flow forecast',
          body: 'Thirteen weeks ahead, built from your real payment patterns — not a straight line through last month.',
        },
        {
          icon: '🧮',
          title: 'Tax-ready at any moment',
          body: 'Statements, ledgers and a fixed-asset register your accountant can open without a phone call first.',
        },
        {
          icon: '🔐',
          title: 'Read-only by default',
          body: 'It can see your accounts and never move money. Every automated action is logged with who approved it.',
        },
      ]}
      stepsTitle="Three days to a set of books you trust."
      steps={[
        {
          n: '1',
          title: 'Connect or upload',
          body: 'Bank feed, CSV or last year of statements — whichever you have. Setup takes about twenty minutes.',
        },
        {
          n: '2',
          title: 'Confirm the first pass',
          body: 'It categorises everything and shows you what it was unsure about. Your corrections teach it your business.',
        },
        {
          n: '3',
          title: 'Ask, and act',
          body: 'From then on it reconciles nightly. You open it to ask questions and send invoices, not to do data entry.',
        },
      ]}
      planIncludes={{
        'fin-solo': ['One legal entity', 'Two bank feeds', 'Unlimited invoices', 'Accountant guest access'],
        'fin-group': ['Up to four entities', 'Consolidated group view', 'Six bank feeds', 'Inter-company matching'],
      }}
      trialPanel={{
        kicker: 'Try before you buy',
        title: 'Seven days of the real app. Your own numbers.',
        body: "Nothing is cut down for the trial. Import a statement, ask it questions, send a real invoice. If it doesn't earn its keep, walk away — we never ask for a card up front.",
      }}
      panel={{
        bg: 'linear-gradient(160deg,#2A1A12,#3D2317 55%,#241A16)',
        fg: '#FFEFE5',
        kicker: '#8CE7C4',
        body: 'rgba(255,239,229,.7)',
        btnBg: '#8CE7C4',
      }}
      faqsTitle="Questions owners actually ask"
      faqs={[
        {
          q: 'Does it replace my accountant?',
          a: 'No — it replaces the shoebox. Your accountant gets clean books and spends their time on tax planning instead of chasing receipts. Most clients keep the same accountant and pay them for less hours.',
        },
        {
          q: 'Which banks work in Pakistan?',
          a: 'Meezan, HBL, UBL, Bank Alfalah and Standard Chartered feed automatically. Anything else imports from statements, and we set up the mapping for you during onboarding.',
        },
        {
          q: 'What happens to my data if I leave?',
          a: 'You export everything — ledgers, invoices, attachments — as CSV and PDF, and we delete our copy within thirty days. Nothing is held hostage.',
        },
        {
          q: 'Can two businesses share one login?',
          a: 'That is what the Group plan is for: up to four entities, each with its own books, plus a consolidated view across all of them.',
        },
      ]}
    />
  );
}
