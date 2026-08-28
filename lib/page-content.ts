/**
 * Page content that lives in Postgres once seeded: the Examples case studies
 * and the FAQ entries. Kept beside the other defaults so the seed script and
 * the rendered pages read the same source.
 */

export type ExampleContent = {
  title: string;
  /** Filter key on the Examples page. */
  group: string;
  kind: string;
  sector: string;
  body: string;
  /** Headline numbers, each `value|label|colour`. */
  results: string[];
  tint: string;
  slot: string;
  photo: string;
};

export const exampleFilters = [
  { label: 'All work', key: 'all' },
  { label: 'Websites', key: 'websites' },
  { label: 'Chatbots', key: 'chatbots' },
  { label: 'Calling agents', key: 'calling' },
  { label: 'Automations', key: 'automations' },
  { label: 'Products', key: 'products' },
  { label: 'Academy', key: 'academy' },
];

/**
 * These are build specifications, not client case studies. The services side of
 * Office Pigeon is new under this name: two builds are in progress and neither
 * has finished, so there are no client outcomes to report yet. Every figure
 * here describes scope or delivery time — something we control — rather than a
 * result claimed on a client's behalf. Replace an entry with a real case study
 * the moment one exists, and say whose it is.
 */
export const defaultExamples: ExampleContent[] = [
  {
    group: 'websites',
    kind: 'Website',
    sector: 'Auto services',
    tint: '#FFEDE3',
    slot: 'ex-auto',
    photo: 'Screenshot of an auto workshop site',
    title: 'Workshop one-pager',
    body: 'A single page carrying live service pricing, a booking form and a WhatsApp button — the shape of build we ship in a working day.',
    results: ['1 day|typical build|#E8480F', 'Under 1s|mobile load target|#0F9C6E'],
  },
  {
    group: 'chatbots',
    kind: 'Chatbot',
    sector: 'Cleaning',
    tint: '#E9FBF3',
    slot: 'ex-clean',
    photo: 'Phone showing a cleaning quote bot',
    title: 'Quote-and-book bot',
    body: 'Quotes by house size, checks the address is inside the service area, and books the first visit without anyone stepping in.',
    results: ['2–3 days|to go live|#0F9C6E', '24/7|answering|#241A16'],
  },
  {
    group: 'calling',
    kind: 'Calling agent',
    sector: 'Beauty & spa',
    tint: '#EEEBFE',
    slot: 'ex-spa',
    photo: 'Photo of a salon front desk',
    title: 'Salon calling agent',
    body: 'Answers while the chair is busy, takes bookings and moves appointments — without the front desk touching the phone.',
    results: ['1 ring|pickup target|#5A48D6', '~1 week|build and testing|#241A16'],
  },
  {
    group: 'products',
    kind: 'Smart School OS',
    sector: 'Schools',
    tint: '#EEEBFE',
    slot: 'ex-school',
    photo: 'Screenshot of the school dashboard',
    title: 'One dashboard for a campus',
    body: 'Admissions, attendance, fees, schedules and report cards in one system, replacing the spreadsheet-and-WhatsApp arrangement most campuses run on.',
    results: ['In build|launching soon|#5A48D6', '14 days|free trial planned|#0F9C6E'],
  },
  {
    group: 'products',
    kind: 'AI Finance',
    sector: 'Restaurants',
    tint: '#E9FBF3',
    slot: 'ex-finance',
    photo: 'Screenshot of the finance dashboard',
    title: 'Books that reconcile themselves',
    body: 'Bank feeds matched to invoices nightly, unpaid invoices chased on a schedule, and plain-language answers about cash flow.',
    results: ['In build|launching soon|#0F9C6E', '7 days|free trial planned|#241A16'],
  },
  {
    group: 'academy',
    kind: 'Academy',
    sector: 'Board years',
    tint: '#FFF4D8',
    slot: 'ex-academy',
    photo: 'A student in a live lesson',
    title: 'Two subjects, one board year',
    body: 'Physics and maths taught one-to-one across a board year, with weekly parent notes and past-paper practice from month two.',
    results: ['16|countries taught in|#E8A100', '100+|five-star reviews|#0F9C6E'],
  },
  {
    group: 'automations',
    kind: 'Automations',
    sector: 'Real estate',
    tint: '#FFF4D8',
    slot: 'ex-realty',
    photo: 'Photo of a letting agent at work',
    title: 'Lettings follow-up pack',
    body: 'Enquiries routed by area, viewings reminded twice, and a review request sent the day after move-in.',
    results: ['4|workflows in a pack|#E8A100', 'Monitored|after handover|#0F9C6E'],
  },
  {
    group: 'websites',
    kind: 'Website',
    sector: 'Gyms & studios',
    tint: '#FFEDE3',
    slot: 'ex-gym',
    photo: 'Screenshot of a studio site',
    title: 'Studio site with booking',
    body: 'Class schedules, trial signup and online payments across six pages, wired into the calendar the studio already uses.',
    results: ['6 pages|typical scope|#E8480F', '4 days|full build|#241A16'],
  },
  {
    group: 'chatbots',
    kind: 'Chatbot',
    sector: 'Schools',
    tint: '#E9FBF3',
    slot: 'ex-admissions',
    photo: 'Screenshot of an admissions bot',
    title: 'Admissions bot for parents',
    body: 'Answers fee, syllabus and admission-window questions, and books campus tours straight into the diary.',
    results: ['Site + WhatsApp|one brain|#0F9C6E', 'Your policies|not generic answers|#241A16'],
  },
];

/**
 * Academy reviews, which are real. Nothing on the services side is quoted here
 * until a client has actually said it.
 */
export const exampleQuotes = [
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
];

export type FaqContent = { question: string; answer: string; category: string };

export const faqCategories = ['Getting started', 'Products', 'Academy', 'Money & support'];

export const defaultFaqs: FaqContent[] = [
  {
    category: 'Getting started',
    question: 'How fast can we actually go live?',
    answer:
      'A starter website is live within one working day of the demo call. Chatbots take two to three days once we have your prices and policies. Calling agents take about a week, mostly because we test them properly before pointing your number at one.',
  },
  {
    category: 'Getting started',
    question: 'What do you need from me?',
    answer:
      'Your price list, opening hours, service area and a handful of photos. If you do not have photos we will work with stock while you gather real ones. Everything else — copy, design, setup — is on us.',
  },
  {
    category: 'Getting started',
    question: 'Do I need to be technical?',
    answer:
      'No. We handle domains, hosting, phone numbers and integrations. You get a one-page guide showing where to change your own text if you ever want to.',
  },
  {
    category: 'Getting started',
    question: 'Can I start with just one thing?',
    answer:
      'Yes, and we usually recommend it. Start with whatever is leaking the most money today, prove it works, then add the next piece.',
  },
  {
    category: 'Products',
    question: 'Are the products separate from the services?',
    answer:
      'Yes. Products — Smart School OS, AI Finance, AI Whiteboard and AI Recipes — will be software you subscribe to and use yourself; all four are still in build. Services are things we build and run for you today, like websites and calling agents.',
  },
  {
    category: 'Products',
    question: 'Can the products talk to each other?',
    answer:
      'That is the plan. Smart School OS and AI Finance will share fee and invoice data, and AI Whiteboard lessons will attach to student records if you use both. Nothing will be forced — each works on its own.',
  },
  {
    category: 'Products',
    question: 'Is my data safe?',
    answer:
      'Your data stays yours, stored encrypted, never used to train public models, and exportable in full at any time. Schools get a signed data-processing agreement.',
  },
  {
    category: 'Products',
    question: 'Can we trial a product before paying?',
    answer:
      'Not yet — none of the four are open, so there is nothing to trial or pay for. Tell us which one you are waiting on and we will come to you first when it opens.',
  },
  {
    category: 'Academy',
    question: 'Which classes and subjects do you teach?',
    answer:
      'Class 1 to 12, across math, physics, chemistry, biology, English, languages, social studies, commerce and computer science. If it is on your child’s syllabus, we can almost certainly cover it.',
  },
  {
    category: 'Academy',
    question: 'Are classes live or recorded?',
    answer:
      'Live, always — small groups of up to six or one-to-one. Every class is recorded and sent afterwards with notes, so a missed session is never a lost one.',
  },
  {
    category: 'Academy',
    question: 'How do you match a tutor?',
    answer:
      'A short assessment call, then we match on subject, board and temperament. If the fit is wrong after two classes, we change the tutor, not your plan.',
  },
  {
    category: 'Academy',
    question: 'What do parents actually see?',
    answer:
      'A monthly report with attendance, test scores, what improved and what still needs work — written in plain language, not percentages alone.',
  },
  {
    category: 'Academy',
    question: 'Do you teach adults, or only school students?',
    answer:
      'Both. School tutoring runs per subject, per month, against a school timetable. The professional track — starting with Applied AI Engineering — is taught one-to-one by our own engineers and billed by the hour, because adults book around a job rather than a term.',
  },
  {
    category: 'Academy',
    question: 'What is Applied AI Engineering?',
    answer:
      'A sixteen-week one-to-one program that starts at no programming experience and finishes with a deployed AI application you built. It covers Python, APIs, Git, LLMs, RAG, automation in n8n, AI agents, deployment and a capstone. Sessions start at $25 an hour and the first introductory session is free.',
  },
  {
    category: 'Money & support',
    question: 'Am I locked into a contract?',
    answer:
      'No. Monthly plans run month to month with thirty days notice to cancel. Set-up fees are one-off and quoted upfront.',
  },
  {
    category: 'Money & support',
    question: 'What happens if I leave?',
    answer:
      'You keep your domain, website files, phone number, content and all your data. We hand it over cleanly — no hostage-taking.',
  },
  {
    category: 'Money & support',
    question: 'What is included in the monthly fee?',
    answer:
      'Hosting, backups, monitoring, security updates, small content edits and support. Bigger changes are quoted separately so you are never surprised.',
  },
  {
    category: 'Money & support',
    question: 'How does support work?',
    answer:
      'Email and WhatsApp during business hours, answered by someone who knows your setup. Front Desk and Growth plans get priority response within four hours.',
  },
];
