/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight, Calendar, Check, FileText, Globe2, MessageSquare, PhoneCall, RefreshCw, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { CALLING_AGENT_PACKAGES } from '../config';
import { Package } from '../types';

interface CallingAgentsProps {
  onOpenPackageModal: (pkg: Package) => void;
}

const featureBlocks = [
  {
    title: 'Inbound Call Answering',
    text: 'Your AI agent can answer customer calls, explain services, collect details, and reduce missed inquiries.',
    icon: PhoneCall
  },
  {
    title: 'Approved Outbound Follow-Ups',
    text: 'Use AI calls for missed-call callbacks, appointment reminders, booking confirmations, lead follow-ups, review requests, and payment reminders where appropriate.',
    icon: RefreshCw
  },
  {
    title: 'WhatsApp Support',
    text: 'Support WhatsApp conversations where platform rules, verification, and regional availability allow it.',
    icon: MessageSquare
  },
  {
    title: 'Booking Requests and Calendar Workflows',
    text: 'Collect appointment requests, check required details, and connect to calendar or approval workflows depending on the package.',
    icon: Calendar
  },
  {
    title: 'Multilingual Customer Conversations',
    text: 'Start in your chosen setup language and respond in other supported languages based on the customer language.',
    icon: Globe2
  },
  {
    title: 'Lead Alerts and Logs',
    text: 'Send lead details to your team through supported channels such as email, WhatsApp, Google Sheets, CRM, or calendar workflows depending on package and setup.',
    icon: FileText
  },
  {
    title: 'Office Pigeon Managed Infrastructure',
    text: 'Office Pigeon manages the AI calling setup under fair usage limits so clients do not have to handle complex provider configuration themselves.',
    icon: ShieldCheck
  },
  {
    title: 'Clear Monthly Usage',
    text: 'Each package includes a monthly call-minute allowance with a fixed extra-minute rate.',
    icon: SlidersHorizontal
  }
];

const approvedOutbound = [
  'Missed-call callbacks',
  'Lead follow-up after website forms',
  'Appointment reminders',
  'Booking confirmations',
  'Review request calls',
  'Payment reminder calls where appropriate'
];

const addOns = [
  'Extra call minutes',
  'Extra phone numbers',
  'WhatsApp setup',
  'Existing number connection',
  'Live call transfer',
  'CRM integration',
  'Advanced calendar or booking integration',
  'Advanced analytics and reporting',
  'Custom outbound workflows',
  'Additional language setup',
  'Custom voice setup',
  'High-volume usage plans'
];

export default function CallingAgents({ onOpenPackageModal }: CallingAgentsProps) {
  return (
    <div className="space-y-24 pb-20 mt-16 font-sans overflow-hidden">
      <section className="bg-gradient-to-b from-orange-50/20 via-transparent to-transparent pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-orange-600 font-bold bg-orange-50 px-3.5 py-1.5 rounded-full">
            AI CALLING AGENTS
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight max-w-4xl mx-auto">
            Answer calls, capture leads, and book customers automatically with a 24/7 AI Calling Agent.
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Office Pigeon builds AI phone and WhatsApp agents that answer customer questions, collect lead details, handle booking requests, send follow-ups, and notify your team, all under clear monthly usage limits.
          </p>
          <p className="text-xs sm:text-sm text-orange-700 max-w-xl mx-auto leading-relaxed font-semibold bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3">
            Never miss another serious customer inquiry because your business was busy, closed, or slow to respond.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenPackageModal(CALLING_AGENT_PACKAGES[1])}
              className="w-full sm:w-auto px-6 py-3.5 bg-gray-900 hover:bg-orange-500 text-white font-sans text-xs font-bold rounded-2xl cursor-pointer transition-colors shadow-md shadow-gray-200 focus:outline-none"
            >
              Configure Calling Agent
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('calling-pricing');
                if (el) window.scrollTo({ top: el.offsetTop });
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gray-200 text-gray-700 font-sans text-xs font-semibold rounded-2xl hover:bg-gray-50 transition-colors"
            >
              View Calling Packages
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-5">
            <span className="text-[9px] font-mono tracking-widest uppercase text-orange-600 font-bold">CALL RESPONSE LAYER</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              A managed voice assistant for the calls your team cannot always catch
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              AI Calling Agents support both inbound and approved outbound use cases. Cold calling campaigns are not included in standard packages and may require separate review.
            </p>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Office Pigeon agents can start in the language chosen during setup and can respond in other supported languages based on the customer language. English is the primary setup language, with multilingual customer conversations available where supported.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {featureBlocks.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="bg-white border border-gray-100 p-6 rounded-3xl space-y-2 shadow-xs hover:translate-y-[-2px] transition-transform">
                  <span className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Icon size={16} />
                  </span>
                  <h3 className="font-bold text-sm text-gray-900 pt-1">{feature.title}</h3>
                  <p className="text-[11px] text-gray-400 leading-normal">{feature.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="calling-pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-mono tracking-widest uppercase text-orange-600 font-bold">AI CALLING PRICING</span>
          <h2 className="text-3xl font-black text-gray-900">Clear monthly call-minute packages</h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Each plan includes a monthly fair usage allowance of AI call minutes. Extra minutes are billed at a fixed rate of $0.35/min across all packages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CALLING_AGENT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white border rounded-3xl p-7 flex flex-col justify-between relative shadow-xs transition-transform hover:translate-y-[-4px] ${
                pkg.badge ? 'border-orange-200 ring-4 ring-orange-50/50' : 'border-gray-100'
              }`}
            >
              {pkg.badge && (
                <span className="absolute top-0 right-6 -translate-y-1/2 bg-orange-600 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  {pkg.badge}
                </span>
              )}
              <div>
                <h4 className="font-bold text-lg text-gray-900">{pkg.name}</h4>
                <p className="text-[10px] text-orange-600 uppercase tracking-widest font-mono font-bold mt-1">{pkg.timeline}</p>
                <div className="mt-4 flex flex-wrap items-baseline gap-x-1">
                  <span className="text-3xl font-black text-gray-900">{pkg.price.split(' setup')[0]}</span>
                  <span className="text-xs text-gray-400 font-medium">setup + {pkg.price.split('+ ')[1]}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-2 font-medium">{pkg.bestFor}</p>
                <div className="h-px bg-gray-100 my-5" />
                <ul className="space-y-3">
                  {pkg.includes.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                      <Check size={14} className="text-orange-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-gray-400 mt-5 leading-normal italic">{pkg.note}</p>
              </div>
              <button
                onClick={() => onOpenPackageModal(pkg)}
                className={`mt-8 w-full py-4 text-xs font-bold rounded-2xl text-center cursor-pointer transition-all ${
                  pkg.badge ? 'bg-orange-600 text-white shadow-lg shadow-orange-100 hover:bg-orange-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Configure {pkg.name}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-3xl text-xs text-orange-800 leading-relaxed space-y-2">
          <p>
            Usage includes AI-handled phone conversations and may vary depending on call length, customer behavior, provider rules, and supported channels.
          </p>
          <p>
            Standard plans include Office Pigeon-managed AI calling infrastructure up to the included fair usage limits. Unusual international routing, premium-rate numbers, high-volume WhatsApp messaging, special provider requirements, or custom carrier setups may require separate review or additional charges.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xs space-y-5">
            <span className="text-[10px] font-mono tracking-widest uppercase text-orange-600 font-bold">Approved outbound</span>
            <h2 className="text-2xl font-black text-gray-900">Follow-ups without advertising cold calling as standard</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {approvedOutbound.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-gray-500">
                  <Check size={14} className="text-orange-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xs space-y-5">
            <span className="text-[10px] font-mono tracking-widest uppercase text-orange-600 font-bold">Numbers and WhatsApp</span>
            <p className="text-xs text-gray-500 leading-relaxed">
              Office Pigeon can provide and manage a new Twilio-powered number for your AI Calling Agent. Clients may also request setup with their own existing number, but this can require extra steps from their phone provider, Twilio, WhatsApp, or verification systems.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              WhatsApp support is available where supported by provider rules, business verification, and regional availability. WhatsApp setup may require business verification and approval from third-party platforms. Messaging costs are included up to fair usage where applicable, and extra usage may be billed separately.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-mono tracking-widest uppercase text-orange-600 font-bold">CUSTOM UPGRADES</span>
          <h2 className="text-3xl font-black text-gray-900">Available add-ons</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {addOns.map((item) => (
            <div key={item} className="bg-white border border-gray-100 rounded-2xl p-4 text-xs text-gray-500 font-semibold shadow-xs">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-950 rounded-3xl p-8 sm:p-10 text-white space-y-4 shadow-xl">
          <span className="text-[10px] font-mono tracking-widest uppercase text-orange-300 font-bold">Compliance note</span>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            AI Calling Agents may collect call summaries, transcripts, lead details, and conversation data for service quality, follow-up, and business operations where supported. Availability of call handling, outbound calling, WhatsApp features, transcripts, and integrations may depend on local laws, customer consent requirements, provider approval, regional availability, and third-party platform rules. Office Pigeon does not guarantee sales, revenue, lead volume, platform approval, or legal compliance for a client specific industry or location. Businesses are responsible for using AI Calling Agents in a compliant and appropriate way.
          </p>
          <button
            onClick={() => onOpenPackageModal(CALLING_AGENT_PACKAGES[1])}
            className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-sans text-xs font-bold rounded-2xl cursor-pointer inline-flex items-center gap-1.5 transition-colors"
          >
            Discuss AI Calling Setup
            <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}
