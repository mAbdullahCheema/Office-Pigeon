/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Package, FAQItem, ExampleBuild } from './types';

export const BRAND = {
  name: 'Office Pigeon',
  slogan: 'We Automate Your Success',
  email: 'contactus@officepigeon.com',
  supportEmail: 'help@officepigeon.com',
  phone: '+1 917 672 6764',
  whatsappUrl: 'https://wa.me/19176726764',
  calComUrl: 'https://cal.com/office-pigeon/demo-call',
  workingHours: 'Mon–Fri, 8:00 AM – 4:00 PM Eastern Time',
  footerWording: 'Serving businesses worldwide with AI-powered websites, chatbots, AI Calling Agents, and automations.'
};

export const WEBSITE_PACKAGES: Package[] = [
  {
    id: 'landing-page',
    name: 'Starter Business Website',
    price: '$500',
    badge: 'Best Starter Offer',
    timeline: '1 working day',
    revision: '1 minor revision included',
    renewal: '$20/year after the first year if managed through Office Pigeon',
    bestFor: 'Growing businesses that want a professional online presence without long-term complexity.',
    includes: [
      '1 beautiful responsive landing page',
      'Mobile-ready adaptive layout',
      'Interactive contact forms & lead captures',
      'Direct WhatsApp conversion buttons',
      'Social links integration',
      'Basic search engine optimization (SEO)',
      'Subtle animations and high-contrast styling',
      'Privacy and Terms footer pages setup',
      'Standard .com domain (where available)'
    ],
    note: 'After the first year, renewal is only $20/year if managed through Office Pigeon. Premium domains subject to registration premiums.'
  },
  {
    id: 'business-website',
    name: 'Smart Business Website',
    price: 'Starting at $1,400',
    badge: 'Most Powerful',
    timeline: '2–10 working days',
    revision: '1 revision included',
    support: 'Starting at $49/month + platform costs',
    bestFor: 'Businesses needing advanced systems like booking pipelines, custom accounts, administrative dashboards, or secure databases.',
    includes: [
      'Multi-page responsive structural layout',
      'Custom customer login or registration gateways',
      'Personalized customer panel',
      'Fully equipped admin management board',
      'Automated appointment bookings and reserves',
      'Secure payment integrations (Stripe, etc.)',
      'Custom relational database engines',
      'Direct client-facing notifications (email/SMS)',
      'Third-party software data relays',
      'Performance analytics instrumentation'
    ],
    note: 'Investment tiers depend on target features, volumes, database connections, and integrated third-party systems.'
  },
  {
    id: 'commerce-website',
    name: 'Smart Commerce Website',
    price: 'Starting at $1,000',
    timeline: '2–10 working days',
    revision: '1 revision included',
    support: 'Starting at $99/month + hosting/payment fees',
    bestFor: 'Retail and services businesses aiming to sell physical or digital goods in a sleek, conversion-centric online shop.',
    includes: [
      'Stunning dynamic product lists',
      'Fluid shopping cart and checkout overlays',
      'Multiple secure credit card & digital integrations',
      'Intuitive admin inventory dashboards',
      'Automatic order workflows',
      'Custom invoice generation & customer alerts',
      'Customer order archives',
      'Discount, coupon, and sales rule calculators',
      'Product categorization and search systems'
    ],
    note: 'Final monthly overhead varies based on sku quantity, shipping APIs, inventory complexity, and gateway subscriptions.'
  }
];

export const CHATBOT_PACKAGES: Package[] = [
  {
    id: 'faq-bot',
    name: 'Smart FAQ Bot',
    price: '$300 setup + $49/mo',
    timeline: '2-4 working days',
    revision: 'Standard monitoring',
    bestFor: 'Businesses that receive identical support inquiries, seeking to save staff hours.',
    includes: [
      'AI model customized with your business FAQs & hours',
      'Resolves 80%+ recurring customer questions',
      'Interactive floating web visual chat widget',
      'Direct WhatsApp chat support routing',
      'Multilingual customer conversations where supported',
      'Intuitive automatic contact info collection',
      'Clear human delegation transfer handoff options',
      'Comprehensive error fixes and active upkeep'
    ],
    note: 'Includes up to 10,000 messages/month. Extra usage added in affordable logical blocks.'
  },
  {
    id: 'booking-bot',
    name: 'Lead & Booking Bot',
    price: '$700 setup + $149/mo',
    badge: 'Most Popular',
    timeline: '3-7 working days',
    revision: 'Comprehensive support',
    bestFor: 'Companies seeking automated lead pipelines, schedules, and active multi-channel inquiries.',
    includes: [
      'All aspects of our Smart FAQ Bot system',
      'Interactive guided customer details capture',
      'Deep live Google/Outlook calendar matching',
      'Saves records straight to Google Sheets or CRMs',
      'Interactive target screening and client qualification',
      'Live email/Slack instant lead alerts',
      'Multi-channel: Website, WhatsApp & choice of IG/Facebook',
      'Setup starts in English with multilingual customer conversations where supported'
    ],
    note: 'Includes up to 20,000 messages/month. Tailored for continuous automated sales engagement.'
  },
  {
    id: 'business-assistant',
    name: 'AI Business Assistant',
    price: '$1,500 setup + $299/mo',
    timeline: '5-12 working days',
    revision: 'VIP Priority response',
    bestFor: 'Enterprises wanting a central unified assistant running across all customer service channels and databases.',
    includes: [
      'All components of Lead & Booking systems',
      'Universal Channels: Web, WhatsApp, FB, IG & Telegram',
      'Highly advanced custom intelligence training systems',
      'Reads/writes records in active databases',
      'Executes workflow automations through custom triggers',
      'Multilingual customer conversations where supported',
      'Intelligent regular customer followups',
      'Full monthly service oversight and regular optimization updates'
    ],
    note: 'Includes up to 40,000 messages/month. Built to serve as a logical digital expansion of your team.'
  }
];

export const CALLING_AGENT_PACKAGES: Package[] = [
  {
    id: 'smart-call-starter',
    name: 'Smart Call Starter',
    price: '$600 setup + $199/mo',
    timeline: 'Setup timeline reviewed during consultation',
    revision: 'Managed calling setup',
    bestFor: 'Businesses that want a simple AI phone assistant to answer common customer calls and capture messages.',
    includes: [
      'Inbound AI phone agent',
      'Business FAQs, hours, services, and location answers',
      'Basic customer question handling',
      'Message-taking and basic lead capture',
      'Email or WhatsApp lead alerts',
      'Call summaries where supported',
      'Starts in your chosen setup language',
      'Can respond in other supported languages based on the customer language',
      'Office Pigeon-managed calling infrastructure',
      'Twilio-powered number option',
      'WhatsApp support where available',
      'Includes up to 300 call minutes/month',
      'Extra minutes billed at $0.35/min'
    ],
    note: 'Automatic booking confirmation, advanced outbound workflows, CRM integration, complex automations, and live human transfer are not included by default.'
  },
  {
    id: 'lead-booking-caller',
    name: 'Lead & Booking Caller',
    price: '$1,200 setup + $449/mo',
    badge: 'Most Popular',
    timeline: 'Setup timeline reviewed during consultation',
    revision: 'Managed calling and booking request setup',
    bestFor: 'Service businesses that want to turn missed calls, form leads, and customer inquiries into qualified leads or booking requests.',
    includes: [
      'Everything in Smart Call Starter',
      'Inbound and approved outbound calling',
      'Missed-call callbacks',
      'Lead follow-up after website form submissions',
      'Appointment reminders',
      'Booking request collection',
      'Human approval before final booking confirmation',
      'Lead logs',
      'Detailed call summaries and transcripts where supported',
      'Google Sheets or calendar workflow',
      'WhatsApp support where available',
      'Live call transfer where technically supported',
      'Includes up to 900 call minutes/month',
      'Extra minutes billed at $0.35/min'
    ],
    note: 'The agent collects booking requests, checks required details, and notifies the business for approval.'
  },
  {
    id: 'ai-voice-operations-agent',
    name: 'AI Voice Operations Agent',
    price: '$2,500 setup + $999/mo',
    timeline: 'Setup timeline reviewed during consultation',
    revision: 'Advanced managed voice operations',
    bestFor: 'Businesses that want a full AI voice assistant connected to operations, follow-ups, booking systems, and workflows.',
    includes: [
      'Everything in Lead & Booking Caller',
      'Advanced inbound and outbound workflows',
      'Direct booking confirmation when calendar rules are clearly configured',
      'Customer qualification flows',
      'CRM, Google Sheets, calendar, email, or custom workflow integrations',
      'WhatsApp follow-up flows where available',
      'Review request calls',
      'Payment reminder calls where appropriate',
      'Re-engagement calls to old leads where appropriate',
      'Priority optimization',
      'Monthly performance report where supported',
      'Advanced lead logs and transcripts where supported',
      'Custom workflow planning',
      'Includes up to 2,500 call minutes/month',
      'Extra minutes billed at $0.35/min'
    ],
    note: 'Direct booking confirmation requires clean calendar rules, clear availability, and approved booking logic.'
  }
];

export const AUTOMATION_EXAMPLES = [
  {
    id: 'lead-sorting',
    title: 'Lead Capture & Sorting',
    description: 'When someone fills out a form, their details are automatically saved, organized, and dispatched to your staff channels instantly.'
  },
  {
    id: 'reminders',
    title: 'Appointment Reminders',
    description: 'Send custom notifications, check-in requests, and reviews automatically without typing a single direct SMS or email yourself.'
  },
  {
    id: 'followups',
    title: 'Customer Follow-Ups',
    description: 'Keep your pipelines warm with targeted, automated follow-up cadences immediately after prospective clients reach out.'
  },
  {
    id: 'sheets-crm',
    title: 'Sheets & CRM Synchronization',
    description: 'Unify your business systems. Move information smoothly among CRM, sheets, calendars, and sales boards without manual copy-pasting.'
  },
  {
    id: 'social-workflows',
    title: 'Social Media Organizer',
    description: 'Stay on top of updates, drafts, and responses in custom channels. Push assets to draft registers in an elegant automation chain.'
  },
  {
    id: 'chatbot-workflows',
    title: 'Chatbot Actions Integrator',
    description: 'Let your website or WhatsApp assistant trigger physical workflows, alert agents, update profiles, or send PDF flyers directly.'
  }
];

export const EXAMPLE_BUILDS: ExampleBuild[] = [
  {
    id: 'ex-auto',
    title: 'Precision Auto Repair',
    industry: 'Auto Repair & Tuning',
    caption: 'High-converting interactive booking website featuring responsive services mapping, custom trust factors, and offline booking fallback.',
    type: 'website',
    badge: 'Example Website Build',
    details: [
      'Clean interactive service selection visual widget',
      'Responsive design styled for greasy fingers on phone screens',
      'Direct WhatsApp repair quote button link'
    ]
  },
  {
    id: 'ex-spa',
    title: 'Radiant Medical Aesthetics',
    industry: 'Beauty, Spas & Wellness',
    caption: 'Gorgeous airy web system featuring complete services details, interactive therapist rosters, visual reviews, and Cal.com appointment bookings.',
    type: 'website',
    badge: 'Example Website Build',
    details: [
      'Generous negative space with premium porcelain colors',
      'Live consultant scheduler integration',
      'Embedded lead qualification questionnaires'
    ]
  },
  {
    id: 'ex-cleaning',
    title: 'Spruce Maid Services',
    industry: 'Home & Office Cleaners',
    caption: 'A professional and clean website designed to offer rapid size-based quotes, detailed frequency-pricing panels, and instant WhatsApp booking.',
    type: 'website',
    badge: 'Example Website Build',
    details: [
      'Dynamic volume-rate calculator slider',
      'Instant trust credentials grids',
      'Custom post-clean checklist cards'
    ]
  },
  {
    id: 'ex-gym',
    title: 'Vanguard Fitness Studio',
    industry: 'Gyms & Training Facilities',
    caption: 'Energetic modern layout demonstrating active schedules, dynamic member panels, clear program matrices, and seamless contact pathways.',
    type: 'website',
    badge: 'Example Website Build',
    details: [
      'Smooth high-contrast program cards',
      'Embedded calendar class grids',
      'Direct trial-class opt-in form'
    ]
  },
  {
    id: 'ex-realestate',
    title: 'Apex Realtors Portfolio',
    industry: 'Real Estate Brokers',
    caption: 'Elegant real estate showcase built to outline active listings, neighborhood analysis grids, and beautiful advisor bios for high credit trust.',
    type: 'website',
    badge: 'Example Website Build',
    details: [
      'Interactive listing card galleries',
      'Quick custom evaluation request form',
      'High-contrast map-linking hubs'
    ]
  }
];

export const GENERAL_FAQS: FAQItem[] = [
  {
    question: 'What does Office Pigeon do?',
    answer: 'Office Pigeon designs beautiful, modern websites, trains intelligent chatbots, builds AI Calling Agents, and structures connected workflow automations. Our systems help businesses look credible, reply faster, follow up on leads, and run with less manual effort.',
    category: 'general'
  },
  {
    question: 'Do I need technical knowledge?',
    answer: 'No technical background is required. We explain our solutions in simple, friendly, helpful words, build and manage all server setups, handle domain details, and provide fully managed solutions.',
    category: 'general'
  },
  {
    question: 'What is included in the $500 Starter Business Website?',
    answer: 'It includes 1 beautiful responsive landing page, complete phone/desktop formatting, custom client intake forms, WhatsApp message links, social blocks, standard SEO setup, first-year .com domain registration (if available), and hosting setup with complete support.',
    category: 'websites'
  },
  {
    question: 'Is the $500 Starter Business Website a one-time payment?',
    answer: 'Yes, the initial build is a one-time $500 investment. After the first year, domain registration and hosting run at a tiny, cost-effective fee of just $20/year if kept under Office Pigeon management.',
    category: 'websites'
  },
  {
    question: 'What if my preferred website address is not available?',
    answer: 'We will search for close and clever alternatives. If you desire a specific premium domain that carries elevated registration fees, we will coordinate and advise you of options before acquisition.',
    category: 'websites'
  },
  {
    question: 'Do you offer revisions?',
    answer: 'Yes, the Starter Business Website package includes 1 minor design/copy revision. Additional minor maintenance or wording revisions can be bought for $50, and large functional revisions are provided via custom quotes. Our website templates and custom app packages include clear revision milestones.',
    category: 'general'
  },
  {
    question: 'What counts as a minor revision?',
    answer: 'Minor revisions include content adjustments, changing imagery assets, color tweaks, or typo fixes. Major edits such as introducing database queries, booking calendar integrations, or building entire sections are quoted depending on depth.',
    category: 'general'
  },
  {
    question: 'How do chatbot message limits work?',
    answer: 'Each chatbot tier includes a distinct monthly message budget (e.g., 10k messages for FAQ Bot, 20k for Lead Bot, 40k for AI Assistant). These limits reset monthly. Extra volume is available in packages of $20 per 1,000 extra interactions.',
    category: 'chatbots'
  },
  {
    question: 'What happens if I go over my chatbot limit?',
    answer: 'Your bot will remain active and gently alert our monitoring system. We will reach out to offer standard budget blocks of $20 per 1,000 interactions, ensuring your customers are never left suspended.',
    category: 'chatbots'
  },
  {
    question: 'Are third-party platform fees included?',
    answer: 'Some complex integrations such as Twilio-powered numbers, Stripe processing, customized CRM seats, premium social channel connections, WhatsApp approval needs, unusual international routing, or custom carrier setups may require separate review or additional third-party fees. We keep these transparent and outline them clearly.',
    category: 'general'
  },
  {
    question: 'Do chatbot plans include support?',
    answer: 'Yes! Active monthly chatbot subscriptions contain integrated system monitoring, error troubleshooting, and response adjustment upkeep. Major feature expansions are priced individually.',
    category: 'chatbots'
  },
  {
    question: 'How do workflow automations work?',
    answer: 'Workflow automations connect existing software systems (e.g., matching a website contact submission to Google sheets, creating calendar meetings, and pushing alerts to staff channels). These operate quietly behind the scenes automatically.',
    category: 'automations'
  },
  {
    question: 'How much do workflow automations cost?',
    answer: 'Automations start at initial custom setup fees of $100+ along with a basic monthly active monitoring package depending on the complexity and volume of tasks.',
    category: 'automations'
  },
  {
    question: 'Do automations include support?',
    answer: 'Yes, our monthly monitoring ensures we trace errors and fix broken connecting APIs. New workflow chains or new service components are detailed in separate logical updates.',
    category: 'automations'
  },
  {
    question: 'How do payments work?',
    answer: 'We work on a clear, standard 50/50 payment milestone: 50% upfront to initiate the layout and design steps, and 50% upon final display and approval after we demonstrate the live working solution to you.',
    category: 'general'
  },
  {
    question: 'Are purchases refundable?',
    answer: 'Due to custom engineering, human hours, and software commitments, all payments are final unless specified by native local consumer statutes. We outline this in our Refund Policy.',
    category: 'general'
  },
  {
    question: 'What is Pip AI?',
    answer: 'Pip AI is our automated assistant. It answers questions about Office Pigeon, details custom options, suggests solutions based on your goals, and helps you book appointments quickly.',
    category: 'general'
  },
  {
    question: 'What are AI Calling Agents?',
    answer: 'AI Calling Agents are phone and WhatsApp-based assistants that can answer customer questions, collect lead details, handle booking requests, send follow-ups, and notify your team based on your business setup.',
    category: 'calling'
  },
  {
    question: 'Can the AI answer calls in different languages?',
    answer: 'Yes, Office Pigeon agents can start in the language chosen during setup and can respond in other supported languages based on the customer language where supported. English is the primary setup language.',
    category: 'calling'
  },
  {
    question: 'Can the AI make outbound calls?',
    answer: 'Yes, approved outbound use cases can include missed-call callbacks, lead follow-ups, appointment reminders, booking confirmations, review request calls, and payment reminders where appropriate. Cold calling is not included in standard packages and may require separate review.',
    category: 'calling'
  },
  {
    question: 'Can I use my own phone number?',
    answer: 'Yes, clients may request setup with their own existing number, but this can require extra steps from their phone provider, Twilio, WhatsApp, or verification systems. Issues caused by the client existing number, carrier restrictions, provider delays, or third-party approval problems are not covered under standard Office Pigeon support.',
    category: 'calling'
  },
  {
    question: 'Is WhatsApp included?',
    answer: 'WhatsApp support is available where supported by provider rules, business verification, and regional availability. WhatsApp setup may require approval from third-party platforms. Extra usage may be billed separately if fair usage is exceeded.',
    category: 'calling'
  },
  {
    question: 'Can the AI confirm bookings automatically?',
    answer: 'It depends on the package and business setup. The Lead & Booking Caller usually collects booking requests and notifies the business for approval. The AI Voice Operations Agent can confirm bookings directly when calendar rules, availability, and booking logic are clearly configured.',
    category: 'calling'
  },
  {
    question: 'Are call recordings included?',
    answer: 'Call recordings are not included as a standard advertised feature. Call summaries, lead logs, transcripts, and reports may be available depending on the package and provider support.',
    category: 'calling'
  },
  {
    question: 'What happens if I exceed my included minutes?',
    answer: 'Extra minutes are billed at a fixed rate of $0.35/min across all AI Calling Agent packages.',
    category: 'calling'
  },
  {
    question: 'Do AI Calling Agents guarantee more sales?',
    answer: 'No. Office Pigeon does not guarantee sales, revenue, lead volume, or exact business results. AI Calling Agents are designed to help businesses respond faster, reduce missed inquiries, capture lead details more clearly, and improve customer experience.',
    category: 'calling'
  }
];
