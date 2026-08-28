import { type OrderStatus, type PaymentStatus } from './order-status';
import { routes } from './routes';

/**
 * The published catalog — the products, services and Academy places a visitor
 * can order, with the plans each one sells. Postgres holds the live copy; this
 * module is its shape and the fallback the pages render before a seed lands.
 */

export type Plan = {
  id: string;
  name: string;
  price: number;
  unit: string;
  note: string;
};

export type CatalogItem = {
  id: string;
  group: 'Products' | 'Services' | 'Academy';
  tint: string;
  icon: string;
  name: string;
  blurb: string;
  plans: Plan[];
};

export const catalog: CatalogItem[] = [
  {
    id: 'smart-school-os',
    group: 'Products',
    tint: '#EEEBFE',
    icon: '🎓',
    name: 'Smart School OS',
    blurb: 'Admissions, attendance, fees and report cards in one system.',
    plans: [
      { id: 'sso-core', name: 'Core campus', price: 199, unit: '/month', note: 'Up to 500 students' },
      { id: 'sso-multi', name: 'Multi-campus', price: 349, unit: '/month', note: 'Up to 3 campuses' },
    ],
  },
  {
    id: 'ai-finance',
    group: 'Products',
    tint: '#EEEBFE',
    icon: '📊',
    name: 'AI Finance',
    blurb: 'Books that reconcile themselves and answer cash-flow questions.',
    plans: [
      { id: 'fin-solo', name: 'Single business', price: 99, unit: '/month', note: 'One entity, one accountant seat' },
      { id: 'fin-group', name: 'Group', price: 179, unit: '/month', note: 'Up to 4 entities' },
    ],
  },
  {
    id: 'ai-whiteboard',
    group: 'Products',
    tint: '#EEEBFE',
    icon: '🖍️',
    name: 'AI Whiteboard',
    blurb: 'A teaching canvas that draws, explains and saves the lesson.',
    plans: [{ id: 'wb-std', name: 'Standard', price: 49, unit: '/month', note: 'Unlimited boards' }],
  },
  {
    id: 'ai-recipes',
    group: 'Products',
    tint: '#EEEBFE',
    icon: '🍳',
    name: 'AI Recipes',
    blurb: 'Menus, portion costs and supplier shopping lists.',
    plans: [{ id: 'rec-std', name: 'Standard', price: 49, unit: '/month', note: 'One kitchen' }],
  },
  {
    id: 'website',
    group: 'Services',
    tint: '#FFEDE3',
    icon: '🌐',
    name: 'Website',
    blurb: 'Responsive build with lead capture, hosting and edits.',
    plans: [
      { id: 'web-starter', name: 'Starter', price: 500, unit: 'one-time + $49/mo', note: 'One page, live in a day' },
      { id: 'web-business', name: 'Business', price: 1200, unit: 'one-time + $99/mo', note: 'Up to 6 pages' },
      { id: 'web-growth', name: 'Growth', price: 2500, unit: 'one-time + $149/mo', note: 'Bookings, payments, blog' },
    ],
  },
  {
    id: 'chatbot',
    group: 'Services',
    tint: '#FFEDE3',
    icon: '💬',
    name: 'Chatbot',
    blurb: 'Answers repeat questions on your site and WhatsApp.',
    plans: [
      { id: 'bot-web', name: 'Website bot', price: 300, unit: 'one-time + $39/mo', note: 'Trained on your business' },
      {
        id: 'bot-omni',
        name: 'Website + WhatsApp',
        price: 550,
        unit: 'one-time + $69/mo',
        note: 'One brain, both channels',
      },
    ],
  },
  {
    id: 'calling-agent',
    group: 'Services',
    tint: '#FFEDE3',
    icon: '📞',
    name: 'AI Calling Agent',
    blurb: 'Answers, qualifies and books — day or night.',
    plans: [
      {
        id: 'call-overflow',
        name: 'Overflow',
        price: 600,
        unit: 'one-time + $149/mo',
        note: 'Picks up when you are busy',
      },
      { id: 'call-full', name: 'Full reception', price: 900, unit: 'one-time + $249/mo', note: 'Every call, 24/7' },
    ],
  },
  {
    id: 'automation',
    group: 'Services',
    tint: '#FFEDE3',
    icon: '⚙️',
    name: 'Automation workflow',
    blurb: 'Follow-ups, reminders and CRM sync on autopilot.',
    plans: [
      { id: 'auto-one', name: 'Single workflow', price: 100, unit: 'one-time', note: 'Built, tested, monitored' },
      { id: 'auto-pack', name: 'Workflow pack', price: 350, unit: 'one-time', note: 'Any four workflows' },
    ],
  },
  {
    id: 'academy-group',
    group: 'Academy',
    tint: '#E9FBF3',
    icon: '👥',
    name: 'Academy — group classes',
    blurb: 'Live classes in small groups of up to six students.',
    plans: [{ id: 'ac-group', name: 'Group', price: 59, unit: '/subject/month', note: '4 live classes a week' }],
  },
  {
    id: 'academy-121',
    group: 'Academy',
    tint: '#E9FBF3',
    icon: '🎯',
    name: 'Academy — one-to-one',
    blurb: 'A dedicated specialist tutor at your child’s pace.',
    plans: [
      { id: 'ac-121', name: 'One-to-one', price: 149, unit: '/subject/month', note: '4 private classes a week' },
    ],
  },
  {
    id: 'academy-exam',
    group: 'Academy',
    tint: '#E9FBF3',
    icon: '🏆',
    name: 'Academy — exam season',
    blurb: 'Board and entrance-exam support through the season.',
    plans: [
      { id: 'ac-exam', name: 'Exam season', price: 449, unit: '/subject/term', note: 'Mocks, marking, bootcamps' },
    ],
  },
  {
    // The professional track sits in the Academy group so the order form, the
    // dashboard and Pip's price list pick it up without a schema change. It
    // bills by the hour rather than the month because a working adult books
    // sessions around a job, not a school timetable.
    id: 'academy-ai-engineering',
    group: 'Academy',
    tint: '#EEEBFE',
    icon: '🤖',
    name: 'Academy — Applied AI Engineering',
    blurb: 'A 16-week one-to-one program from zero programming to deployed AI applications.',
    plans: [
      { id: 'ai-standard', name: 'Standard', price: 25, unit: '/hour', note: 'Curriculum, projects, capstone' },
      { id: 'ai-intensive', name: 'Intensive', price: 30, unit: '/hour', note: 'Code reviews and extra practice' },
      { id: 'ai-mentorship', name: 'Mentorship', price: 40, unit: '/hour', note: 'Portfolio, career and freelancing' },
    ],
  },
];

/**
 * The four standalone products, each with its own trial and domain. `page` is
 * the marketing page here; `app` is where "open it" goes — only the whiteboard
 * runs inside this site, the others live on their own hosts.
 */
export type ProductApp = {
  key: 'finance' | 'recipes' | 'school' | 'whiteboard';
  itemId: string;
  name: string;
  host: string;
  page: string;
  app: string;
  icon: string;
  accent: string;
  wash: string;
  trialDays: number;
  blurb: string;
};

export const productApps: ProductApp[] = [
  {
    key: 'finance',
    itemId: 'ai-finance',
    name: 'AI Finance',
    host: 'finance.officepigeon.com',
    page: routes.aiFinance,
    app: routes.aiFinance,
    icon: '📊',
    accent: '#0F9C6E',
    wash: '#E9FBF3',
    trialDays: 7,
    blurb: 'Books that reconcile themselves.',
  },
  {
    key: 'recipes',
    itemId: 'ai-recipes',
    name: 'AI Recipes',
    host: 'recipes.officepigeon.com',
    page: routes.aiRecipes,
    app: routes.aiRecipes,
    icon: '🍳',
    accent: '#E8480F',
    wash: '#FFEDE3',
    trialDays: 7,
    blurb: 'Menus costed to the portion.',
  },
  {
    key: 'school',
    itemId: 'smart-school-os',
    name: 'Smart School OS',
    host: 'school.officepigeon.com',
    page: routes.smartSchool,
    app: routes.smartSchool,
    icon: '🎓',
    accent: '#5A48D6',
    wash: '#EEEBFE',
    trialDays: 14,
    blurb: 'One system for the whole campus.',
  },
  {
    key: 'whiteboard',
    itemId: 'ai-whiteboard',
    name: 'AI Whiteboard',
    host: 'whiteboard.officepigeon.com',
    page: routes.whiteboard,
    app: routes.apps.whiteboard,
    icon: '🖍️',
    accent: '#E8A100',
    wash: '#FFF4D8',
    trialDays: 7,
    blurb: 'A board that keeps up with the lesson.',
  },
];

export function appFor(key: string): ProductApp | null {
  return productApps.find((app) => app.key === key || app.itemId === key) ?? null;
}

export type { OrderStatus };

/**
 * Formats an amount in its own currency.
 *
 * Crypto needs more than two decimals to mean anything, and PKR is never
 * written with them, so the fraction digits follow the currency rather than a
 * single global default.
 */
export function money(value: number, currency = 'USD'): string {
  const amount = Number(value) || 0;

  if (currency === 'BTC') return `${amount.toFixed(8)} BTC`;
  if (currency === 'USDT') return `${amount.toFixed(2)} USDT`;
  if (currency === 'PKR') return `PKR ${Math.round(amount).toLocaleString('en-US')}`;
  if (currency !== 'USD') {
    return `${currency} ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }

  // Whole dollars stay clean; a discounted or pro-rated amount keeps its cents.
  const fraction = Number.isInteger(amount) ? 0 : 2;
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: fraction,
    maximumFractionDigits: 2,
  })}`;
}

export function statusTint(status: string): { bg: string; fg: string } {
  if (status === 'Live') return { bg: '#E9FBF3', fg: '#0F9C6E' };
  if (status === 'In build') return { bg: '#EEEBFE', fg: '#5A48D6' };
  if (status === 'Confirmed') return { bg: '#FFF4D8', fg: '#B07C00' };
  if (status === 'Awaiting payment') return { bg: '#FFF4D8', fg: '#96690A' };
  if (status === 'Closed') return { bg: '#F1EFE8', fg: 'rgba(36,26,22,.55)' };
  if (status === 'Cancelled') return { bg: '#F1EFE8', fg: 'rgba(36,26,22,.45)' };
  return { bg: '#FFEDE3', fg: '#E8480F' };
}

export function paymentTint(status: PaymentStatus): { bg: string; fg: string } {
  if (status === 'paid') return { bg: '#E9FBF3', fg: '#0F9C6E' };
  if (status === 'awaiting_verification') return { bg: '#EEEBFE', fg: '#5A48D6' };
  if (status === 'partially_paid') return { bg: '#FFF4D8', fg: '#96690A' };
  if (status === 'refunded') return { bg: '#F1EFE8', fg: 'rgba(36,26,22,.55)' };
  return { bg: '#FFEDE3', fg: '#E8480F' };
}
