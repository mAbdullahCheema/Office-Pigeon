/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import {
  ArrowRight,
  Bot,
  CalendarCheck,
  Check,
  ChevronDown,
  Globe,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
  Workflow,
  Zap
} from 'lucide-react';
import { BRAND } from '../config';
import { Package, PageId } from '../types';

interface PakistanProps {
  onPageChange: (page: PageId) => void;
  onOpenPackageModal: (pkg: Package) => void;
  onOpenConsultationModal: () => void;
}

interface PakistanPackage {
  name: string;
  badge?: string;
  investment: string;
  recurring?: string;
  usage?: string;
  timeline?: string;
  payment?: string;
  description: string;
  includes: string[];
  note?: string;
  type: Package['id'];
}

const sectionMotion = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.45, ease: 'easeOut' }
};

const websitePackages: PakistanPackage[] = [
  {
    type: 'pk-starter-website',
    name: 'Starter Business Website',
    badge: 'Best Starting Offer',
    investment: 'PKR 50,000',
    recurring: 'PKR 10,000/year renewal',
    timeline: 'Within 1 working day',
    payment: 'Free preview first, then 100% before launch',
    description:
      'A fast professional website that helps your business look trusted and makes it easy for customers to contact you through WhatsApp, call, form, and Google Maps.',
    includes: [
      '1-page professional website',
      'Mobile-friendly design',
      'Business introduction and services sections',
      'Gallery, reviews, Google Maps, and social links',
      'WhatsApp button, call button, and contact form',
      'Basic SEO setup with privacy policy and terms footer',
      '1 minor revision and first-year standard setup'
    ],
    note: 'Because a free preview is provided first, 100% payment is required before launch, handover, or domain/hosting connection.'
  },
  {
    type: 'pk-smart-business-website',
    name: 'Smart Business Website',
    badge: 'Best for Lead Capture',
    investment: 'Starting from PKR 140,000',
    recurring: 'Starting from PKR 60,000/year retainer',
    timeline: '2-10 working days',
    payment: '50% upfront and 50% before launch',
    description:
      'A smarter business website built to capture inquiries, organize customer details, and support a more professional customer journey.',
    includes: [
      '3-5 page professional website',
      'Premium frontend design',
      'Backend/admin features where needed',
      'Lead capture and appointment/request forms',
      'Google Sheets lead log where needed',
      'Email notifications and WhatsApp inquiry flow',
      'Speed optimization, basic SEO, privacy policy, and terms'
    ]
  },
  {
    type: 'pk-smart-commerce-website',
    name: 'Smart Commerce Website',
    investment: 'Starting from PKR 200,000',
    recurring: 'Starting from PKR 100,000/year retainer',
    timeline: '2-10 working days',
    payment: '50% upfront and 50% before launch',
    description:
      'A smart commerce website built to help your business present products professionally, receive orders, and create a smoother online buying experience.',
    includes: [
      'Product catalog, categories, and detail pages',
      'Cart and checkout where needed',
      'WhatsApp order option',
      'Payment gateway support where possible',
      'Admin/order dashboard where needed',
      'Delivery, refund, and return policy sections',
      'Mobile-friendly design with basic SEO'
    ],
    note: 'Advanced inventory, accounts, coupons, delivery rules, multi-vendor setup, CRM integrations, custom reports, and advanced automation are quoted separately.'
  }
];

const chatbotPackages: PakistanPackage[] = [
  {
    type: 'pk-smart-faq-bot',
    name: 'Smart FAQ Bot',
    investment: 'PKR 30,000 setup',
    recurring: 'PKR 5,000/month',
    usage: '10,000 AI messages/month',
    timeline: '1-3 working days',
    description:
      'Best for businesses that receive repeated customer questions and want to save staff time.',
    includes: [
      'Customized business FAQ and hours setup',
      'Floating website chat widget',
      'Recurring question handling',
      'Name, phone, and inquiry capture',
      'Direct WhatsApp routing and human handoff',
      'Multilingual customer conversations where supported',
      'Error fixes, upkeep, and up to 3 small content updates/month'
    ]
  },
  {
    type: 'pk-lead-booking-bot',
    name: 'Lead & Booking Bot',
    badge: 'Most Popular',
    investment: 'PKR 70,000 setup',
    recurring: 'PKR 15,000/month',
    usage: '20,000 AI messages/month',
    timeline: '2-5 working days',
    description:
      'Best for businesses seeking automated lead pipelines, appointment requests, and active inquiry handling.',
    includes: [
      'Everything in Smart FAQ Bot',
      'Guided customer detail capture',
      'Lead qualification flow',
      'Appointment/request capture',
      'Calendar matching where supported',
      'Google Sheets or CRM records where needed',
      'Up to 8 small content updates/month and monthly optimization'
    ]
  },
  {
    type: 'pk-ai-business-assistant',
    name: 'AI Business Assistant',
    investment: 'Starting from PKR 150,000 setup',
    recurring: 'Starting from PKR 30,000/month',
    usage: '50,000 AI messages/month',
    timeline: '5-10 working days',
    description:
      'Best for businesses wanting a central smart assistant across customer service channels, databases, and workflows.',
    includes: [
      'Everything in Lead & Booking Bot',
      'Website AI assistant and WhatsApp routing',
      'Facebook, Instagram, and Telegram where supported',
      'Advanced business knowledge setup',
      'Database and workflow automations where safely configured',
      'Customer follow-up workflows',
      'Monthly oversight, summary, and up to 20 small content updates/month'
    ]
  }
];

const callingPackages: PakistanPackage[] = [
  {
    type: 'pk-smart-call-starter',
    name: 'Smart Call Starter',
    investment: 'PKR 120,000 setup',
    recurring: 'PKR 40,000/month',
    usage: '300 AI call minutes/month',
    timeline: 'Reviewed during consultation',
    description:
      'A simple AI phone assistant for common questions, message-taking, and basic lead capture.',
    includes: [
      'Inbound AI phone agent',
      'Business FAQs, hours, services, and location answers',
      'Basic customer question handling',
      'Message-taking and lead capture',
      'Email or WhatsApp lead alerts',
      'Call summaries where supported'
    ]
  },
  {
    type: 'pk-lead-booking-caller',
    name: 'Lead & Booking Caller',
    badge: 'Most Popular',
    investment: 'PKR 250,000 setup',
    recurring: 'PKR 90,000/month',
    usage: '600 AI call minutes/month',
    timeline: 'Reviewed during consultation',
    description:
      'A managed calling agent for missed-call callbacks, website lead follow-up, and booking request collection.',
    includes: [
      'Everything in Smart Call Starter',
      'Inbound and approved outbound calling',
      'Missed-call callbacks',
      'Lead follow-up after website forms',
      'Appointment reminders',
      'Booking request collection',
      'Google Sheets or calendar workflow where needed'
    ]
  },
  {
    type: 'pk-ai-voice-operations-agent',
    name: 'AI Voice Operations Agent',
    investment: 'Starting from PKR 500,000 setup',
    recurring: 'Starting from PKR 200,000/month',
    usage: '1,500 AI call minutes/month',
    timeline: 'Reviewed during consultation',
    description:
      'A full AI voice assistant connected to operations, follow-ups, booking systems, and workflows.',
    includes: [
      'Everything in Lead & Booking Caller',
      'Advanced inbound and approved outbound workflows',
      'Customer qualification flows',
      'CRM, Google Sheets, calendar, email, or custom workflow integrations',
      'WhatsApp follow-up flows where available',
      'Review request and payment reminder calls where appropriate',
      'Monthly performance report where supported'
    ]
  }
];

const bundles: PakistanPackage[] = [
  {
    type: 'pk-online-starter',
    name: 'Online Starter',
    investment: 'PKR 50,000',
    recurring: 'PKR 10,000/year renewal',
    payment: 'Free preview first, then 100% before launch',
    description: 'A clear first step for a professional online presence.',
    includes: ['Starter Business Website', 'WhatsApp button', 'Call button', 'Google Maps', 'Contact form', 'Basic SEO', 'First-year setup']
  },
  {
    type: 'pk-website-faq-bot',
    name: 'Website + Smart FAQ Bot',
    investment: 'PKR 80,000 setup',
    recurring: 'PKR 5,000/month',
    usage: '10,000 AI messages/month',
    description: 'A website plus automated FAQ replies and simple lead collection.',
    includes: ['Starter Business Website', 'Smart FAQ Bot', 'Lead collection', 'Google Sheet/email notification', 'WhatsApp click-to-chat', 'FAQ training']
  },
  {
    type: 'pk-lead-capture-system',
    name: 'Lead Capture System',
    investment: 'PKR 200,000 setup',
    recurring: 'PKR 15,000/month',
    usage: '20,000 AI messages/month',
    description: 'A complete inquiry capture setup for service businesses.',
    includes: ['Smart Business Website', 'Lead & Booking Bot', 'Google Sheets lead log', 'Appointment/request flow', 'WhatsApp inquiry flow', 'Email lead notification']
  },
  {
    type: 'pk-smart-growth-system',
    name: 'Smart Growth System',
    investment: 'Starting from PKR 275,000 setup',
    recurring: 'Starting from PKR 30,000/month',
    usage: '50,000 AI messages/month',
    description: 'A smarter website and assistant system with lead tracking and follow-up.',
    includes: ['Smart Business Website', 'AI Business Assistant', 'Lead tracking', 'Booking workflow', 'Follow-up automation', 'CRM connection where needed', 'Monthly performance summary']
  },
  {
    type: 'pk-commerce-growth-system',
    name: 'Commerce Growth System',
    investment: 'Starting from PKR 350,000 setup',
    recurring: 'Starting from PKR 30,000/month plus commerce retainer',
    usage: '50,000 AI messages/month',
    description: 'Commerce, product inquiry support, and customer follow-up workflows.',
    includes: ['Smart Commerce Website', 'AI Business Assistant', 'Product inquiry support', 'WhatsApp inquiry flow', 'Lead/order tracking', 'Customer follow-up workflow']
  },
  {
    type: 'pk-call-recovery-system',
    name: 'Call Recovery System',
    investment: 'PKR 250,000 setup',
    recurring: 'PKR 90,000/month',
    usage: '600 AI call minutes/month',
    description: 'Recover missed calls and follow up with serious inquiries.',
    includes: ['Lead & Booking Caller', 'Missed-call follow-up', 'Website lead follow-up', 'Appointment reminders', 'Booking request collection', 'WhatsApp/email summaries']
  }
];

const benefits = [
  ['Look More Trusted', 'Present your services, photos, reviews, location, and contact options in one professional place.', Globe],
  ['Capture Better Inquiries', 'Use forms, WhatsApp flows, and smart assistants to collect useful customer details.', MessageCircle],
  ['Reply Faster', 'Let chatbots and systems answer repeated questions and route serious customers.', Zap],
  ['Reduce Missed Opportunities', 'Use calling agents and follow-up workflows to recover leads that may otherwise be lost.', Phone]
] as const;

const whatsAppOptions = [
  {
    title: 'Normal WhatsApp Click-to-Chat',
    label: 'Included by default',
    text: 'The safest and simplest option for most growing businesses, with a WhatsApp button, click-to-chat link, and prefilled customer message.'
  },
  {
    title: 'Official Meta WhatsApp Business API',
    label: 'Available where supported',
    text: 'Used for more formal WhatsApp automation. Meta charges, BSP/platform fees, templates, and usage costs are paid separately by the client.'
  },
  {
    title: 'Free Alternate WhatsApp Automation',
    label: 'Requires written risk acceptance',
    text: 'An OpenWA-style option may be available, but it is not the official Meta API and can disconnect, restrict, or risk the WhatsApp number.'
  }
];

const addOns = [
  ['Extra website section', 'PKR 10,000-20,000'],
  ['Extra website page', 'PKR 15,000-30,000'],
  ['New form', 'PKR 10,000-25,000'],
  ['Google Sheets lead log', 'PKR 10,000-20,000'],
  ['Basic CRM sheet setup', 'PKR 35,000'],
  ['Follow-up reminder system', 'PKR 35,000'],
  ['Payment gateway support', 'PKR 25,000-75,000'],
  ['Advanced admin dashboard', 'PKR 75,000+'],
  ['Custom workflow automation', 'PKR 50,000+'],
  ['New chatbot flow', 'PKR 15,000+'],
  ['New AI calling flow', 'PKR 30,000+'],
  ['Official WhatsApp API setup', 'Custom quote'],
  ['CRM integration', 'Custom quote'],
  ['Bulk product upload', 'Custom quote']
];

const faqs = [
  ['Do I need technical knowledge?', 'No. Office Pigeon handles the setup and explains everything in simple language.'],
  ['Which package should I start with?', 'If you need a fast professional online presence, start with the Starter Business Website. If you need forms, backend features, or lead tracking, choose Smart Business Website. If you sell products online, choose Smart Commerce Website.'],
  ['Why is Starter Website paid 100% before launch?', 'Office Pigeon provides a free preview first. After you approve the preview, full payment is required before launch, handover, or domain/hosting connection.'],
  ['Are WhatsApp charges included?', 'Normal WhatsApp click-to-chat is included. Official Meta WhatsApp Business API charges, BSP/platform fees, template messages, and usage-based messaging costs are paid separately by the client according to actual usage.'],
  ['Can you provide free WhatsApp automation?', 'A free alternate OpenWA-style option may be available, but it is not the official Meta API and carries risk of disconnection, restriction, or WhatsApp number ban. The client must accept that risk in writing.'],
  ['Do chatbot packages include unlimited messages?', 'No. Each chatbot package includes a monthly fair usage limit. Extra usage is PKR 2,000 per extra 10,000 AI messages.'],
  ['Do AI calling packages include unlimited minutes?', 'No. Each AI calling package includes monthly AI call minutes. Extra minutes are PKR 150/min across all AI calling packages.'],
  ['Are cold-calling campaigns included?', 'No. Standard AI calling packages are designed for approved customer communication workflows such as missed-call callbacks, lead follow-up, appointment reminders, and customer support. Cold-calling campaigns require separate review.'],
  ['Can timelines increase?', 'Yes. Timelines can increase if requirements are complex, custom, or time-consuming to develop.'],
  ['Do you guarantee leads or sales?', 'No. Office Pigeon does not guarantee leads, sales, rankings, revenue, or exact business results. The systems are designed to improve presentation, response, inquiry capture, and follow-up.']
];

const toPackage = (item: PakistanPackage): Package => ({
  id: item.type,
  name: item.name,
  price: item.investment,
  badge: item.badge,
  timeline: item.timeline || 'Timeline reviewed during consultation',
  revision: item.payment || 'Clear revision scope reviewed before work starts',
  renewal: item.recurring,
  bestFor: item.description,
  includes: item.includes,
  note: [item.recurring, item.usage, item.note].filter(Boolean).join(' | ')
});

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
      <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-orange-600 font-bold bg-white border border-black/5 px-4 py-1.5 rounded-full inline-block shadow-xs">
        {eyebrow}
      </span>
      <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.0]">
        {title}
      </h2>
      <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">{text}</p>
    </div>
  );
}

function PricingCard({ item, accent = 'orange', onOpen }: { item: PakistanPackage; accent?: 'orange' | 'rose' | 'amber'; onOpen: (pkg: Package) => void }) {
  const accentClasses = {
    orange: 'border-orange-500 ring-orange-100 text-orange-600 bg-orange-50',
    rose: 'border-rose-500 ring-rose-100 text-rose-600 bg-rose-50',
    amber: 'border-amber-500 ring-amber-100 text-amber-700 bg-amber-50'
  }[accent];

  return (
    <motion.article
      {...sectionMotion}
      className={`bg-white border p-6 sm:p-7 rounded-[32px] shadow-[0_40px_80px_rgba(0,0,0,0.03)] flex flex-col justify-between relative transition-all hover:-translate-y-1 ${
        item.badge ? `${accentClasses.split(' ')[0]} ring-4 ${accentClasses.split(' ')[1]}/40` : 'border-black/5'
      }`}
    >
      {item.badge && (
        <span className={`absolute top-0 right-6 -translate-y-1/2 text-white text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md ${accent === 'rose' ? 'bg-rose-500' : accent === 'amber' ? 'bg-amber-600' : 'bg-orange-500'}`}>
          {item.badge}
        </span>
      )}
      <div>
        <h3 className="text-2xl font-black text-gray-900 leading-tight">{item.name}</h3>
        <p className={`mt-3 text-[10px] font-mono uppercase tracking-wider font-bold ${accentClasses.split(' ')[2]}`}>
          {item.timeline || 'Timeline reviewed during consultation'}
        </p>
        <div className="mt-5 space-y-2">
          <p className="text-3xl sm:text-4xl font-black tracking-tighter text-gray-900">{item.investment}</p>
          {item.recurring && <p className="text-xs font-bold text-gray-500">{item.recurring}</p>}
          {item.usage && <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">{item.usage}</p>}
        </div>
        <p className="text-xs text-gray-500 mt-4 leading-relaxed font-medium">{item.description}</p>
        <div className="h-px bg-black/5 my-5" />
        <ul className="space-y-3">
          {item.includes.map((include) => (
            <li key={include} className="flex items-start gap-2.5 text-xs text-gray-500 leading-normal">
              <Check size={14} className={`${accentClasses.split(' ')[2]} shrink-0 mt-0.5`} strokeWidth={2.5} />
              <span>{include}</span>
            </li>
          ))}
        </ul>
        {item.note && <p className="mt-5 text-[11px] text-gray-400 leading-relaxed border-t border-black/5 pt-4">{item.note}</p>}
      </div>
      <button
        onClick={() => onOpen(toPackage(item))}
        className={`mt-7 w-full py-4 text-xs font-mono font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer focus:outline-none ${
          item.badge ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-100' : 'bg-[#F0EEEA] hover:bg-black/5 text-gray-800'
        }`}
      >
        Get Recommendation
      </button>
    </motion.article>
  );
}

function CompactInfoSection({ title, items }: { title: string; items: { heading: string; points: string[] }[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Terms"
        title={title}
        text="Clear expectations keep projects smooth, practical, and easy for business owners to understand."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.heading} className="bg-white border border-black/5 rounded-[28px] p-6 shadow-xs">
            <h3 className="text-lg font-black text-gray-900">{item.heading}</h3>
            <ul className="mt-4 space-y-2.5">
              {item.points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-xs text-gray-500">
                  <Check size={13} className="text-orange-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Pakistan({ onPageChange, onOpenPackageModal, onOpenConsultationModal }: PakistanProps) {
  return (
    <div className="space-y-24 pb-20 mt-16 font-sans overflow-hidden">
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-18 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <motion.div {...sectionMotion} className="lg:col-span-7 space-y-7">
            <span className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 px-5 py-3 rounded-full text-xs font-mono font-black uppercase tracking-wider text-orange-600 shadow-sm">
              <Sparkles size={14} className="text-orange-500" />
              Office Pigeon Pakistan
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-[64px] font-black text-gray-900 leading-[1.05] tracking-tighter uppercase">
              Professional Websites, Smart Chatbots & AI Calling Agents for Pakistani Businesses
            </h1>
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl leading-relaxed font-medium">
              Office Pigeon helps growing businesses in Pakistan look more trusted online, capture customer inquiries, reply faster, and reduce missed opportunities through modern websites, smart chatbots, and AI-powered communication systems.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onOpenConsultationModal}
                className="px-8 py-4 bg-black hover:bg-orange-500 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-full transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Get Free Recommendation <ArrowRight size={13} />
              </button>
              <button
                onClick={() => document.getElementById('pakistan-packages')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white hover:bg-[#F0EEEA] text-gray-900 text-xs font-mono font-bold uppercase tracking-widest rounded-full border border-black/10 transition-all text-center cursor-pointer"
              >
                View Pakistan Packages
              </button>
            </div>
            <p className="text-[11px] text-gray-500 font-mono uppercase tracking-wider">
              Built for clear pricing, fast delivery, WhatsApp-friendly customer journeys, and professional online systems.
            </p>
          </motion.div>

          <motion.div {...sectionMotion} className="lg:col-span-5">
            <div className="relative bg-white border border-black/5 rounded-[40px] p-5 sm:p-7 shadow-[0_45px_90px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-orange-200/35 blur-3xl" />
              <div className="relative rounded-[28px] bg-[#F0EEEA] border border-black/5 p-4 sm:p-5">
                <div className="bg-white rounded-[22px] border border-black/5 shadow-sm p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-orange-600 uppercase tracking-wider">Live inquiry system</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="h-36 sm:h-44 rounded-[18px] bg-gradient-to-br from-gray-950 via-gray-900 to-orange-950 p-4 text-white flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-orange-300" />
                      <span className="text-xs font-black uppercase">Business Website</span>
                    </div>
                    <div>
                      <p className="text-2xl font-black tracking-tighter leading-none">Book, ask, order</p>
                      <p className="text-xs text-orange-100/80 mt-2">Forms, WhatsApp, maps, and smart lead capture.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[18px] bg-orange-50 border border-orange-100 p-4">
                      <MessageCircle size={18} className="text-orange-500" />
                      <p className="text-xs font-black text-gray-900 mt-3">WhatsApp inquiry</p>
                    </div>
                    <div className="rounded-[18px] bg-rose-50 border border-rose-100 p-4">
                      <Phone size={18} className="text-rose-500" />
                      <p className="text-xs font-black text-gray-900 mt-3">Missed call follow-up</p>
                    </div>
                  </div>
                  <div className="rounded-[18px] bg-gray-50 border border-gray-100 p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black text-gray-900">Pip-style assistant</p>
                      <p className="text-[11px] text-gray-500">Captures useful customer details.</p>
                    </div>
                    <Bot size={22} className="text-orange-500 shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why it matters"
          title="Customers check first, then contact"
          text="Pakistani customers often check a business online before contacting. A clean website, clear WhatsApp inquiry flow, fast replies, and proper follow-up help a business look more professional and avoid missing serious inquiries."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map(([title, text, Icon]) => (
            <motion.div key={title} {...sectionMotion} className="bg-white border border-black/5 rounded-[28px] p-6 shadow-xs hover:-translate-y-1 transition-transform">
              <span className="w-11 h-11 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                <Icon size={18} />
              </span>
              <h3 className="mt-5 text-lg font-black text-gray-900">{title}</h3>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="pakistan-packages" className="bg-[#F0EEEA]/45 border-y border-black/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Websites"
            title="Website Packages for Pakistan"
            text="Start with a professional online presence, then grow into smarter lead capture, backend systems, and commerce when your business is ready."
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {websitePackages.map((item) => (
              <div key={item.name} className="h-full">
                <PricingCard item={item} onOpen={onOpenPackageModal} />
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-gray-500 max-w-3xl mx-auto">
            Timelines can increase if requirements are complex, custom, or time-consuming to develop. Any extra charges are mentioned beforehand at the time of purchase depending on the client's specific requirements.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Smart replies"
          title="Smart Chatbots for Faster Customer Replies"
          text="Use smart chatbot systems to answer repeated questions, collect customer details, and guide serious inquiries toward WhatsApp, forms, bookings, or your team."
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {chatbotPackages.map((item) => (
            <div key={item.name} className="h-full">
              <PricingCard item={item} accent="rose" onOpen={onOpenPackageModal} />
            </div>
          ))}
        </div>
        <div className="mt-8 bg-white border border-black/5 rounded-[28px] p-6 text-center shadow-xs">
          <p className="text-xs text-gray-500 leading-relaxed">
            One AI message means one response generated by the chatbot. Extra chatbot usage is PKR 2,000 per extra 10,000 AI messages for all chatbot packages. Official WhatsApp API charges, Meta charges, BSP/platform fees, paid CRM tools, SMS, payment gateway fees, and third-party subscriptions are separate unless clearly included in a custom proposal.
          </p>
        </div>
      </section>

      <section className="bg-white/55 border-y border-black/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="WhatsApp"
            title="WhatsApp Options"
            text="Choose the WhatsApp approach that fits your risk level, approval status, and customer journey."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whatsAppOptions.map((option) => (
              <div key={option.title} className="bg-white border border-black/5 rounded-[28px] p-6 shadow-xs">
                <MessageCircle size={22} className="text-orange-500" />
                <h3 className="mt-4 text-lg font-black text-gray-900">{option.title}</h3>
                <p className="mt-2 text-[10px] font-mono uppercase tracking-wider font-bold text-orange-600">{option.label}</p>
                <p className="mt-4 text-xs text-gray-500 leading-relaxed">{option.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="AI calling"
          title="AI Calling Agent Packages"
          text="Use managed calling agents for customer communication workflows, missed-call callbacks, lead follow-up, appointment reminders, and booking confirmations."
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {callingPackages.map((item) => (
            <div key={item.name} className="h-full">
              <PricingCard item={item} accent="amber" onOpen={onOpenPackageModal} />
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-[28px] p-6">
            <h3 className="font-black text-gray-900">Approved use cases</h3>
            <p className="text-xs text-emerald-800 mt-3 leading-relaxed">Inbound customer support, missed-call callbacks, website lead follow-up, appointment reminders, booking confirmations, review request calls, payment reminders where appropriate, and follow-up after customer consent.</p>
          </div>
          <div className="bg-rose-50 border border-rose-100 rounded-[28px] p-6">
            <h3 className="font-black text-gray-900">Not included as standard</h3>
            <p className="text-xs text-rose-800 mt-3 leading-relaxed">Random cold calls, spam calls, robocall campaigns, political calls, scam/fraud workflows, and high-risk medical, legal, or financial decisions.</p>
          </div>
        </div>
      </section>

      <section className="bg-[#F0EEEA]/45 border-y border-black/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Bundles"
            title="Complete Growth Systems"
            text="Combine websites, smart assistants, lead capture, and follow-up workflows into one practical business system."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bundles.map((item) => (
              <div key={item.name} className="h-full">
                <PricingCard item={item} onOpen={onOpenPackageModal} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Add-ons"
          title="Optional Add-Ons"
          text="All add-ons are discussed and quoted before purchase based on the client's requirements."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {addOns.map(([name, price]) => (
            <div key={name} className="bg-white border border-black/5 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
              <span className="text-xs font-bold text-gray-700">{name}</span>
              <span className="text-xs font-mono font-bold text-orange-600 text-right">{price}</span>
            </div>
          ))}
        </div>
      </section>

      <CompactInfoSection
        title="Payment Terms"
        items={[
          { heading: 'Websites', points: ['Starter preview first, then 100% before launch/handover', 'Smart Business Website: 50% upfront and 50% before launch', 'Smart Commerce Website: 50% upfront and 50% before launch'] },
          { heading: 'Chatbots & Calling Agents', points: ['Full setup fee plus first month paid before configuration starts', 'Monthly fee paid before the month starts', 'Extra usage and extra minutes billed monthly'] },
          { heading: 'Yearly Retainers', points: ['Paid yearly in advance', 'Retainers do not include new major features unless clearly stated', 'Paid tools and third-party subscriptions are separate'] }
        ]}
      />

      <CompactInfoSection
        title="Renewal & Retainer Scope"
        items={[
          { heading: 'Starter Website', points: ['Hosting/domain management where applicable', 'SSL management', 'Basic technical maintenance', 'Basic uptime check', 'Minor technical fixes'] },
          { heading: 'Smart Business Website', points: ['Backend maintenance', 'Form testing', 'Basic security/system checks', 'Minor technical fixes', 'Small content updates within fair use'] },
          { heading: 'Smart Commerce Website', points: ['Basic commerce maintenance', 'Checkout/order flow checks', 'Product/order system technical support', 'Basic payment flow support where applicable', 'Small content/product updates within fair use'] }
        ]}
      />

      <section className="bg-white/55 border-y border-black/5 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black rounded-[40px] p-8 sm:p-12 text-white shadow-xl shadow-black/10 relative overflow-hidden">
            <div className="absolute -top-24 -right-16 w-72 h-72 bg-orange-500/15 blur-3xl rounded-full" />
            <div className="relative grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 items-start">
              <div>
                <span className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full text-orange-300">
                  <ShieldCheck size={13} />
                  Clear & Honest Terms
                </span>
                <h2 className="text-3xl sm:text-5xl font-black mt-5 uppercase tracking-tighter">No scary fine print</h2>
              </div>
              <div className="space-y-4 text-sm text-gray-300 leading-relaxed font-medium">
                <p>Work begins after upfront payment. Because websites, chatbots, AI calling agents, and automations require custom planning, design, setup, and technical work, payments are non-refundable once work has started.</p>
                <p>Office Pigeon does not guarantee sales, leads, revenue, rankings, platform approval, WhatsApp approval, WhatsApp account safety, call answer rates, or exact business results.</p>
                <p>Our systems are designed to help your business look more professional, respond faster, capture inquiries more clearly, and reduce missed opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="FAQ"
          title="Common Questions"
          text="Straight answers for Pakistani business owners comparing websites, chatbots, WhatsApp options, and AI calling agents."
        />
        <div className="space-y-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group bg-white border border-black/5 rounded-2xl p-5 shadow-xs">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                <span className="text-sm font-black text-gray-900">{question}</span>
                <ChevronDown size={18} className="text-orange-500 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-xs text-gray-500 leading-relaxed">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-4">
        <div className="bg-black rounded-[40px] p-10 sm:p-14 text-white relative overflow-hidden border border-black/10 shadow-2xl shadow-black/10">
          <div className="absolute top-[-80px] right-[-60px] w-72 h-72 bg-orange-500/15 blur-3xl rounded-full pointer-events-none" />
          <div className="relative space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter">Ready to Build a Smarter Business Presence in Pakistan?</h2>
            <p className="text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Tell Office Pigeon what your business needs, and we'll recommend the right website, chatbot, calling agent, or growth system.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onOpenConsultationModal}
                className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-mono font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer"
              >
                Get Free Recommendation
              </button>
              <a
                href={`${BRAND.whatsappUrl}?text=${encodeURIComponent('Hi Office Pigeon, I want to ask about Pakistan packages.')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-100 text-black text-xs font-mono font-bold uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={14} className="text-orange-500" />
                Contact on WhatsApp
              </a>
            </div>
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
              {[
                [Globe, 'officepigeon.com'],
                [Mail, BRAND.email],
                [Headphones, BRAND.supportEmail],
                [Phone, `WhatsApp: ${BRAND.phone}`]
              ].map(([Icon, label]) => (
                <div key={label as string} className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                  <Icon size={15} className="text-orange-300 shrink-0" />
                  <span className="text-[11px] text-gray-200 font-bold break-all">{label as string}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => onPageChange('home')}
              className="text-[11px] text-gray-400 hover:text-white font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer"
            >
              Return to main Office Pigeon website
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
