import { catalog, type CatalogItem, type Plan } from './catalog';
import { routes } from './routes';

/**
 * The content the site ships with. `lib/site-content.ts` renders these when a
 * table is empty, and `scripts/seed.ts` writes them into Postgres — so the
 * published site and the seed never drift.
 */

export type CatalogContent = {
  itemId: string;
  group: CatalogItem['group'];
  tint: string;
  icon: string;
  name: string;
  blurb: string;
  /** Longer card copy used on the marketing pages. */
  body: string;
  tagline: string;
  href: string;
  slot: string;
  photo: string;
  order: number;
  plans: Plan[];
  /** Detail block, present for anything with a section of its own. */
  audience?: string;
  accent?: string;
  wash?: string;
  detailBody?: string;
  /** Each `title|body`. */
  features?: string[];
  /** Each `value|label`. */
  stats?: string[];
  detailSlot?: string;
  detailPhoto?: string;
  /** The item's own page, when it has one. */
  page?: string;
};

/** Splits the seeded `a|b` pairs back into objects. */
export function pairs(values: string[] | undefined, keys: [string, string]) {
  return (values ?? []).map((value) => {
    const [first = '', second = ''] = value.split('|');
    return { [keys[0]]: first, [keys[1]]: second } as Record<string, string>;
  });
}

type Detail = Pick<
  CatalogContent,
  'audience' | 'accent' | 'wash' | 'detailBody' | 'features' | 'stats' | 'detailSlot' | 'detailPhoto' | 'page'
>;

const details: Record<string, Detail> = {
  'smart-school-os': {
    audience: 'For schools & academies',
    accent: '#5A48D6',
    wash: 'linear-gradient(150deg,#EEEBFE,#F6F2FF 50%,#FFF0E7)',
    page: routes.smartSchool,
    detailSlot: 'prod-school',
    detailPhoto: 'Screenshot of the Smart School OS dashboard',
    detailBody:
      'One system for admissions, attendance, fees, schedules and report cards — so staff stop stitching together spreadsheets and WhatsApp groups.',
    features: [
      'Admissions to alumni|Every student record in one timeline, searchable in a second.',
      'Fees that chase themselves|Invoices, reminders and receipts sent automatically to parents.',
      'Attendance in two taps|Teachers mark from any phone; absentee alerts go out instantly.',
      'Report cards in minutes|Marks in, branded PDFs out — no more manual formatting weekends.',
    ],
    stats: ['40+|classrooms running it', '6 hrs|saved per teacher weekly', '92%|fees collected on time'],
  },
  'ai-finance': {
    audience: 'For owners & accountants',
    accent: '#0F9C6E',
    wash: 'linear-gradient(150deg,#E9FBF3,#F2FFFA 50%,#FFF4D8)',
    page: routes.aiFinance,
    detailSlot: 'prod-finance',
    detailPhoto: 'Screenshot of the AI Finance dashboard',
    detailBody:
      'Your books, reconciled and readable. Ask a plain question — “can I afford a second van in March?” — and get an answer backed by your own numbers.',
    features: [
      'Auto-reconciled ledgers|Bank feeds matched to invoices and bills without manual tagging.',
      'Plain-language answers|Ask about runway, margins or a client — get the number and the working.',
      'Invoices and chasing|Send, track and politely chase unpaid invoices on a schedule.',
      'Tax-ready exports|Clean statements your accountant can actually use at year end.',
    ],
    stats: ['8 hrs|of bookkeeping saved monthly', '2 min|to a cash-flow answer', '0|spreadsheets required'],
  },
  'ai-whiteboard': {
    audience: 'For teachers & trainers',
    accent: '#E8A100',
    wash: 'linear-gradient(150deg,#FFF4D8,#FFFAEC 50%,#FFF0E7)',
    page: routes.whiteboard,
    detailSlot: 'prod-board',
    detailPhoto: 'AI Whiteboard mid-lesson',
    detailBody:
      'A teaching canvas that keeps up with you. Sketch a rough diagram and it cleans it up, explains the step, and hands the class a tidy set of notes afterwards.',
    features: [
      'Draw it, it explains it|Diagrams, equations and timelines rendered neatly as you talk.',
      'Step-by-step solving|Work through problems live, with each step written out for students.',
      'Lesson saved automatically|Every board becomes notes, a recording and a revision sheet.',
      'Works on any screen|Tablet, laptop or classroom display — same board, same lesson.',
    ],
    stats: ['100%|of lessons saved as notes', '3×|faster diagram prep', 'Any|subject or grade level'],
  },
  'ai-recipes': {
    audience: 'For kitchens & cafés',
    accent: '#E8480F',
    wash: 'linear-gradient(150deg,#FFEDE3,#FFF6F1 50%,#E9FBF3)',
    page: routes.aiRecipes,
    detailSlot: 'prod-recipes',
    detailPhoto: 'A café kitchen prep bench',
    detailBody:
      'Menus built from what you already stock, costed to the portion, with the shopping list written for you. Less waste, clearer margins, fewer 6am decisions.',
    features: [
      'Menus from your stock|Tell it what is in the store room; get dishes you can actually make.',
      'Costed per portion|Ingredient prices roll up into a live margin for every dish.',
      'Shopping list generated|One consolidated order per supplier, sized to next week.',
      'Waste down, repeats up|Flags ingredients about to turn and suggests specials for them.',
    ],
    stats: ['18%|less food waste', '30 min|menu planning, not a day', 'Live|margin on every dish'],
  },
  website: { audience: 'For any business online', accent: '#E8480F', page: routes.websites },
  chatbot: { audience: 'For busy inboxes', accent: '#0F9C6E', page: routes.chatbots },
  'calling-agent': { audience: 'For phones that keep ringing', accent: '#5A48D6', page: routes.callingAgents },
  automation: { audience: 'For repeat admin', accent: '#E8A100', page: routes.automations },
  'academy-ai-engineering': {
    audience: 'For beginners entering AI',
    accent: '#5A48D6',
    wash: 'linear-gradient(150deg,#EEEBFE,#F6F2FF 50%,#FFF0E7)',
    page: routes.appliedAi,
    detailSlot: 'course-applied-ai',
    detailPhoto: 'A student building an AI application one-to-one',
    detailBody:
      'Sixteen weeks of one-to-one training that starts at “I have never written code” and ends with a deployed AI application you built yourself.',
    features: [
      'Taught one-to-one|Live sessions with an engineer, paced to what you already know.',
      'Project-driven|Eight builds, from Python basics to a RAG assistant and an AI agent.',
      'Real engineering|APIs, Git, deployment, security and evaluation — not prompt tricks.',
      'Free first session|An assessment and roadmap before you pay for anything.',
    ],
    stats: ['16 wks|structured curriculum', '8|projects you keep', 'Free|introductory session'],
  },
};

const cardCopy: Record<string, Pick<CatalogContent, 'body' | 'tagline' | 'href' | 'slot' | 'photo'>> = {
  'smart-school-os': {
    body: 'Admissions, attendance, fees, schedules and report cards in one calm dashboard.',
    tagline: 'For schools & academies',
    href: `${routes.products}#smart-school-os`,
    slot: 'home-p-school',
    photo: 'Smart School OS dashboard',
  },
  'ai-finance': {
    body: 'Books that reconcile themselves and answer cash-flow questions in plain English.',
    tagline: 'For owners & accountants',
    href: `${routes.products}#ai-finance`,
    slot: 'home-p-finance',
    photo: 'AI Finance dashboard',
  },
  'ai-whiteboard': {
    body: 'A teaching canvas that draws diagrams, explains steps and saves the whole lesson.',
    tagline: 'For teachers & trainers',
    href: `${routes.products}#ai-whiteboard`,
    slot: 'home-p-board',
    photo: 'AI Whiteboard in a lesson',
  },
  'ai-recipes': {
    body: 'Menus, portion costs and shopping lists generated from what you already stock.',
    tagline: 'For kitchens & cafés',
    href: `${routes.products}#ai-recipes`,
    slot: 'home-p-recipes',
    photo: 'A kitchen prep bench',
  },
  website: {
    body: 'A site that loads fast, reads well and turns visitors into enquiries you can answer.',
    tagline: 'from $500',
    href: routes.websites,
    slot: 'home-s-web',
    photo: 'A finished website on a laptop',
  },
  chatbot: {
    body: 'Answers the eighty questions you keep retyping — on your site and on WhatsApp.',
    tagline: 'from $300',
    href: routes.chatbots,
    slot: 'home-s-bot',
    photo: 'A chat conversation on a phone',
  },
  'calling-agent': {
    body: 'Picks up on the first ring, qualifies the caller and books them into your calendar.',
    tagline: 'from $600',
    href: routes.callingAgents,
    slot: 'home-s-call',
    photo: 'A phone ringing on a workbench',
  },
  automation: {
    body: 'Follow-ups, reminders, invoices and CRM updates that run without anyone remembering.',
    tagline: 'from $100',
    href: routes.automations,
    slot: 'home-s-auto',
    photo: 'A workflow board',
  },
  'academy-group': {
    body: 'Live classes in small groups of up to six students, four times a week.',
    tagline: 'from $59',
    href: routes.academy,
    slot: 'home-a-group',
    photo: 'A small online class',
  },
  'academy-121': {
    body: 'A dedicated specialist tutor moving at your child’s pace, with notes after each class.',
    tagline: 'from $149',
    href: routes.academy,
    slot: 'home-a-121',
    photo: 'A tutor and a student',
  },
  'academy-exam': {
    body: 'Mocks, marking and bootcamps through board and entrance-exam season.',
    tagline: 'from $449',
    href: routes.academy,
    slot: 'home-a-exam',
    photo: 'A student revising',
  },
  'academy-ai-engineering': {
    body: 'Python, APIs, LLMs, RAG, automation and AI agents — built one-to-one over sixteen weeks.',
    tagline: 'from $25/hour',
    href: routes.appliedAi,
    slot: 'home-a-ai',
    photo: 'A student building an AI application',
  },
};

const groupTints: Record<CatalogItem['group'], string> = {
  Products: '#EEEBFE',
  Services: '#FFEDE3',
  Academy: '#E9FBF3',
};

const cardTints: Record<string, string> = {
  'smart-school-os': '#EEEBFE',
  'ai-finance': '#E9FBF3',
  'ai-whiteboard': '#FFF4D8',
  'ai-recipes': '#FFEDE3',
  website: '#FFEDE3',
  chatbot: '#E9FBF3',
  'calling-agent': '#EEEBFE',
  automation: '#FFF4D8',
  'academy-ai-engineering': '#EEEBFE',
};

export const defaultCatalog: CatalogContent[] = catalog.map((item, index) => ({
  itemId: item.id,
  group: item.group,
  tint: cardTints[item.id] ?? groupTints[item.group],
  icon: item.icon,
  name: item.name,
  blurb: item.blurb,
  order: index,
  plans: item.plans,
  ...cardCopy[item.id],
  ...details[item.id],
}));

export type TestimonialContent = {
  text: string;
  name: string;
  role: string;
  initials: string;
  tint: string;
};

/**
 * Academy reviews, which are real. The services side has two builds in progress
 * and none delivered, so nothing is quoted for it until a client has said it.
 */
export const defaultTestimonials: TestimonialContent[] = [
  {
    text: 'As a full-time working mother I needed tutoring that was reliable and stress-free. The team not only prepared my daughter for EmSAT, they gave her back her confidence.',
    name: 'Mrs Noraln',
    role: 'Parent · UAE',
    initials: 'MN',
    tint: '#EEEBFE',
  },
  {
    text: 'I never thought I would enjoy studying for the SAT. The sessions were interactive and built around my weak areas — my score went up by 140 points.',
    name: 'Hassan',
    role: 'Student · SAT',
    initials: 'H',
    tint: '#FFEDE3',
  },
  {
    text: 'My son went from struggling in Physics to scoring an A in one term. The tutor explained concepts clearly and fitted around his school schedule perfectly.',
    name: 'Mrs Ayesha',
    role: 'Parent · A Level',
    initials: 'MA',
    tint: '#E9FBF3',
  },
  {
    text: 'Alhamdulillah Zainab got 3A*, 2A and 2B in her IGCSE exams, including an A in Physics. Thank you so much for your hard work and dedication.',
    name: 'Zainab’s mother',
    role: 'Parent · IGCSE',
    initials: 'ZM',
    tint: '#FFF4D8',
  },
  {
    text: 'Alhamdulillah I got an A in IGCSE Physics. Thank you so much for all the hard work and effort you put in with me — it means a lot.',
    name: 'Zainab',
    role: 'Student · IGCSE Physics',
    initials: 'Z',
    tint: '#EEEBFE',
  },
  {
    text: 'Mashallah Abdullah got an A* in Physics. Thanks a lot for your hard work and support.',
    name: 'Abdullah’s mother',
    role: 'Parent · IGCSE Physics',
    initials: 'AM',
    tint: '#FFEDE3',
  },
  {
    text: 'I got an A in Physics, alhamdulillah. Thank you for everything.',
    name: 'Kashmala',
    role: 'Student · IGCSE Physics',
    initials: 'K',
    tint: '#E9FBF3',
  },
];
